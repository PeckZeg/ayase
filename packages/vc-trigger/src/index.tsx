import { DerivedStateFromPropsMixin } from '@ayase/vc-util/lib/mixins';
import { ClassList } from '@ayase/vc-util/lib/types';
import { CSSMotionProps } from '@ayase/vc-motion';
import Portal from '@ayase/vc-util/lib/Portal';
import TriggerContext from './context';
import Popup from './Popup';

import {
  ComponentPublicInstance,
  CSSProperties,
  VNode,
  Ref,
  defineComponent,
  cloneVNode,
  computed,
  inject,
  ref
} from 'vue';

import {
  CommonEventHandler,
  AnimationType,
  ActionType,
  AlignType,
  Point,
  BuildInPlacements,
  TransitionNameType
} from './interface';

import { getAlignPopupClass, getAlignFromPlacement } from './utils/alignUtil';
import { getListener, getPropOrSlot } from '@ayase/vc-util/lib/instance';
import addEventListener from '@ayase/vc-util/lib/Dom/addEventListener';
import { getVNodeListener } from '@ayase/vc-util/lib/vnode';
import contains from '@ayase/vc-util/lib/Dom/contains';
import { composeRef } from '@ayase/vc-util/lib/ref';

import {
  returnEmptyString,
  returnEmptyObject,
  returnEmptyArray,
  returnDocument,
  toEmitsList
} from '@ayase/vc-util/lib';

const ALL_HANDLERS = [
  'onClick',
  'onMouseDown',
  'onTouchStart',
  'onMouseEnter',
  'onMouseLeave',
  'onFocus',
  'onBlur',
  'onContextMenu'
];

export interface TriggerProps {
  // children: React.ReactElement;
  action?: ActionType | ActionType[];
  showAction?: ActionType[];
  hideAction?: ActionType[];
  getPopupNameFromAlign?: (align: AlignType) => string;
  // onPopupVisibleChange?: (visible: boolean) => void;
  // afterPopupVisibleChange?: (visible: boolean) => void;
  popup: VNode | VNode[] | (() => VNode | VNode[]) | JSX.Element | JSX.Element[] | (() => JSX.Element | JSX.Element[]);
  popupStyle?: CSSProperties;
  prefixCls?: string;
  popupClass?: ClassList;
  // className?: string;
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  focusDelay?: number;
  blurDelay?: number;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  getDocument?: () => HTMLDocument;
  forceRender?: boolean;
  destroyPopupOnHide?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  // onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
  popupAlign?: AlignType;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  autoDestroy?: boolean;

  stretch?: string;
  alignPoint?: boolean; // Maybe we can support user pass position in the future

  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;

  /** @deprecated Please us `popupMotion` instead. */
  popupTransitionName?: TransitionNameType;
  /** @deprecated Please us `popupMotion` instead. */
  popupAnimation?: AnimationType;
  /** @deprecated Please us `maskMotion` instead. */
  maskTransitionName?: TransitionNameType;
  /** @deprecated Please us `maskMotion` instead. */
  maskAnimation?: string;

  /**
   * @private Get trigger DOM node.
   * Used for some component is function component which can not access by `findDOMNode`
   */
  getTriggerDOMNode?: (node: ComponentPublicInstance) => HTMLElement;
}

export interface TriggerRawBindings {
  popupRef: Ref<typeof Popup>;
  triggerRef: Ref<ComponentPublicInstance>;
}

export interface TriggerState {
  prevPopupVisible: boolean;
  popupVisible: boolean;
  point?: Point;
}

export { BuildInPlacements };

export function generateTrigger(PortalComponent: any) {
  return defineComponent<TriggerProps, TriggerRawBindings, { state: TriggerState }>({
    name: 'Trigger',
    mixins: [DerivedStateFromPropsMixin],

    provide() {
      return {
        [TriggerContext as any]: computed(() => this)
      };
    },

    // TODO: vue-types for vue3
    props: {
      action: { type: [String, Array], default: returnEmptyArray },
      showAction: { type: Array, default: returnEmptyArray },
      hideAction: { type: Array, default: returnEmptyArray },
      getPopupNameFromAlign: { type: Function, default: returnEmptyString },
      popup: { type: undefined },
      popupStyle: { type: Object, default: returnEmptyObject },
      prefixCls: { type: String, default: 'vc-trigger-popup' },
      popupClass: { type: [String, Object, Array], default: '' },
      popupPlacement: { type: String },

      builtinPlacements: { type: Object },
      mouseEnterDelay: { type: Number, default: 0 },
      mouseLeaveDelay: { type: Number, default: 0.1 },
      zIndex: { type: Number },
      focusDelay: { type: Number, default: 0 },
      blurDelay: { type: Number, default: 0.15 },
      getPopupContainer: { type: Function },
      getDocument: { type: Function, default: returnDocument },
      forceRender: { type: Boolean, default: undefined },
      destroyPopupOnHide: { type: Boolean, default: false },
      mask: { type: Boolean, default: false },
      maskClosable: { type: Boolean, default: true },
      // onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
      popupAlign: { type: Object, default: returnEmptyObject },
      popupVisible: { type: Boolean, default: undefined },
      defaultPopupVisible: { type: Boolean, default: false },
      autoDestroy: { type: Boolean, default: false },

      stretch: { type: String },
      alignPoint: { type: Boolean, default: undefined },

      popupMotion: { type: Object },
      maskMotion: { type: Object },

      popupTransitionName: { type: String },
      popupAnimation: { type: String },
      maskTransitionName: { type: String },
      maskAnimation: { type: String },

      getTriggerDOMNode: { type: Function }
    } as undefined,

    emits: toEmitsList(
      'onPopupAlign',
      'onPopupVisibleChange',
      'afterPopupVisibleChange',
      'onContextMenu',
      'onClick',
      'onMouseDown',
      'onTouchStart',
      'onMouseEnter',
      'onMouseLeave',
      'onFocus',
      'onBlur'
    ),

    data() {
      const $props: TriggerProps = this.$props;
      let popupVisible: boolean;

      if ($props.popupVisible !== undefined) {
        popupVisible = !!$props.popupVisible;
      } else {
        popupVisible = !!$props.defaultPopupVisible;
      }

      return {
        state: {
          prevPopupVisible: popupVisible,
          popupVisible
        }
      };
    },

    getDerivedStateFromProps({ popupVisible }: TriggerProps, prevState: TriggerState) {
      const newState: Partial<TriggerState> = {};

      if (popupVisible !== undefined && prevState.popupVisible !== popupVisible) {
        newState.popupVisible = popupVisible;
        newState.prevPopupVisible = prevState.popupVisible;
      }

      return newState;
    },

    beforeCreate() {
      ALL_HANDLERS.forEach((h) => {
        this[`fire${h}`] = (e) => {
          this.fireEvents(h, e);
        };
      });
    },

    mounted() {
      this.componentDidUpdate();
    },

    updated() {
      this.componentDidUpdate();
    },

    beforeUnmount() {
      this.clearDelayTimer();
      this.clearOutsideHandler();
      clearTimeout(this.mouseDownTimeout);
    },

    methods: {
      componentDidUpdate() {
        const props: TriggerProps = this.$props;
        const state: TriggerState = this.state;

        // We must listen to `mousedown` or `touchstart`, edge case:
        // https://github.com/ant-design/ant-design/issues/5804
        // https://github.com/react-component/calendar/issues/250
        // https://github.com/react-component/trigger/issues/50
        if (state.popupVisible) {
          let currentDocument;
          if (!this.clickOutsideHandler && (this.isClickToHide() || this.isContextMenuToShow())) {
            currentDocument = props.getDocument();
            this.clickOutsideHandler = addEventListener(currentDocument, 'mousedown', this.onDocumentClick);
          }
          // always hide on mobile
          if (!this.touchOutsideHandler) {
            currentDocument = currentDocument || props.getDocument();
            this.touchOutsideHandler = addEventListener(currentDocument, 'touchstart', this.onDocumentClick);
          }
          // close popup when trigger type contains 'onContextMenu' and document is scrolling.
          if (!this.contextMenuOutsideHandler1 && this.isContextMenuToShow()) {
            currentDocument = currentDocument || props.getDocument();
            this.contextMenuOutsideHandler1 = addEventListener(currentDocument, 'scroll', this.onContextMenuClose);
          }
          // close popup when trigger type contains 'onContextMenu' and window is blur.
          if (!this.contextMenuOutsideHandler2 && this.isContextMenuToShow()) {
            this.contextMenuOutsideHandler2 = addEventListener(
              // OPTIMIZE
              window as any,
              'blur',
              this.onContextMenuClose
            );
          }
          return;
        }

        this.clearOutsideHandler();
      },

      onMouseEnter(e) {
        const { mouseEnterDelay }: TriggerProps = this.$props;

        this.fireEvents('onMouseEnter', e);
        this.delaySetPopupVisible(true, mouseEnterDelay, mouseEnterDelay ? null : e);
      },

      onMouseMove(e) {
        this.fireEvents('onMouseMove', e);
        this.setPoint(e);
      },

      onMouseLeave(e) {
        this.fireEvents('onMouseLeave', e);
        this.delaySetPopupVisible(false, this.$props.mouseLeaveDelay);
      },

      onPopupMouseEnter() {
        this.clearDelayTimer();
      },

      onPopupMouseLeave(e) {
        this.delaySetPopupVisible(false, this.$props.mouseLeaveDelay);
      },

      onFocus(e) {
        this.fireEvents('onFocus', e);

        // incase focusin and focusout
        this.clearDelayTimer();

        if (this.isFocusToShow()) {
          this.focusTime = Date.now();
          this.delaySetPopupVisible(true, this.$props.focusDelay);
        }
      },

      onMouseDown(e) {
        this.fireEvents('onMouseDown', e);
        this.preClickTime = Date.now();
      },

      onTouchStart(e) {
        this.fireEvents('onTouchStart', e);
        this.preTouchTime = Date.now();
      },

      onBlur(e) {
        this.fireEvents('onBlur', e);
        this.clearDelayTimer();
        if (this.isBlurToHide()) {
          this.delaySetPopupVisible(false, this.$props.blurDelay);
        }
      },

      onContextMenu(e) {
        e.preventDefault();
        this.fireEvents('onContextMenu', e);
        this.setPopupVisible(true, e);
      },

      onContextMenuClose() {
        if (this.isContextMenuToShow()) {
          this.close();
        }
      },

      onClick(event) {
        this.fireEvents('onClick', event);

        // focus will trigger click
        if (this.focusTime) {
          let preTime;

          if (this.preClickTime && this.preTouchTime) {
            preTime = Math.min(this.preClickTime, this.preTouchTime);
          } else if (this.preClickTime) {
            preTime = this.preClickTime;
          } else if (this.preTouchTime) {
            preTime = this.preTouchTime;
          }
          if (Math.abs(preTime - this.focusTime) < 20) {
            return;
          }
          this.focusTime = 0;
        }

        this.preClickTime = 0;
        this.preTouchTime = 0;

        // Only prevent default when all the action is click.
        // https://github.com/ant-design/ant-design/issues/17043
        // https://github.com/ant-design/ant-design/issues/17291
        if (this.isClickToShow() && (this.isClickToHide() || this.isBlurToHide()) && event && event.preventDefault) {
          event.preventDefault();
        }

        const nextVisible = !this.state.popupVisible;

        if ((this.isClickToHide() && !nextVisible) || (nextVisible && this.isClickToShow())) {
          this.setPopupVisible(!this.state.popupVisible, event);
        }
      },

      onPopupMouseDown(...args) {
        this.hasPopupMouseDown = true;

        clearTimeout(this.mouseDownTimeout);
        this.mouseDownTimeout = window.setTimeout(() => {
          this.hasPopupMouseDown = false;
        }, 0);

        if (this.triggerContext) {
          this.triggerContext.onPopupMouseDown(...args);
        }
      },

      onDocumentClick(event) {
        if (this.$props.mask && !this.$props.maskClosable) {
          return;
        }

        const { target } = event;
        const root = this.getRootDomNode();
        const popupNode = this.getPopupDomNode();

        if (!contains(root, target) && !contains(popupNode, target) && !this.hasPopupMouseDown) {
          this.close();
        }
      },

      getPopupDomNode() {
        // for test
        if (this.popupRef && this.popupRef.popupRef) {
          return this.popupRef.popupRef;
        }

        return null;
      },

      getRootDomNode(): HTMLElement {
        const { getTriggerDOMNode }: TriggerProps = this.$props;

        if (getTriggerDOMNode) {
          return getTriggerDOMNode(this.triggerContext.node);
        }

        try {
          const domNode = this.triggerRef;

          if (domNode) {
            return domNode;
          }
        } catch (err) {
          // Do nothing
        }

        return this.node;
      },

      // vue will proxy prop `getPopupClassFromAlign` to instance
      // so we choose other method name
      getPopupClassFromAlignMethod(align) {
        const {
          getPopupNameFromAlign,
          builtinPlacements,
          popupPlacement,
          alignPoint,
          prefixCls
        }: TriggerProps = this.$props;
        const classList = [];

        if (popupPlacement && builtinPlacements) {
          classList.push(getAlignPopupClass(builtinPlacements, prefixCls, align, alignPoint));
        }

        if (getPopupNameFromAlign) {
          classList.push(getPopupNameFromAlign(align));
        }

        return classList;
      },

      getPopupAlign() {
        const { builtinPlacements, popupPlacement, popupAlign }: TriggerProps = this.$props;

        if (popupPlacement && builtinPlacements) {
          return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
        }

        return popupAlign;
      },

      getComponent() {
        const {
          prefixCls,
          destroyPopupOnHide,
          popupClass,
          popupMotion,
          popupAnimation,
          popupTransitionName,
          popupStyle,
          mask,
          maskAnimation,
          maskTransitionName,
          maskMotion,
          zIndex,
          stretch,
          alignPoint
        }: TriggerProps = this.$props;

        const popup = getPropOrSlot(this, 'popup');
        const { popupVisible, point }: TriggerState = this.state;
        const onPopupAlign = getListener(this, 'onPopupAlign');

        const align = this.getPopupAlign();
        const mouseProps: any = {};

        if (this.isMouseEnterToShow()) {
          mouseProps.onMouseenter = this.onPopupMouseEnter;
        }
        if (this.isMouseLeaveToHide()) {
          mouseProps.onMouseleave = this.onPopupMouseLeave;
        }

        mouseProps.onMousedown = this.onPopupMouseDown;
        mouseProps.onTouchstart = this.onPopupMouseDown;

        return (
          <Popup
            prefixCls={prefixCls}
            destroyPopupOnHide={destroyPopupOnHide}
            visible={popupVisible}
            point={alignPoint && point}
            class={popupClass}
            align={align}
            onAlign={onPopupAlign}
            animation={popupAnimation}
            getClassFromAlign={this.getPopupClassFromAlignMethod}
            {...mouseProps}
            stretch={stretch}
            getRootDomNode={this.getRootDomNode}
            style={popupStyle}
            mask={mask}
            zIndex={zIndex}
            transitionName={popupTransitionName}
            maskAnimation={maskAnimation}
            maskTransitionName={maskTransitionName}
            maskMotion={maskMotion}
            ref="popupRef"
            motion={popupMotion}
            v-slots={{
              default: typeof popup === 'function' ? popup : () => popup
            }}
          />
        );
      },

      getContainer() {
        const props: TriggerProps = this.$props;

        const popupContainer = document.createElement('div');

        // Make sure default popup container will never cause scrollbar appearing
        // https://github.com/react-component/trigger/issues/41
        popupContainer.style.position = 'absolute';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';

        const mountNode = props.getPopupContainer
          ? props.getPopupContainer(this.getRootDomNode())
          : props.getDocument().body;

        mountNode.appendChild(popupContainer);

        return popupContainer;
      },

      /**
       * @param popupVisible    Show or not the popup element
       * @param event           SyntheticEvent, used for `pointAlign`
       */
      setPopupVisible(popupVisible, event?) {
        const { alignPoint }: TriggerProps = this.$props;
        const { popupVisible: prevPopupVisible }: TriggerState = this.state;

        this.clearDelayTimer();

        if (prevPopupVisible !== popupVisible) {
          if (this.$props.popupVisible === undefined) {
            Object.assign(this.state, { popupVisible, prevPopupVisible });
          }

          const onPopupVisibleChange = getListener(this, 'onPopupVisibleChange');

          if (onPopupVisibleChange) {
            onPopupVisibleChange(popupVisible);
          }
        }

        // Always record the point position since mouseEnterDelay will delay the show
        if (alignPoint && event) {
          this.setPoint(event);
        }
      },

      setPoint(point) {
        const { alignPoint }: TriggerProps = this.$props;

        if (!alignPoint || !point) {
          return;
        }

        this.state.point = {
          pageX: point.pageX,
          pageY: point.pageY
        };
      },

      handlePortalUpdate() {
        if (this.state.prevPopupVisible !== this.state.popupVisible) {
          const afterPopupVisibleChange = getListener(this, 'afterPopupVisibleChange');

          if (afterPopupVisibleChange) {
            afterPopupVisibleChange(this.state.popupVisible);
          }
        }
      },

      delaySetPopupVisible(visible: boolean, delayS: number, event?: MouseEvent) {
        const delay = delayS * 1000;
        this.clearDelayTimer();

        if (delay) {
          const point = event ? { pageX: event.pageX, pageY: event.pageY } : null;
          this.delayTimer = window.setTimeout(() => {
            this.setPopupVisible(visible, point);
            this.clearDelayTimer();
          }, delay);
        } else {
          this.setPopupVisible(visible, event);
        }
      },

      clearDelayTimer() {
        if (this.delayTimer) {
          clearTimeout(this.delayTimer);
          this.delayTimer = null;
        }
      },

      clearOutsideHandler() {
        if (this.clickOutsideHandler) {
          this.clickOutsideHandler.remove();
          this.clickOutsideHandler = null;
        }

        if (this.contextMenuOutsideHandler1) {
          this.contextMenuOutsideHandler1.remove();
          this.contextMenuOutsideHandler1 = null;
        }

        if (this.contextMenuOutsideHandler2) {
          this.contextMenuOutsideHandler2.remove();
          this.contextMenuOutsideHandler2 = null;
        }

        if (this.touchOutsideHandler) {
          this.touchOutsideHandler.remove();
          this.touchOutsideHandler = null;
        }
      },

      createTwoChains(event: string) {
        const child: VNode = this.$slots.default()[0];
        const childEventHandler = getVNodeListener(child, event);
        const eventHandler = getListener(this, event);

        if (childEventHandler && eventHandler) {
          return this[`fire${event}`];
        }

        return childEventHandler || eventHandler;
      },

      isClickToShow() {
        const { action, showAction }: TriggerProps = this.$props;

        return action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1;
      },

      isContextMenuToShow() {
        const { action, showAction }: TriggerProps = this.$props;

        return action.indexOf('contextMenu') !== -1 || showAction.indexOf('contextMenu') !== -1;
      },

      isClickToHide() {
        const { action, hideAction }: TriggerProps = this.$props;

        return action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1;
      },

      isMouseEnterToShow() {
        const { action, showAction }: TriggerProps = this.$props;

        return action.indexOf('hover') !== -1 || showAction.indexOf('mouseEnter') !== -1;
      },

      isMouseLeaveToHide() {
        const { action, hideAction }: TriggerProps = this.$props;

        return action.indexOf('hover') !== -1 || hideAction.indexOf('mouseLeave') !== -1;
      },

      isFocusToShow() {
        const { action, showAction }: TriggerProps = this.$props;

        return action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1;
      },

      isBlurToHide() {
        const { action, hideAction }: TriggerProps = this.$props;

        return action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1;
      },

      forcePopupAlign() {
        if (this.state.popupVisible && this.popupRef && this.popupRef.alignRef) {
          this.popupRef.alignRef.forceAlign();
        }
      },

      fireEvents(type: string, e: Event) {
        const childCallback = getVNodeListener(this.$slots.default()[0], type);

        if (childCallback) {
          childCallback(e);
        }

        const callback = getListener(this, type);

        if (callback) {
          callback(e);
        }
      },

      close() {
        this.setPopupVisible(false);
      }
    },

    setup() {
      return {
        popupRef: ref<typeof Popup>(null),
        triggerRef: ref<ComponentPublicInstance>(null),
        triggerContext: inject(TriggerContext, null)
      };
    },

    render() {
      const { popupVisible }: TriggerState = this.state;
      const { forceRender, alignPoint, autoDestroy }: TriggerProps = this.$props;
      const children = this.$slots.default();
      const child = children[0];
      const newChildProps: any = { key: 'trigger' };

      if (this.isContextMenuToShow()) {
        newChildProps.onContextmenu = this.onContextMenu;
      } else {
        newChildProps.onContextmenu = this.createTwoChains('onContextMenu');
      }

      if (this.isClickToHide() || this.isClickToShow()) {
        newChildProps.onClick = this.onClick;
        newChildProps.onMousedown = this.onMouseDown;
        newChildProps.onTouchStart = this.onTouchStart;
      } else {
        newChildProps.onClick = this.createTwoChains('onClick');
        newChildProps.onMousedown = this.createTwoChains('onMouseDown');
        newChildProps.onTouchstart = this.createTwoChains('onTouchStart');
      }

      if (this.isMouseEnterToShow()) {
        newChildProps.onMouseenter = this.onMouseEnter;

        if (alignPoint) {
          newChildProps.onMousemove = this.onMouseMove;
        }
      } else {
        newChildProps.onMouseenter = this.createTwoChains('onMouseEnter');
      }
      if (this.isMouseLeaveToHide()) {
        newChildProps.onMouseleave = this.onMouseLeave;
      } else {
        newChildProps.onMouseleave = this.createTwoChains('onMouseLeave');
      }

      if (this.isFocusToShow() || this.isBlurToHide()) {
        newChildProps.onFocus = this.onFocus;
        newChildProps.onBlur = this.onBlur;
      } else {
        newChildProps.onFocus = this.createTwoChains('onFocus');
        newChildProps.onBlur = this.createTwoChains('onBlur');
      }

      const cloneProps: any = {
        ...newChildProps,
        ref: composeRef('triggerRef', child.ref)
      };

      const trigger = cloneVNode(child, cloneProps);
      let portal;

      // prevent unmounting after it's rendered
      if (popupVisible || this.popupRef || forceRender) {
        portal = (
          <PortalComponent key="portal" getContainer={this.getContainer} didUpdate={this.handlePortalUpdate}>
            {this.getComponent()}
          </PortalComponent>
        );
      }

      if (!popupVisible && autoDestroy) {
        portal = null;
      }

      return [trigger, portal];
    }
  });
}

export default generateTrigger(Portal);
