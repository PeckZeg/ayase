import SubPopupMenu, { getActiveKey } from './SubPopupMenu';
import { Provider, create } from '@ayase/mini-store';
import { CSSMotionProps } from '@ayase/vc-motion';

import {
  RenderIconType,
  SelectInfo,
  SelectEventHandler,
  DestroyEventHandler,
  MenuMode,
  OpenEventHandler,
  OpenAnimation,
  MiniStore,
  BuiltinPlacements,
  TriggerSubMenuAction,
  MenuClickEventHandler,
  MenuInfo
} from './interface';

import {
  VNodeChild,
  CSSProperties,
  VNode,
  Fragment,
  defineComponent
} from 'vue';

import { getMotion } from './utils/legacyUtil';
import { noop } from './util';
import omit from 'omit.js';
import {
  returnEmptyArray,
  returnEmptyObject,
  toEmitsList
} from '@ayase/vc-util';
import { getListener, getPropOrSlot } from '@ayase/vc-util/lib/instance';
import {
  ClassList,
  MouseEventHandler,
  TransitionEventHandler
} from '@ayase/vc-util/lib/types';
import { normalizeVNodes } from '@ayase/vc-util/lib/vnode';

export interface MenuProps {
  defaultSelectedKeys?: string[];
  defaultActiveFirst?: boolean;
  selectedKeys?: string[];
  defaultOpenKeys?: string[];
  openKeys?: string[];
  mode?: MenuMode;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  forceSubMenuRender?: boolean;
  triggerSubMenuAction?: TriggerSubMenuAction;
  level?: number;
  selectable?: boolean;
  multiple?: boolean;
  activeKey?: string;
  prefixCls?: string;
  builtinPlacements?: BuiltinPlacements;
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;
  overflowedIndicator?: VNodeChild;
  /** Menu motion define */
  motion?: CSSMotionProps;

  /** Default menu motion of each mode */
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>;

  /** @deprecated Please use `motion` instead */
  openTransitionName?: string;
  /** @deprecated Please use `motion` instead */
  openAnimation?: OpenAnimation;

  /** direction of menu */
  direction?: 'ltr' | 'rtl';

  inlineCollapsed?: boolean;

  /** SiderContextProps of layout in ant design */
  siderCollapsed?: boolean;
  collapsedWidth?: string | number;
}

export interface MenuState {
  switchingModeFromInline: boolean;
}

export interface MenuEmits {
  onClick?: MenuClickEventHandler;
  onSelect?: SelectEventHandler;
  onOpenChange?: OpenEventHandler;
  onDeselect?: SelectEventHandler;
  onDestroy?: DestroyEventHandler;
  onMouseEnter?: MouseEventHandler;
  onTransitionEnd?: TransitionEventHandler;
}

export default defineComponent<MenuProps, {}, { state: MenuState }>({
  name: 'Menu',
  inheritAttrs: false,

  emits: toEmitsList<keyof MenuEmits>(
    'onClick',
    'onSelect',
    'onOpenChange',
    'onDeselect',
    'onDestroy',
    'onMouseEnter',
    'onTransitionEnd'
  ),

  props: {
    defaultSelectedKeys: { type: Array, default: returnEmptyArray },
    defaultActiveFirst: Boolean,
    selectedKeys: Array,
    defaultOpenKeys: { type: Array, default: returnEmptyArray },
    openKeys: Array,
    mode: { type: String, default: 'vertical' },
    getPopupContainer: Function,

    subMenuOpenDelay: { type: Number, default: 0.1 },
    subMenuCloseDelay: { typ: Number, default: 0.1 },
    forceSubMenuRender: Boolean,
    triggerSubMenuAction: { type: String, default: 'hover' },
    level: Number,
    selectable: { type: Boolean, default: true },
    multiple: Boolean,
    activeKey: String,
    prefixCls: { type: String, default: 'vc-menu' },
    builtinPlacements: { type: Object, default: returnEmptyObject },
    itemIcon: Function,
    expandIcon: Function,
    overflowedIndicator: undefined,
    /** Menu motion define */
    motion: Object,

    /** Default menu motion of each mode */
    defaultMotions: Object,

    /** @deprecated Please use `motion` instead */
    openTransitionName: String,
    /** @deprecated Please use `motion` instead */
    openAnimation: [String, Object],

    /** direction of menu */
    direction: String,

    inlineCollapsed: Boolean,

    /** SiderContextProps of layout in ant design */
    siderCollapsed: Boolean,
    collapsedWidth: [String, Number]
  } as undefined,

  data() {
    return {
      state: {
        switchingModeFromInline: false
      }
    };
  },

  beforeCreate() {
    this.store = undefined;
    this.isRootMenu = true;
    this.inlineOpenKeys = [];
  },

  mounted() {
    this.updateMiniStore();
    this.updateMenuDisplay();

    this.prevProps = { ...this.$props };
  },

  updated() {
    const prevProps: MenuProps = this.prevProps;

    this.updateOpenKeysWhenSwitchMode(prevProps);
    this.updateMiniStore();

    const { siderCollapsed, inlineCollapsed }: MenuProps = this.$props;
    const onOpenChange = getListener(this, 'onOpenChange');

    if (
      (!prevProps.inlineCollapsed && inlineCollapsed) ||
      (!prevProps.siderCollapsed && siderCollapsed)
    ) {
      onOpenChange([]);
    }

    this.updateMenuDisplay();
  },

  methods: {
    updateOpenKeysWhenSwitchMode(prevProps: MenuProps) {
      const nextProps: MenuProps = this.$props;
      const store: MiniStore = this.store;
      const inlineOpenKeys: string[] = this.inlineOpenKeys;
      const prevState = store.getState();
      const newState: any = {};

      if (prevProps.mode === 'inline' && nextProps.mode !== 'inline') {
        this.state.switchingModeFromInline = true;
      }

      if (nextProps.openKeys === undefined) {
        // [Legacy] Old code will return after `openKeys` changed.
        // Not sure the reason, we should keep this logic still.
        if (
          (nextProps.inlineCollapsed && !prevProps.inlineCollapsed) ||
          (nextProps.siderCollapsed && !prevProps.siderCollapsed)
        ) {
          this.state.switchingModeFromInline = true;
          this.inlineOpenKeys = prevState.openKeys.concat();
          newState.openKeys = [];
        }

        if (
          (!nextProps.inlineCollapsed && prevProps.inlineCollapsed) ||
          (!nextProps.siderCollapsed && prevProps.siderCollapsed)
        ) {
          newState.openKeys = inlineOpenKeys;
          this.inlineOpenKeys = [];
        }
      }

      if (Object.keys(newState).length) {
        store.setState(newState);
      }
    },

    updateMenuDisplay() {
      const { collapsedWidth }: MenuProps = this.$props;
      const store: MiniStore = this.store;
      const prevOpenKeys: string[] = this.prevOpenKeys;

      // https://github.com/ant-design/ant-design/issues/8587
      const hideMenu =
        this.getInlineCollapsed() &&
        (collapsedWidth === 0 ||
          collapsedWidth === '0' ||
          collapsedWidth === '0px');

      if (hideMenu) {
        this.prevOpenKeys = store.getState().openKeys.concat();
        this.store.setState({ openKeys: [] });
      } else if (prevOpenKeys) {
        this.store.setState({ openKeys: prevOpenKeys });
        this.prevOpenKeys = null;
      }
    },

    onSelect(selectInfo: SelectInfo) {
      const props: MenuProps = this.$props;

      if (props.selectable) {
        // root menu
        let { selectedKeys } = this.store.getState();
        const selectedKey = selectInfo.key;

        if (props.multiple) {
          selectedKeys = selectedKeys.concat([selectedKey]);
        } else {
          selectedKeys = [selectedKey];
        }

        if (props.selectedKeys === undefined) {
          this.store.setState({ selectedKeys });
        }

        const onSelect = getListener<SelectEventHandler>(this, 'onSelect');

        if (onSelect) {
          onSelect({ ...selectInfo, selectedKeys });
        }
      }
    },

    onClick(e: MenuInfo) {
      const mode = this.getRealMenuMode();
      const store: MiniStore = this.store;
      const onOpenChange = getListener<OpenEventHandler>(this, 'onOpenChange');

      if (mode !== 'inline' && this.$props.openKeys === undefined) {
        // closing vertical popup submenu after click it
        store.setState({ openKeys: [] });

        if (onOpenChange) {
          onOpenChange([]);
        }
      }

      const onClick = getListener<MenuClickEventHandler>(this, 'onClick');

      if (onClick) {
        onClick(e);
      }
    },

    // onKeyDown needs to be exposed as a instance method
    // e.g., in rc-select, we need to navigate menu item while
    // current active item is rc-select input box rather than the menu itself
    onKeyDown(e: KeyboardEvent, callback) {
      this.innerMenu.getWrappedInstance().onKeyDown(e, callback);
    },

    onOpenChange(event) {
      const props: MenuProps = this.$props;
      const openKeys = this.store.getState().openKeys.concat();
      let changed = false;
      const processSingle = (e) => {
        let oneChanged = false;

        if (e.open) {
          oneChanged = openKeys.indexOf(e.key) === -1;

          if (oneChanged) {
            openKeys.push(e.key);
          }
        } else {
          const index = openKeys.indexOf(e.key);

          oneChanged = index !== -1;

          if (oneChanged) {
            openKeys.splice(index, 1);
          }
        }
        changed = changed || oneChanged;
      };

      if (Array.isArray(event)) {
        // batch change call
        event.forEach(processSingle);
      } else {
        processSingle(event);
      }

      if (changed) {
        if (props.openKeys === undefined) {
          this.store.setState({ openKeys });
        }

        const onOpenChange = getListener<OpenEventHandler>(
          this,
          'onOpenChange'
        );

        if (onOpenChange) {
          onOpenChange(openKeys);
        }
      }
    },

    onDeselect(selectInfo: SelectInfo) {
      const props: MenuProps = this.$props;

      if (props.selectable) {
        const selectedKeys = this.store.getState().selectedKeys.concat();
        const selectedKey = selectInfo.key;
        const index = selectedKeys.indexOf(selectedKey);

        if (index !== -1) {
          selectedKeys.splice(index, 1);
        }

        if (props.selectedKeys === undefined) {
          this.store.setState({ selectedKeys });
        }

        const onDeselect = getListener<SelectEventHandler>(this, 'onDeselect');

        if (onDeselect) {
          onDeselect({ ...selectInfo, selectedKeys });
        }
      }
    },

    getRealMenuMode() {
      const { mode }: MenuProps = this.$props;
      const { switchingModeFromInline }: MenuState = this.state;
      const inlineCollapsed = this.getInlineCollapsed();

      if (switchingModeFromInline && inlineCollapsed) {
        return 'inline';
      }

      return inlineCollapsed ? 'vertical' : mode;
    },

    getInlineCollapsed() {
      const { inlineCollapsed, siderCollapsed }: MenuProps = this.$props;

      if (siderCollapsed !== undefined) {
        return siderCollapsed;
      }

      return inlineCollapsed;
    },

    // Restore vertical mode when menu is collapsed responsively when mounted
    // https://github.com/ant-design/ant-design/issues/13104
    // TODO: not a perfect solution,
    // looking a new way to avoid setting switchingModeFromInline in this situation
    onMouseEnter(e: MouseEvent) {
      this.restoreModeVerticalFromInline();
      const onMouseEnter = getListener<MouseEventHandler>(this, 'onMouseEnter');

      if (onMouseEnter) {
        onMouseEnter(e);
      }
    },

    onTransitionEnd(e: TransitionEvent) {
      // when inlineCollapsed menu width animation finished
      // https://github.com/ant-design/ant-design/issues/12864
      const widthCollapsed =
        e.propertyName === 'width' && e.target === e.currentTarget;

      // Fix SVGElement e.target.className.indexOf is not a function
      // https://github.com/ant-design/ant-design/issues/15699
      const { className } = e.target as HTMLElement | SVGElement;

      // SVGAnimatedString.animVal should be identical to SVGAnimatedString.baseVal,
      // unless during an animation.
      const classNameValue =
        Object.prototype.toString.call(className) ===
        '[object SVGAnimatedString]'
          ? className.animVal
          : className;

      // Fix for <Menu style={{ width: '100%' }} />,
      // the width transition won't trigger when menu is collapsed
      // https://github.com/ant-design/ant-design-pro/issues/2783
      const iconScaled =
        e.propertyName === 'font-size' &&
        classNameValue.indexOf('anticon') >= 0;

      if (widthCollapsed || iconScaled) {
        this.restoreModeVerticalFromInline();
      }
    },

    restoreModeVerticalFromInline() {
      const { switchingModeFromInline }: MenuState = this.state;

      if (switchingModeFromInline) {
        this.state.switchingModeFromInline = false;
      }
    },

    setInnerMenu(node) {
      this.innerMenu = node;
    },

    updateMiniStore() {
      const props: MenuProps = this.$props;

      if (props.selectedKeys !== undefined) {
        this.store.setState({
          selectedKeys: props.selectedKeys || []
        });
      }

      if (props.openKeys !== undefined) {
        this.store.setState({
          openKeys: props.openKeys || []
        });
      }
    }
  },

  render() {
    const children: VNode[] = normalizeVNodes(this.$slots.default());

    // simulate `constructor`
    // ================================
    if (!this.store) {
      const props: MenuProps = this.$props;

      let selectedKeys = props.defaultSelectedKeys;
      let openKeys = props.defaultOpenKeys;

      if (props.selectedKeys !== undefined) {
        selectedKeys = props.selectedKeys || [];
      }

      if (props.openKeys !== undefined) {
        openKeys = props.openKeys || [];
      }

      this.store = create({
        selectedKeys,
        openKeys,
        activeKey: {
          '0-menu-': getActiveKey(children, props, props.activeKey)
        }
      });
    }
    // ================================

    let props: MenuProps & {
      class: ClassList;
      style?: CSSProperties;
      parentMenu?: any;
    } & MenuEmits = {
      ...omit(this.$props, [
        'collapsedWidth',
        'siderCollapsed',
        'defaultMotions'
      ])
    } as any;

    const mode = this.getRealMenuMode();

    props = {
      ...props,
      class: [
        `${props.prefixCls}-root`,
        this.$.vnode.props?.class,
        {
          [`${props.prefixCls}-rtl`]: props.direction === 'rtl'
        }
      ],
      style: this.$.vnode.props?.style,
      mode,
      onClick: this.onClick,
      onOpenChange: this.onOpenChange,
      onDeselect: this.onDeselect,
      onSelect: this.onSelect,
      onMouseEnter: this.onMouseEnter,
      onTransitionEnd: this.onTransitionEnd,
      parentMenu: this,
      motion: getMotion(this.$props, this.state, mode),
      overflowedIndicator: (getPropOrSlot(
        this,
        'overflowedIndicator',
        false
      ) ?? <span>···</span>) as VNodeChild
    };

    delete props.openAnimation;
    delete props.openTransitionName;

    return (
      <Provider store={this.store}>
        {/* @ts-ignore */}
        <SubPopupMenu
          {...props}
          ref={this.setInnerMenu}
          v-slots={{ default: () => children }}
        />
      </Provider>
    );
  }
});
