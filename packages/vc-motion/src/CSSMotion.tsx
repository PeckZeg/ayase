import { DerivedStateFromPropsMixin } from '@ayase/vc-util/lib/vue/mixins';
import { CSSProperties, defineComponent } from 'vue';

import { getListeners } from '@ayase/vc-util/lib/vue/instance';
import { toEmitsList } from '@ayase/vc-util/lib/vue';
import raf from 'raf';

import {
  getTransitionName,
  transitionEndName,
  supportTransition,
  animationEndName
} from './util/motion';

const STATUS_NONE = 'none' as const;
const STATUS_APPEAR = 'appear' as const;
const STATUS_ENTER = 'enter' as const;
const STATUS_LEAVE = 'leave' as const;

export type MotionStatus =
  | typeof STATUS_NONE
  | typeof STATUS_APPEAR
  | typeof STATUS_ENTER
  | typeof STATUS_LEAVE;

export type MotionEvent = (TransitionEvent | AnimationEvent) & {
  deadline?: boolean;
};

export type MotionEventHandler = (
  element: HTMLElement,
  event: MotionEvent
) => CSSProperties | void;

export type MotionEndEventHandler = (
  element: HTMLElement,
  event: MotionEvent
) => boolean | void;

export type MotionName =
  | string
  | {
      appear?: string;
      enter?: string;
      leave?: string;
      appearActive?: string;
      enterActive?: string;
      leaveActive?: string;
    };

export interface CSSMotionProps {
  motionName?: MotionName;
  visible?: boolean;
  motionAppear?: boolean;
  motionEnter?: boolean;
  motionLeave?: boolean;
  motionLeaveImmediately?: boolean;
  motionDeadline?: number;
  removeOnLeave?: boolean;
  leavedClass?: string;
  eventProps?: object;

  // onAppearStart?: MotionEventHandler;
  // onEnterStart?: MotionEventHandler;
  // onLeaveStart?: MotionEventHandler;
  //
  // onAppearActive?: MotionEventHandler;
  // onEnterActive?: MotionEventHandler;
  // onLeaveActive?: MotionEventHandler;
  //
  // onAppearEnd?: MotionEndEventHandler;
  // onEnterEnd?: MotionEndEventHandler;
  // onLeaveEnd?: MotionEndEventHandler;

  // internalRef?: Ref<any>;

  // children?: (
  //   props: {
  //     className?: string;
  //     style?: CSSProperties;
  //     [key: string]: any;
  //   },
  //   ref: (node: any) => void
  // ) => VNode;
}

export interface CSSMotionState {
  status?: MotionStatus;
  statusActive?: boolean;
  newStatus?: boolean;
  statusStyle?: CSSProperties;
  prevProps?: CSSMotionProps;
}

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(transitionSupport: boolean) {
  function isSupportTransition(props: CSSMotionProps) {
    return !!(props.motionName && transitionSupport);
  }

  return defineComponent<CSSMotionProps, {}, { state: CSSMotionState }>({
    name: 'CSSMotion',
    mixins: [DerivedStateFromPropsMixin],

    props: {
      motionName: { type: String, default: undefined },
      visible: { type: Boolean, default: true },
      motionAppear: { type: Boolean, default: true },
      motionEnter: { type: Boolean, default: true },
      motionLeave: { type: Boolean, default: true },
      motionLeaveImmediately: { type: Boolean, default: undefined },
      motionDeadline: { type: Number, default: undefined },
      removeOnLeave: { type: Boolean, default: true },
      leavedClass: { type: undefined, default: undefined },
      eventProps: { type: Object, default: undefined }
    } as undefined,

    emits: toEmitsList(
      'onAppearStart',
      'onEnterStart',
      'onLeaveStart',
      'onAppearActive',
      'onEnterActive',
      'onLeaveActive',
      'onAppearEnd',
      'onEnterEnd',
      'onLeaveEnd'
    ),

    data() {
      return {
        state: {
          status: STATUS_NONE,
          statusActive: false,
          newStatus: false,
          statusStyle: null
        }
      };
    },

    getDerivedStateFromProps(props, prevState) {
      if (!isSupportTransition(props)) {
        return {};
      }

      const {
        visible,
        motionAppear,
        motionEnter,
        motionLeave,
        motionLeaveImmediately
      } = props;

      const { prevProps, status: prevStatus } = prevState;

      const newState: Partial<CSSMotionState> = {
        ...prevState,
        prevProps: { ...props }
      };

      // Clean up status if prop set to false
      if (
        (prevStatus === STATUS_APPEAR && !motionAppear) ||
        (prevStatus === STATUS_ENTER && !motionEnter) ||
        (prevStatus === STATUS_LEAVE && !motionLeave)
      ) {
        newState.status = STATUS_NONE;
        newState.statusActive = false;
        newState.newStatus = false;
      }

      // Appear
      if (!prevProps && visible && motionAppear) {
        newState.status = STATUS_APPEAR;
        newState.statusActive = false;
        newState.newStatus = true;
      }

      // Enter
      if (prevProps && !prevProps.visible && visible && motionEnter) {
        newState.status = STATUS_ENTER;
        newState.statusActive = false;
        newState.newStatus = true;
      }

      // Leave
      if (
        (prevProps && prevProps.visible && !visible && motionLeave) ||
        (!prevProps && motionLeaveImmediately && !visible && motionLeave)
      ) {
        newState.status = STATUS_LEAVE;
        newState.statusActive = false;
        newState.newStatus = true;
      }

      return newState;
    },

    mounted() {
      this.onDomUpdate();
    },

    updated() {
      this.onDomUpdate();
    },

    beforeUnmount() {
      this.destroyed = true;
      this.removeEventListener(this.$cacheEle);
      this.cancelNextFrame();
      clearTimeout(this.deadlineId);
    },

    methods: {
      onDomUpdate() {
        if (!isSupportTransition(this.$props)) {
          return;
        }

        const { motionAppear, motionEnter, motionLeave } = this.$props;
        const { status, newStatus } = this.state;
        const [
          onAppearStart,
          onEnterStart,
          onLeaveStart,
          onAppearActive,
          onEnterActive,
          onLeaveActive
        ] = getListeners<MotionEventHandler>(
          this,
          'onAppearStart',
          'onEnterStart',
          'onLeaveStart',
          'onAppearActive',
          'onEnterActive',
          'onLeaveActive'
        );

        // Event injection
        const $ele = this.getElement();

        if (this.$cacheEle !== $ele) {
          this.removeEventListener(this.$cacheEle);
          this.addEventListener($ele);
          this.$cacheEle = $ele;
        }

        // Init status
        if (newStatus && status === STATUS_APPEAR && motionAppear) {
          this.updateStatus(onAppearStart, null, null, () => {
            this.updateActiveStatus(onAppearActive, STATUS_APPEAR);
          });
        } else if (newStatus && status === STATUS_ENTER && motionEnter) {
          this.updateStatus(onEnterStart, null, null, () => {
            this.updateActiveStatus(onEnterActive, STATUS_ENTER);
          });
        } else if (newStatus && status === STATUS_LEAVE && motionLeave) {
          this.updateStatus(onLeaveStart, null, null, () => {
            this.updateActiveStatus(onLeaveActive, STATUS_LEAVE);
          });
        }
      },

      onMotionEnd(event: MotionEvent) {
        if (event && !event.deadline && event.target !== this.getElement()) {
          // event exists
          // not initiated by deadline
          // transitionend not fired by inner elements
          return;
        }

        const { status, statusActive } = this.state;

        const [onAppearEnd, onEnterEnd, onLeaveEnd] = getListeners<
          MotionEndEventHandler
        >(this, 'onAppearEnd', 'onEnterEnd', 'onLeaveEnd');

        if (status === STATUS_APPEAR && statusActive) {
          this.updateStatus(onAppearEnd, { status: STATUS_NONE }, event);
        } else if (status === STATUS_ENTER && statusActive) {
          this.updateStatus(onEnterEnd, { status: STATUS_NONE }, event);
        } else if (status === STATUS_LEAVE && statusActive) {
          this.updateStatus(onLeaveEnd, { status: STATUS_NONE }, event);
        }
      },

      setNodeRef(node: any) {
        this.node = node;
      },

      getElement() {
        if (this.node) {
          return this.node;
        }

        /**
         * Fallback to cache element.
         * This is only happen when `motionDeadline` trigger but element removed.
         */
        return this.$cacheEle;
      },

      addEventListener($ele: HTMLElement) {
        if (!$ele) return;

        $ele.addEventListener(transitionEndName, this.onMotionEnd);
        $ele.addEventListener(animationEndName, this.onMotionEnd);
      },

      removeEventListener($ele: HTMLElement) {
        if (!$ele) return;

        $ele.removeEventListener(transitionEndName, this.onMotionEnd);
        $ele.removeEventListener(animationEndName, this.onMotionEnd);
      },

      updateStatus(
        styleFunc: MotionEventHandler | MotionEndEventHandler,
        additionalState: Partial<CSSMotionState>,
        event?: MotionEvent,
        callback?: (timestamp?: number) => void
      ) {
        const statusStyle = styleFunc
          ? styleFunc(this.getElement(), event)
          : null;

        if (statusStyle === false || this.destroyed) {
          return;
        }

        let nextStep;

        if (callback) {
          nextStep = () => {
            this.nextFrame(callback);
          };
        }

        Object.assign(this.state, {
          statusStyle: typeof statusStyle === 'object' ? statusStyle : null,
          newStatus: false,
          ...additionalState
        });

        if (nextStep) {
          this.$nextTick(() => {
            nextStep();
          });
        }
      },

      updateActiveStatus(
        styleFunc: MotionEventHandler,
        currentStatus: MotionStatus
      ) {
        this.nextFrame(() => {
          const { status } = this.state;

          if (status !== currentStatus) {
            return;
          }

          const { motionDeadline } = this.$props;

          this.updateStatus(styleFunc, { statusActive: true });

          if (motionDeadline > 0) {
            this.deadlineId = setTimeout(() => {
              this.onMotionEnd({ deadline: true } as MotionEvent);
            }, motionDeadline);
          }
        });
      },

      nextFrame(func: (timestamp?: number) => void) {
        this.cancelNextFrame();
        this.raf = raf(func);
      },

      cancelNextFrame() {
        if (this.raf) {
          raf.cancel(this.raf);
          this.raf = null;
        }
      }
    },

    render(ctx) {
      const { status, statusActive, statusStyle } = ctx.state;
      const children = ctx.$slots.default;

      const {
        removeOnLeave,
        leavedClass,
        motionName,
        eventProps,
        visible
      } = ctx.$props;

      if (!children) {
        return null;
      }

      if (status === STATUS_NONE || !isSupportTransition(ctx.$props)) {
        if (visible) {
          return children({ ...eventProps, ref: ctx.setNodeRef });
        }

        if (!removeOnLeave) {
          return children(
            { ...eventProps, class: leavedClass },
            ctx.setNodeRef
          );
        }

        return null;
      }

      return children({
        ...eventProps,
        class: [
          getTransitionName(motionName, status),
          {
            [getTransitionName(motionName, `${status}-active`)]: statusActive,
            [motionName]: typeof motionName === 'string'
          }
        ],
        style: statusStyle,
        ref: ctx.setNodeRef
      });
    }
  });
}

export default genCSSMotion(supportTransition);
