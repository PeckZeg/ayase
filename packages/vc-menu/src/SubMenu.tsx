import SubPopupMenu, { SubPopupMenuProps } from './SubPopupMenu';
import { ClassList, VueKey } from '@ayase/vc-util/lib/types';
import CSSMotion, { CSSMotionProps } from '@ayase/vc-motion';
import KeyCode from '@ayase/vc-util/lib/KeyCode';
import Trigger from '@ayase/vc-trigger';

import {
  MiniStore,
  RenderIconType,
  LegacyFunctionRef,
  MenuMode,
  OpenEventHandler,
  SelectEventHandler,
  DestroyEventHandler,
  MenuHoverEventHandler,
  MenuClickEventHandler,
  MenuInfo,
  BuiltinPlacements,
  TriggerSubMenuAction,
  HoverEventHandler,
  SelectInfo
} from './interface';

import {
  loopMenuItemRecursively,
  getMenuIdFromSubMenuEventKey,
  menuAllProps
} from './util';
import { getListener, getPropOrSlot } from '@ayase/vc-util/lib/instance';
import { placements, placementsRtl } from './placements';
import { connect } from '@ayase/mini-store';
import {
  CSSProperties,
  ComputedRef,
  VNodeChild,
  defineComponent,
  computed
} from 'vue';
import { toEmitsList } from '@ayase/vc-util';

let guid = 0;

const popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop'
};

const updateDefaultActiveFirst = (
  store: MiniStore,
  eventKey: string,
  defaultActiveFirst: boolean
) => {
  const menuId = getMenuIdFromSubMenuEventKey(eventKey);
  const state = store.getState();

  store.setState({
    defaultActiveFirst: {
      ...state.defaultActiveFirst,
      [menuId]: defaultActiveFirst
    }
  });
};

export interface SubMenuProps {
  parentMenu?: any;
  // parentMenu?: React.ReactElement & {
  //   isRootMenu: boolean;
  //   subMenuInstance: React.ReactInstance;
  // };
  title?: VNodeChild;
  // children?: VNodeChild;
  selectedKeys?: string[];
  openKeys?: string[];
  rootPrefixCls?: string;
  eventKey?: string;
  multiple?: boolean;
  active?: boolean; // TODO: remove
  triggerSubMenuAction?: TriggerSubMenuAction;
  popupOffset?: number[];
  isOpen?: boolean;
  store?: MiniStore;
  mode?: MenuMode;
  manualRef?: LegacyFunctionRef;
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;
  inlineIndent?: number;
  level?: number;
  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  forceSubMenuRender?: boolean;
  builtinPlacements?: BuiltinPlacements;
  disabled?: boolean;
  // className?: string;
  popupClass?: ClassList;

  motion?: CSSMotionProps;
  direction?: 'ltr' | 'rtl';
}

export interface SubMenuRawBindings {
  prefixCls: ComputedRef<string>;
  activeClass: ComputedRef<string>;
  disabledClass: ComputedRef<string>;
  selectedClass: ComputedRef<string>;
  openClass: ComputedRef<string>;
}

export interface SubMenuEmits {
  onClick?: MenuClickEventHandler;
  onOpenChange?: OpenEventHandler;
  onItemHover?: HoverEventHandler;
  onSelect?: SelectEventHandler;
  onDeselect?: SelectEventHandler;
  onDestroy?: DestroyEventHandler;
  onMouseEnter?: MenuHoverEventHandler;
  onMouseLeave?: MenuHoverEventHandler;
  onTitleMouseEnter?: MenuHoverEventHandler;
  onTitleMouseLeave?: MenuHoverEventHandler;
  onTitleClick?: (info: {
    key: VueKey;
    domEvent: MouseEvent | KeyboardEvent;
  }) => void;
}

export const SubMenu = defineComponent<SubMenuProps, SubMenuRawBindings>({
  name: 'SubMenu',
  inheritAttrs: false,

  emits: toEmitsList<keyof SubMenuEmits>(
    'onClick',
    'onOpenChange',
    'onItemHover',
    'onSelect',
    'onDeselect',
    'onDestroy',
    'onMouseEnter',
    'onMouseLeave',
    'onTitleMouseEnter',
    'onTitleMouseLeave',
    'onTitleClick'
  ),

  props: {
    parentMenu: undefined,
    title: null,
    selectedKeys: Array,
    openKeys: Array,
    rootPrefixCls: String,
    eventKey: String,
    multiple: Boolean,
    active: Boolean, // TODO: remove
    triggerSubMenuAction: String,
    popupOffset: Array,
    isOpen: Boolean,
    store: null,
    mode: { type: String, default: 'vertical' },
    manualRef: Function,
    itemIcon: Function,
    expandIcon: Function,
    inlineIndent: Number,
    level: Number,
    subMenuOpenDelay: Number,
    subMenuCloseDelay: Number,
    forceSubMenuRender: Boolean,
    builtinPlacements: Object,
    disabled: Boolean,
    popupClass: null,
    motion: Object,
    direction: String
  } as any,

  setup(props) {
    const prefixCls = computed(() => `${props.rootPrefixCls}-submenu`);
    const activeClass = computed(() => `${prefixCls.value}-active`);
    const disabledClass = computed(() => `${prefixCls.value}-disabled`);
    const selectedClass = computed(() => `${prefixCls.value}-selected`);
    const openClass = computed(() => `${prefixCls.value}-open`);

    return {
      prefixCls,
      activeClass,
      disabledClass,
      selectedClass,
      openClass
    };
  },

  beforeCreate() {
    const props = this.$props;
    const { store, eventKey } = props;
    const { defaultActiveFirst } = store.getState();

    this.isRootMenu = false;

    let value = false;

    if (defaultActiveFirst) {
      value = defaultActiveFirst[eventKey];
    }

    updateDefaultActiveFirst(store, eventKey, value);

    this.internalMenuId = '';
    this.haveRendered = false;
    this.haveOpened = false;
  },

  mounted() {
    this.$nextTick(this.componentDidUpdate);
  },

  updated() {
    this.$nextTick(this.componentDidUpdate);
  },

  beforeUnmount() {
    const { eventKey }: SubMenuProps = this.$props;
    const onDestroy = getListener<DestroyEventHandler>(this, 'onDestroy');

    if (onDestroy) {
      onDestroy(eventKey);
    }

    if (this.minWidthTimeout) {
      clearTimeout(this.minWidthTimeout);
    }

    if (this.mouseenterTimeout) {
      clearTimeout(this.mouseenterTimeout);
    }
  },

  methods: {
    componentDidUpdate() {
      const { mode, parentMenu, manualRef }: SubMenuProps = this.$props;

      // invoke customized ref to expose component to mixin
      if (manualRef) {
        manualRef(this);
      }

      if (
        mode !== 'horizontal' ||
        !parentMenu.isRootMenu ||
        !this.$props.isOpen
      ) {
        return;
      }

      this.minWidthTimeout = setTimeout(() => this.adjustWidth(), 0);
    },

    onDestroy(key: string) {
      const onDestroy = getListener<DestroyEventHandler>(this, 'onDestroy');

      if (onDestroy) {
        onDestroy(key);
      }
    },

    /**
     * note:
     *  This legacy code that `onKeyDown` is called by parent instead of dom self.
     *  which need return code to check if this event is handled
     */
    onKeyDown(e: KeyboardEvent) {
      const { keyCode } = e;
      const menu = this.menuInstance;
      const { isOpen, store }: SubMenuProps = this.$props;

      if (keyCode === KeyCode.ENTER) {
        this.onTitleClick(e);
        updateDefaultActiveFirst(store, this.$props.eventKey, true);
        return true;
      }

      if (keyCode === KeyCode.RIGHT) {
        if (isOpen) {
          menu.onKeyDown(e);
        } else {
          this.triggerOpenChange(true);

          // need to update current menu's defaultActiveFirst value
          updateDefaultActiveFirst(store, this.$props.eventKey, true);
        }

        return true;
      }

      if (keyCode === KeyCode.LEFT) {
        let handled: boolean;

        if (isOpen) {
          handled = menu.onKeyDown(e);
        } else {
          return undefined;
        }

        if (!handled) {
          this.triggerOpenChange(false);
          handled = true;
        }

        return handled;
      }

      if (isOpen && (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN)) {
        return menu.onKeyDown(e);
      }

      return undefined;
    },

    onOpenChange(e: Parameters<OpenEventHandler>[0]) {
      const onOpenChange = getListener<OpenEventHandler>(this, 'onOpenChange');

      if (onOpenChange) {
        onOpenChange(e);
      }
    },

    onPopupVisibleChange(visible: boolean) {
      this.triggerOpenChange(visible, visible ? 'mouseenter' : 'mouseleave');
    },

    onMouseEnter(e: MouseEvent) {
      const { eventKey: key, store }: SubMenuProps = this.$props;
      const onMouseEnter = getListener<MenuHoverEventHandler>(
        this,
        'onMouseEnter'
      );

      if (onMouseEnter) {
        onMouseEnter({
          key,
          domEvent: e
        });
      }
    },

    onMouseLeave(e: MouseEvent) {
      const { parentMenu, eventKey }: SubMenuProps = this.$props;
      const onMouseLeave = getListener<MenuHoverEventHandler>(
        this,
        'onMouseLeave'
      );

      if (onMouseLeave) {
        onMouseLeave({
          key: eventKey,
          domEvent: e
        });
      }
    },

    onTitleMouseEnter(domEvent: MouseEvent) {
      const { eventKey: key }: SubMenuProps = this.$props;
      const onItemHover = getListener<HoverEventHandler>(this, 'onItemHover');
      const onTitleMouseEnter = getListener<MenuHoverEventHandler>(
        this,
        'onTitleMouseEnter'
      );

      if (onItemHover) {
        onItemHover({
          key,
          hover: true
        });
      }

      if (onTitleMouseEnter) {
        onTitleMouseEnter({
          key,
          domEvent
        });
      }
    },

    onTitleMouseLeave(e: MouseEvent) {
      const { parentMenu, eventKey }: SubMenuProps = this.$props;
      const onItemHover = getListener<HoverEventHandler>(this, 'onItemHover');
      const onTitleMouseLeave = getListener<MenuHoverEventHandler>(
        this,
        'onTitleMouseLeave'
      );

      parentMenu.subMenuInstance = this;

      if (onItemHover) {
        onItemHover({
          key: eventKey,
          hover: false
        });
      }

      if (onTitleMouseLeave) {
        onTitleMouseLeave({
          key: eventKey,
          domEvent: e
        });
      }
    },

    onTitleClick(e: MouseEvent | KeyboardEvent) {
      const onTitleClick = getListener<SubMenuEmits['onTitleClick']>(
        this,
        'onTitleClick'
      );

      if (onTitleClick) {
        onTitleClick({
          key: this.$props.eventKey,
          domEvent: e
        });
      }

      if (this.$props.triggerSubMenuAction === 'hover') {
        return;
      }

      this.triggerOpenChange(!this.$props.isOpen, 'click');
      updateDefaultActiveFirst(this.$props.store, this.$props.eventKey, false);
    },

    onSubMenuClick(info: MenuInfo) {
      // in the case of overflowed submenu
      // onClick is not copied over
      const onClick = getListener<MenuClickEventHandler>(this, 'onClick');

      if (onClick) {
        onClick(this.addKeyPath(info));
      }
    },

    onSelect(info: SelectInfo) {
      const onSelect = getListener<SelectEventHandler>(this, 'onSelect');

      if (onSelect) {
        onSelect(info);
      }
    },

    onDeselect(info: SelectInfo) {
      const onDeselect = getListener<SelectEventHandler>(this, 'onDeselect');

      if (onDeselect) {
        onDeselect(info);
      }
    },

    saveMenuInstance(c: any) {
      // children menu instance
      this.menuInstance = c;
    },

    addKeyPath(info: MenuInfo) {
      return {
        ...info,
        keyPath: (info.keyPath || []).concat(this.$props.eventKey)
      };
    },

    triggerOpenChange(open: boolean, type?: string) {
      const { eventKey: key }: SubMenuProps = this.$props;

      const openChange = () => {
        this.onOpenChange({
          key,
          item: this,
          trigger: type,
          open
        });
      };

      if (type === 'mouseenter') {
        // make sure mouseenter happen after other menu item's mouseleave
        this.mouseenterTimeout = setTimeout(() => {
          openChange();
        }, 0);
      } else {
        openChange();
      }
    },

    isChildrenSelected() {
      const ret = { find: false };

      loopMenuItemRecursively(this.children, this.$props.selectedKeys, ret);

      return ret.find;
    },

    // isOpen() {
    //   return this.$props.openKeys.indexOf(this.$props.eventKey) !== -1;
    // },

    adjustWidth() {
      if (!this.subMenuTitle || !this.menuInstance) {
        return;
      }

      const popupMenu: HTMLElement = this.menuInstance.$el;

      if (popupMenu.offsetWidth >= this.subMenuTitle.offsetWidth) {
        return;
      }

      popupMenu.style.minWidth = `${this.subMenuTitle.offsetWidth}px`;
    },

    saveSubMenuTitle(subMenuTitle: HTMLElement) {
      this.subMenuTitle = subMenuTitle;
    },

    getBaseProps(): SubPopupMenuProps & SubMenuEmits {
      const props: SubMenuProps = this.$props;

      return {
        mode: props.mode === 'horizontal' ? 'vertical' : props.mode,
        visible: props.isOpen,
        level: props.level + 1,
        inlineIndent: props.inlineIndent,
        focusable: false,
        onClick: this.onSubMenuClick,
        onSelect: this.onSelect,
        onDeselect: this.onDeselect,
        onDestroy: this.onDestroy,
        selectedKeys: props.selectedKeys,
        eventKey: `${props.eventKey}-menu-`,
        openKeys: props.openKeys,
        motion: props.motion,
        onOpenChange: this.onOpenChange,
        subMenuOpenDelay: props.subMenuOpenDelay,
        parentMenu: this,
        subMenuCloseDelay: props.subMenuCloseDelay,
        forceSubMenuRender: props.forceSubMenuRender,
        triggerSubMenuAction: props.triggerSubMenuAction,
        builtinPlacements: props.builtinPlacements,
        defaultActiveFirst: props.store.getState().defaultActiveFirst[
          getMenuIdFromSubMenuEventKey(props.eventKey)
        ],
        multiple: props.multiple,
        prefixCls: props.rootPrefixCls,
        id: this.internalMenuId,
        manualRef: this.saveMenuInstance,

        itemIcon: getPropOrSlot(
          this,
          'itemIcon',
          false
        ) as SubMenuProps['itemIcon'],

        expandIcon: getPropOrSlot(
          this,
          'expandIcon',
          false
        ) as SubMenuProps['expandIcon'],

        direction: props.direction
      };
    },

    getMotion(mode: MenuMode, visible: boolean) {
      const { motion, rootPrefixCls }: SubMenuProps = this.$props;
      const { haveRendered } = this;

      // don't show transition on first rendering (no animation for opened menu)
      // show appear transition if it's not visible (not sure why)
      // show appear transition if it's not inline mode
      const mergedMotion: CSSMotionProps = {
        ...motion,
        leavedClass: `${rootPrefixCls}-hidden`,
        removeOnLeave: false,
        motionAppear: haveRendered || !visible || mode !== 'inline'
      };

      return mergedMotion;
    },

    renderChildren(children: VNodeChild) {
      const baseProps = this.getBaseProps();

      // [Legacy] getMotion must be called before `haveRendered`
      const mergedMotion = this.getMotion(baseProps.mode, baseProps.visible);

      this.haveRendered = true;

      this.haveOpened =
        this.haveOpened || baseProps.visible || baseProps.forceSubMenuRender;

      // never rendered not planning to, don't render
      if (!this.haveOpened) {
        return <div />;
      }

      const { direction } = baseProps;
      const cssMotionProps = { visible: baseProps.visible, ...mergedMotion };

      return (
        <CSSMotion
          {...cssMotionProps}
          v-slots={{
            default: ({ class: classList, style, ref }) => {
              const mergedClass = [
                `${baseProps.prefixCls}-sub`,
                classList,
                {
                  [`${baseProps.prefixCls}-rtl`]: direction === 'rtl'
                }
              ];

              const subPopupMenuProps = {
                ...baseProps,
                id: this.internalMenuId,
                class: mergedClass,
                style,
                ref
              };

              return (
                <SubPopupMenu
                  {...subPopupMenuProps}
                  v-slots={{ default: () => children }}
                />
              );
            }
          }}
        />
      );
    }
  },

  render(ctx) {
    this.children = this.$slots?.default();

    const props: SubMenuProps = { ...this.$props, ...this.$attrs };
    const { isOpen } = props;
    const { prefixCls } = this;
    const isInlineMode = props.mode === 'inline';

    // prettier-ignore
    const classList = [prefixCls, `${prefixCls}-${props.mode}`, this.$.vnode.props?.class, {
      [this.openClass]: isOpen,
      [this.activeClass]: props.active || (isOpen && !isInlineMode),
      [this.disabledClass]: props.disabled,
      [this.selectedClass]: this.isChildrenSelected()
    }];

    if (!this.internalMenuId) {
      if (props.eventKey) {
        this.internalMenuId = `${props.eventKey}$Menu`;
      } else {
        guid += 1;
        this.internalMenuId = `$__$${guid}$Menu`;
      }
    }

    let mouseEvents = {};
    let titleClickEvents = {};
    let titleMouseEvents = {};

    if (!props.disabled) {
      mouseEvents = {
        onMouseleave: this.onMouseLeave,
        onMouseenter: this.onMouseEnter
      };

      // only works in title, not outer li
      titleClickEvents = {
        onClick: this.onTitleClick
      };

      titleMouseEvents = {
        onMouseenter: this.onTitleMouseEnter,
        onMouseleave: this.onTitleMouseLeave
      };
    }

    const style: CSSProperties = {};
    const { direction } = props;

    if (isInlineMode) {
      if (direction === 'rtl') {
        style.paddingRight = `${props.inlineIndent * props.level}px`;
      } else {
        style.paddingLeft = `${props.inlineIndent * props.level}px`;
      }
    }

    let ariaOwns = {};
    // only set aria-owns when menu is open
    // otherwise it would be an invalid aria-owns value
    // since corresponding node cannot be found
    if (props.isOpen) {
      ariaOwns = {
        'aria-owns': this.internalMenuId
      };
    }

    // expand custom icon should NOT be displayed in menu with horizontal mode.
    let icon = null;
    if (props.mode !== 'horizontal') {
      icon = getPropOrSlot(this, 'expandIcon', false);

      if (typeof icon === 'function') {
        icon = icon({ ...this.$props });
      }
    }

    const titleProp = getPropOrSlot(this, 'title');

    const title = (
      <div
        {...{
          ref: this.saveSubMenuTitle,
          class: `${prefixCls}-title`,
          style,
          role: 'button',
          ...titleMouseEvents,
          ...titleClickEvents,
          'aria-expanded': 'true',
          ...ariaOwns,
          title: typeof titleProp === 'string' ? titleProp : undefined
        }}
      >
        {titleProp}
        {icon || <i class={`${prefixCls}-arrow`} />}
      </div>
    );

    const children = this.renderChildren(this.children);

    const getPopupContainer = props.parentMenu?.isRootMenu
      ? props.parentMenu.$props.getPopupContainer
      : (triggerNode: HTMLElement) => triggerNode.parentNode;

    const popupPlacement = popupPlacementMap[props.mode];
    const popupAlign = props.popupOffset ? { offset: props.popupOffset } : {};

    const popupClass = [
      `${prefixCls}-popup`,
      props.mode === 'inline' ? undefined : props.popupClass,
      {
        [`${prefixCls}-rtl`]: direction === 'rtl'
      }
    ];

    const {
      disabled,
      triggerSubMenuAction,
      subMenuOpenDelay,
      forceSubMenuRender,
      subMenuCloseDelay,
      builtinPlacements
    } = props;

    menuAllProps.forEach((key) => delete props[key]);

    // Set onClick to null, to ignore propagated onClick event
    delete (props as any).onClick;

    const placement = Object.assign(
      {},
      direction === 'rtl' ? placementsRtl : placements,
      builtinPlacements
    );

    delete props.direction;

    return (
      <li
        {...{
          ...(props as any),
          ...mouseEvents,
          class: classList,
          role: 'menuitem'
        }}
      >
        {isInlineMode && title}
        {isInlineMode && children}
        {!isInlineMode && (
          <Trigger
            prefixCls={prefixCls}
            popupClass={popupClass}
            getPopupContainer={getPopupContainer}
            builtinPlacements={placement}
            popupPlacement={popupPlacement}
            popupVisible={isOpen}
            popupAlign={popupAlign}
            popup={children}
            action={disabled ? [] : [triggerSubMenuAction]}
            mouseEnterDelay={subMenuOpenDelay}
            mouseLeaveDelay={subMenuCloseDelay}
            // @ts-ignore
            onPopupVisibleChange={this.onPopupVisibleChange}
            forceRender={forceSubMenuRender}
            v-slots={{ default: () => title }}
          />
        )}
      </li>
    );
  }
});

const connected = connect<any, any, any>(
  ({ openKeys, activeKey, selectedKeys }, { eventKey, subMenuKey }) => ({
    isOpen: openKeys.indexOf(eventKey) > -1,
    active: activeKey[subMenuKey] === eventKey,
    selectedKeys
  })
)(SubMenu);

connected.isSubMenu = true;

export default connected;
