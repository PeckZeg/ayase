import { DerivedStateFromPropsMixin } from '@ayase/vc-util/lib/mixins';
import { CSSProperties, VNode, Ref, defineComponent, ref } from 'vue';
import CSSMotion, { CSSMotionProps } from '@ayase/vc-motion';
import PopupInner from './PopupInner';
import Align from '@ayase/vc-align';

import {
  TouchEventHandler,
  MouseEventHandler,
  ClassList
} from '@ayase/vc-util/lib/types';

import {
  TransitionNameType,
  AnimationType,
  StretchType,
  AlignType,
  Point
} from './interface';

import { getMotion } from './utils/legacyUtil';
import raf from 'raf';

import {
  getListeners,
  getListener,
  getStyle
} from '@ayase/vc-util/lib/instance';
import { toEmitsList } from '@ayase/vc-util/lib';

/**
 * Popup should follow the steps for each component work correctly:
 * measure - check for the current stretch size
 * align - let component align the position
 * aligned - re-align again in case additional className changed the size
 * afterAlign - choice next step is trigger motion or finished
 * beforeMotion - should reset motion to invisible so that CSSMotion can do normal motion
 * motion - play the motion
 * stable - everything is done
 */
type PopupStatus =
  | null
  | 'measure'
  | 'align'
  | 'aligned'
  | 'afterAlign'
  | 'beforeMotion'
  | 'motion'
  | 'AfterMotion'
  | 'stable';

interface PopupProps {
  visible?: boolean;
  // style?: React.CSSProperties;
  getClassFromAlign?: (align: AlignType) => ClassList;
  // onAlign?: (element: HTMLElement, align: AlignType) => void;
  getRootDomNode?: () => HTMLElement;
  align?: AlignType;
  destroyPopupOnHide?: boolean;
  // className?: string;
  prefixCls: string;
  // onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  // onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  // onMouseDown?: React.MouseEventHandler<HTMLElement>;
  // onTouchStart?: React.TouchEventHandler<HTMLElement>;
  stretch?: StretchType;
  // children?: React.ReactNode;
  point?: Point;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion: CSSMotionProps;
  maskMotion: CSSMotionProps;

  // Legacy
  animation: AnimationType;
  transitionName: TransitionNameType;
  maskAnimation: AnimationType;
  maskTransitionName: TransitionNameType;
}

interface PopupState {
  targetWidth: number;
  targetHeight: number;

  status: PopupStatus;
  prevVisible: boolean;
  alignClass: ClassList;

  /** Record for CSSMotion is working or not */
  inMotion: boolean;
}

interface PopupRawBindings {
  popupRef: Ref<HTMLDivElement>;
  alignRef: Ref<AlignRefType>;
}

interface AlignRefType {
  forceAlign: () => void;
}

type OnAlign = (element: HTMLElement, align: AlignType) => void;

function supportMotion(motion: CSSMotionProps) {
  return motion && motion.motionName;
}

export default defineComponent<
  PopupProps,
  PopupRawBindings,
  { state: PopupState }
>({
  name: 'Popup',
  inheritAttrs: false,
  mixins: [DerivedStateFromPropsMixin],

  props: {
    visible: { type: Boolean, default: undefined },
    getClassFromAlign: { type: Function, default: undefined },
    getRootDomNode: { type: Function, default: undefined },
    align: { type: Object, default: undefined },
    destroyPopupOnHide: { type: Boolean, default: undefined },
    prefixCls: { type: String },
    stretch: { type: String },
    point: { type: Object, default: undefined },
    zIndex: { type: Number, default: undefined },
    mask: { type: Boolean, default: undefined },
    motion: { type: [String, Object], default: undefined },
    maskMotion: { type: [String, Object], default: undefined },
    animation: { type: String },
    transitionName: { type: String },
    maskAnimation: { type: String },
    maskTransitionName: { type: String }
  } as undefined,

  emits: toEmitsList(
    'onAlign',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseDown',
    'onTouchStart',
    'onEnterStart',
    'onAppearStart',
    'onLeaveStart'
  ),

  data() {
    return {
      state: {
        targetWidth: undefined,
        targetHeight: undefined,

        status: null,
        prevVisible: null, // eslint-disable-line react/no-unused-state
        alignClass: null,

        inMotion: false
      }
    };
  },

  getDerivedStateFromProps(
    { visible, ...props }: PopupProps,
    { prevVisible, status, inMotion }: PopupState
  ) {
    const newState: Partial<PopupState> = { prevVisible: visible, status };
    const mergedMotion = getMotion(props);

    if (prevVisible === null && visible === false) {
      // Init render should always be stable
      newState.status = 'stable';
      newState.inMotion = false;
    } else if (visible !== prevVisible) {
      newState.inMotion = false;

      if (visible || (supportMotion(mergedMotion) && inMotion)) {
        newState.status = null;
      } else {
        newState.status = 'stable';
      }

      if (visible) {
        newState.alignClass = null;
      }
    }

    return newState;
  },

  mounted() {
    this.onComponentUpdated();
  },

  updated() {
    this.onComponentUpdated();
  },

  beforeUpdate() {
    this.cancelFrameState();
  },

  methods: {
    onComponentUpdated() {
      const { getRootDomNode, visible, stretch } = this.$props as PopupProps;
      const { status } = this.state;

      // If there is a pending state update, cancel it, a new one will be set if necessary
      this.cancelFrameState();

      if (visible && status !== 'stable') {
        switch (status) {
          case null: {
            this.setStateOnNextFrame({ status: stretch ? 'measure' : 'align' });
            break;
          }

          case 'afterAlign': {
            this.setStateOnNextFrame({
              status: supportMotion(this.getMotion())
                ? 'beforeMotion'
                : 'stable'
            });
            break;
          }

          case 'AfterMotion': {
            this.setStateOnNextFrame({
              status: 'stable'
            });
            break;
          }

          default: {
            // Go to next status
            const queue: PopupStatus[] = [
              'measure',
              'align',
              null,
              'beforeMotion',
              'motion'
            ];
            const index = queue.indexOf(status);
            const nextStatus = queue[index + 1];
            if (index !== -1 && nextStatus) {
              this.setStateOnNextFrame({ status: nextStatus });
            }
          }
        }
      }

      // Measure stretch size
      if (status === 'measure') {
        const $ele = getRootDomNode();
        if ($ele) {
          this.setStateOnNextFrame({
            targetHeight: $ele.offsetHeight,
            targetWidth: $ele.offsetWidth
          });
        }
      }
    },

    onAlign(popupDomNode: HTMLElement, align: AlignType) {
      const { getClassFromAlign } = this.$props as PopupProps;
      const { status } = this.state as PopupState;
      const onAlign = getListener<OnAlign>(this, 'onAlign');
      const alignClass = getClassFromAlign(align);

      if (status === 'align') {
        Object.assign(this.state, { alignClass, status: 'aligned' });
        this.$nextTick(() => {
          this.alignRef.forceAlign();
        });
      } else if (status === 'aligned') {
        Object.assign(this.state, { alignClass, status: 'afterAlign' });

        if (onAlign) {
          onAlign(popupDomNode, align);
        }
      } else {
        this.state.alignClass = alignClass;
      }
    },

    onMotionEnd() {
      const { visible }: PopupProps = this.$props;

      Object.assign(this.state, {
        status: visible ? 'AfterMotion' : 'stable',
        inMotion: false
      });
    },

    setStateOnNextFrame(state: Partial<PopupState>) {
      this.cancelFrameState();
      this.nextFrameState = { ...this.nextFrameState, ...state };

      this.nextFrameId = raf(() => {
        const submitState = { ...this.nextFrameState };
        this.nextFrameState = null;
        Object.assign(this.state, submitState);
      });
    },

    getMotion() {
      return { ...getMotion(this.$props) };
    },

    // `target` on `rc-align` can accept as a function to get the bind element or a point.
    getAlignTarget() {
      const { point, getRootDomNode } = this.$props as PopupProps;

      if (point) {
        return point;
      }

      return getRootDomNode;
    },

    getZIndexStyle(): CSSProperties {
      const { zIndex } = this.$props as PopupProps;
      return { zIndex };
    },

    cancelFrameState() {
      raf.cancel(this.nextFrameId);
    },

    renderPopupElement() {
      const {
        destroyPopupOnHide,
        prefixCls,
        stretch,
        visible,
        align
      }: PopupProps = this.$props;

      const children: VNode = this.$slots.default();

      const {
        targetHeight,
        targetWidth,
        alignClass,
        status
      }: PopupState = this.state;

      // prettier-ignore
      const [onMouseEnter, onMouseLeave, onMouseDown] = getListeners<MouseEventHandler>(
        this,
        'onMouseEnter',
        'onMouseLeave',
        'onMouseDown'
      );

      const onTouchStart = getListener<TouchEventHandler>(this, 'onTouchStart');

      const mergedClass = [prefixCls, alignClass];
      const hiddenClass = `${prefixCls}-hidden`;

      // ================== Style ==================
      const sizeStyle: CSSProperties = {};

      if (stretch) {
        // Stretch with target
        if (stretch.indexOf('height') !== -1) {
          sizeStyle.height = `${targetHeight}px`;
        } else if (stretch.indexOf('minHeight') !== -1) {
          sizeStyle.minHeight = `${targetHeight}px`;
        }
        if (stretch.indexOf('width') !== -1) {
          sizeStyle.width = `${targetWidth}px`;
        } else if (stretch.indexOf('minWidth') !== -1) {
          sizeStyle.minWidth = `${targetWidth}px`;
        }
      }

      const mergedStyle: CSSProperties = {
        ...sizeStyle,
        ...this.getZIndexStyle(),
        ...getStyle(this),
        opacity: status === 'stable' || !visible ? undefined : 0
      };

      // ================= Motions =================
      const mergedMotion: CSSMotionProps = this.getMotion();
      let mergedMotionVisible = visible;

      if (
        visible &&
        status !== 'beforeMotion' &&
        status !== 'motion' &&
        status !== 'stable'
      ) {
        mergedMotion.motionAppear = false;
        mergedMotion.motionEnter = false;
        mergedMotion.motionLeave = false;
      }

      if (status === 'afterAlign' || status === 'beforeMotion') {
        mergedMotionVisible = false;
      }

      // Update trigger to tell if is in motion
      ['onEnterStart', 'onAppearStart', 'onLeaveStart'].forEach((event) => {
        const originFunc = getListener<Function>(this, event);

        mergedMotion[event] = (...args) => {
          originFunc?.(...args);
          this.state.inMotion = true;
        };
      });

      // ================== Align ==================
      const mergedAlignDisabled =
        !visible ||
        (status !== 'align' && status !== 'aligned' && status !== 'stable');

      // ================== Popup ==================
      let mergedPopupVisible = true;

      if (status === 'stable') {
        mergedPopupVisible = visible;
      }

      // Only remove popup since mask may still need animation
      if (destroyPopupOnHide && !mergedPopupVisible) {
        return null;
      }

      const motionProps: CSSMotionProps = {
        visible: mergedMotionVisible,
        ...mergedMotion,
        removeOnLeave: false,
        leavedClass: hiddenClass
      };

      return (
        <CSSMotion
          {...motionProps}
          // @ts-ignore
          onEnterEnd={this.onMotionEnd}
          onLeaveEnd={this.onMotionEnd}
          v-slots={{
            default: ({
              class: motionClass,
              style: motionStyle,
              ref: motionRef
            }) => {
              // console.log(motionRef);
              return (
                <Align
                  ref="alignRef"
                  key="popup"
                  target={this.getAlignTarget()}
                  monitorWindowResize
                  disabled={mergedAlignDisabled}
                  align={align}
                  // @ts-ignore
                  onAlign={this.onAlign}
                >
                  <PopupInner
                    prefixCls={prefixCls}
                    class={[mergedClass, motionClass]}
                    style={{ ...mergedStyle, ...motionStyle }}
                    ref={motionRef}
                    // @ts-ignore
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                  >
                    {children}
                  </PopupInner>
                </Align>
              );
            }
          }}
        />
      );
    },

    renderMaskElement() {
      const {
        maskTransitionName,
        maskAnimation,
        maskMotion,
        prefixCls,
        visible,
        mask
      } = this.$props as PopupProps;

      if (!mask) {
        return null;
      }

      let motion: CSSMotionProps = {};

      if (maskMotion && maskMotion.motionName) {
        motion = {
          motionAppear: true,
          ...getMotion({
            motion: maskMotion,
            prefixCls,
            transitionName: maskTransitionName,
            animation: maskAnimation
          })
        };
      }

      const motionProps: CSSMotionProps = {
        ...motion,
        visible,
        removeOnLeave: true
      };

      return (
        <CSSMotion
          {...motionProps}
          v-slots={{
            default: (props) => (
              <div
                key="mask"
                class={`${prefixCls}-mask`}
                style={this.getZIndexStyle()}
                {...props}
              />
            )
          }}
        />
      );
    }
  },

  setup() {
    return {
      popupRef: ref<HTMLDivElement>(null),
      alignRef: ref<AlignRefType>(null)
    };
  },

  render() {
    return (
      <div>
        {this.renderMaskElement()}
        {this.renderPopupElement()}
      </div>
    );
  }
});
