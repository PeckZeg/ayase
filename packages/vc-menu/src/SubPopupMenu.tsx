import { MenuItem, MenuItemProps } from './MenuItem';
import { MenuItemGroupProps } from './MenuItemGroup';
import { CSSMotionProps } from '@ayase/vc-motion';
import KeyCode from '@ayase/vc-util/lib/KeyCode';
import DOMWrap from './DOMWrap';
import {
  HTMLAttributes,
  VNodeChild,
  VNode,
  defineComponent,
  cloneVNode
} from 'vue';

import {
  SelectEventHandler,
  OpenEventHandler,
  DestroyEventHandler,
  MiniStore,
  MenuMode,
  LegacyFunctionRef,
  RenderIconType,
  HoverEventHandler,
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuInfo,
  TriggerSubMenuAction,
  SelectInfo
} from './interface';

import {
  getKeyFromChildrenIndex,
  loopMenuItem,
  noop,
  menuAllProps,
  isMobileDevice
} from './util';

import createChainedFunction from '@ayase/vc-util/lib/createChainedFunction';
import { connect } from '@ayase/mini-store';
import shallowEqual from 'shallowequal';
import { ClassList, VueInstance, VueKey } from '@ayase/vc-util/lib/types';
import { getListener } from '@ayase/vc-util/lib/instance';
import { toEmitsList } from '@ayase/vc-util';

function allDisabled(arr: any[]) {
  if (!arr.length) {
    return true;
  }

  return arr.every((c) => !!c.$props.disabled);
}

function updateActiveKey(store: MiniStore, menuId: VueKey, activeKey: VueKey) {
  const state = store.getState();

  store.setState({
    activeKey: {
      ...state.activeKey,
      [menuId]: activeKey
    }
  });
}

function getEventKey(props: SubPopupMenuProps): VueKey {
  // when eventKey not available ,it's menu and return menu id '0-menu-'
  return props.eventKey || '0-menu-';
}

export function getActiveKey(
  children: VNode[],
  props: {
    eventKey?: VueKey;
    defaultActiveFirst?: boolean;
  },
  originalActiveKey: string
) {
  const { eventKey } = props;
  let activeKey: VueKey = originalActiveKey;

  if (activeKey) {
    let found: boolean;

    loopMenuItem(children, (c, i) => {
      if (
        !c?.props?.disabled &&
        activeKey === getKeyFromChildrenIndex(c, eventKey, i)
      ) {
        found = true;
      }
    });

    if (found) {
      return activeKey;
    }
  }

  activeKey = null;

  if (props.defaultActiveFirst) {
    loopMenuItem(children, (c, i) => {
      if (!activeKey && !c?.props?.disabled) {
        activeKey = getKeyFromChildrenIndex(c, eventKey, i);
      }
    });

    return activeKey;
  }

  return activeKey;
}

export function saveRef(c: VueInstance) {
  if (c) {
    const index = this.instanceArray.indexOf(c);

    if (index !== -1) {
      // update component if it's already inside instanceArray
      this.instanceArray[index] = c;
    } else {
      // add component if it's not in instanceArray yet;
      this.instanceArray.push(c);
    }
  }
}

export interface SubPopupMenuProps {
  openKeys?: string[];
  visible?: boolean;
  // children?: React.ReactNode;
  parentMenu?: VueInstance;
  eventKey?: VueKey;
  store?: MiniStore;

  // adding in refactor
  prefixCls?: string;
  focusable?: boolean;
  multiple?: boolean;
  // style?: React.CSSProperties;
  // className?: string;
  defaultActiveFirst?: boolean;
  activeKey?: string;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  defaultOpenKeys?: string[];
  level?: number;
  mode?: MenuMode;
  triggerSubMenuAction?: TriggerSubMenuAction;
  inlineIndent?: number;
  manualRef?: LegacyFunctionRef;
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;

  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  forceSubMenuRender?: boolean;
  builtinPlacements?: BuiltinPlacements;
  role?: string;
  id?: string;
  overflowedIndicator?: VNodeChild;
  theme?: string;

  // [Legacy]
  // openTransitionName?: string;
  // openAnimation?: OpenAnimation;
  motion?: CSSMotionProps;

  direction?: 'ltr' | 'rtl';
}

export interface SubPopupMenuEmits {
  onSelect?: SelectEventHandler;
  onClick?: MenuClickEventHandler;
  onDeselect?: SelectEventHandler;
  onOpenChange?: OpenEventHandler;
  onDestroy?: DestroyEventHandler;
}

const SubPopupMenu = defineComponent<SubPopupMenuProps>({
  name: 'SubPopupMenu',

  emits: toEmitsList<keyof SubPopupMenuEmits>(
    'onSelect',
    'onClick',
    'onDeselect',
    'onOpenChange',
    'onDestroy'
  ),

  // replace with vue-types
  props: {
    openKeys: { type: Array },
    visible: { type: Boolean, default: true },
    // children?: React.ReactNode;
    parentMenu: { type: undefined },
    eventKey: { type: [String, Number] },
    store: { type: undefined },

    // adding in refactor
    prefixCls: { type: String, default: 'vc-menu' },
    focusable: { type: Boolean, default: true },
    multiple: { type: Boolean },
    // style?: React.CSSProperties;
    // className: {type: String},
    defaultActiveFirst: { type: Boolean },
    activeKey: { type: String },
    selectedKeys: { type: Array },
    defaultSelectedKeys: { type: Array },
    defaultOpenKeys: { type: Array },
    level: { type: Number, default: 1 },
    mode: { type: String, default: 'vertical' },
    triggerSubMenuAction: { type: String },
    inlineIndent: { type: Number, default: 24 },
    manualRef: { type: Function },
    itemIcon: { type: Function },
    expandIcon: { type: Function },

    subMenuOpenDelay: { type: Number },
    subMenuCloseDelay: { type: Number },
    forceSubMenuRender: { type: Boolean },
    builtinPlacements: { type: Object },
    role: { type: String },
    id: { type: String },
    overflowedIndicator: { type: undefined },
    theme: { type: String },

    // [Legacy]
    // openTransitionName?: string;
    // openAnimation?: OpenAnimation;
    motion: { type: Object },

    direction: { type: String }
  } as undefined,

  beforeCreate() {
    this.constructed = false;
    this.prevChildren = undefined;
    this.children = undefined;
    this.instanceArray = [];
  },

  mounted() {
    // invoke customized ref to expose component to mixin
    if (this.$props.manualRef) {
      this.$props.manualRef(this);
    }

    this.prevProps = { ...this.$props };
  },

  updated() {
    const props: SubPopupMenuProps = this.$props;
    const { prevProps } = this;

    this.$nextTick(() => {
      const originalActiveKey =
        props.activeKey !== undefined
          ? props.activeKey
          : props.store.getState()[getEventKey(props)];

      const activeKey = getActiveKey(this.children, props, originalActiveKey);

      if (activeKey !== originalActiveKey) {
        updateActiveKey(props.store, getEventKey(props), activeKey);
      } else if (prevProps.activeKey !== undefined) {
        // If prev activeKey is not same as current activeKey,
        // we should set it.
        const prevActiveKey = getActiveKey(
          this.prevChildren,
          prevProps,
          prevProps.activeKey
        );

        if (activeKey !== prevActiveKey) {
          updateActiveKey(props.store, getEventKey(props), activeKey);
        }
      }
    });

    this.prevProps = { ...props };
  },

  methods: {
    /**
     * all keyboard events callbacks run from here at first
     *
     * note:
     *  This legacy code that `onKeyDown` is called by parent instead of dom self.
     *  which need return code to check if this event is handled
     */
    onKeyDown(e: KeyboardEvent, callback: (item: any) => void) {
      const { keyCode } = e;
      let handled: boolean;

      this.getFlatInstanceArray().forEach((obj) => {
        // TODO
        if (obj && obj.$props.active && obj.onKeyDown) {
          handled = obj.onKeyDown(e);
        }
      });

      if (handled) {
        return 1;
      }

      let activeItem: any = null;

      if (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN) {
        activeItem = this.step(keyCode === KeyCode.UP ? -1 : 1);
      }

      if (activeItem) {
        e.preventDefault();
        updateActiveKey(
          this.$props.store,
          getEventKey(this.$props),
          activeItem.$props.eventKey
        );

        if (typeof callback === 'function') {
          callback(activeItem);
        }

        return 1;
      }

      return undefined;
    },

    onItemHover(e: Parameters<HoverEventHandler>[0]) {
      const { key, hover } = e;

      updateActiveKey(
        this.$props.store,
        getEventKey(this.$props),
        hover ? key : null
      );
    },

    onDeselect(selectInfo: SelectInfo) {
      const onDeselect = getListener<SelectEventHandler>(this, 'onDeselect');

      if (onDeselect) {
        onDeselect(selectInfo);
      }
    },

    onSelect(selectInfo: SelectInfo) {
      const onSelect = getListener<SelectEventHandler>(this, 'onSelect');

      if (onSelect) {
        onSelect(selectInfo);
      }
    },

    onClick(e: MenuInfo) {
      const onClick = getListener<MenuClickEventHandler>(this, 'onClick');

      if (onClick) {
        onClick(e);
      }
    },

    onOpenChange(e: Parameters<OpenEventHandler>[0]) {
      const onOpenChange = getListener<OpenEventHandler>(this, 'onOpenChange');

      if (onOpenChange) {
        onOpenChange(e);
      }
    },

    onDestroy(key: VueKey) {
      const onDestroy = getListener<DestroyEventHandler>(this, 'onDestroy');

      if (onDestroy) {
        onDestroy(key);
      }
    },

    getFlatInstanceArray() {
      return this.instanceArray;
    },

    step(direction: number) {
      let children = this.getFlatInstanceArray();

      const activeKey = this.$props.store.getState().activeKey[
        getEventKey(this.$props)
      ];

      const len = children.length;

      if (!len) {
        return null;
      }

      if (direction < 0) {
        children = children.concat().reverse();
      }

      // find current activeIndex
      let activeIndex = -1;

      children.every((c, ci) => {
        if (c && c.$props.eventKey === activeKey) {
          activeIndex = ci;
          return false;
        }
        return true;
      });

      if (
        !this.$props.defaultActiveFirst &&
        activeIndex !== -1 &&
        allDisabled(children.slice(activeIndex, len - 1))
      ) {
        return undefined;
      }

      const start = (activeIndex + 1) % len;
      let i = start;

      do {
        const child = children[i];
        if (!child || child.$props.disabled) {
          i = (i + 1) % len;
        } else {
          return child;
        }
      } while (i !== start);

      return null;
    },

    renderCommonMenuItem(child: VNode, i: number, extraProps: MenuItemProps) {
      const state = this.$props.store.getState();
      const props: SubPopupMenuProps = this.$props;
      const key = getKeyFromChildrenIndex(child, props.eventKey, i);
      const childProps = child.props ?? {};

      // https://github.com/ant-design/ant-design/issues/11517#issuecomment-477403055
      // TODO
      // if (!childProps || typeof child.type === 'string') {
      //   return child;
      // }

      const isActive = key === state.activeKey;

      const newChildProps: MenuItemProps &
        MenuItemGroupProps &
        SubPopupMenuProps & { [key: string]: any } = {
        mode: childProps.mode || props.mode,
        level: props.level,
        inlineIndent: props.inlineIndent,
        menuItem: this.renderMenuItem,
        rootPrefixCls: props.prefixCls,
        index: i,
        parentMenu: props.parentMenu,
        // customized ref function, need to be invoked manually in child's componentDidMount
        manualRef: childProps.disabled
          ? undefined
          : (createChainedFunction(
              (child as any).ref,
              saveRef.bind(this)
            ) as LegacyFunctionRef),
        eventKey: key,
        active: !childProps.disabled && isActive,
        multiple: props.multiple,
        onClick: (e: MenuInfo) => {
          (childProps.onClick || noop)(e);
          this.onClick(e);
        },
        onItemHover: this.onItemHover,
        motion: props.motion,
        subMenuOpenDelay: props.subMenuOpenDelay,
        subMenuCloseDelay: props.subMenuCloseDelay,
        forceSubMenuRender: props.forceSubMenuRender,
        onOpenChange: this.onOpenChange,
        onDeselect: this.onDeselect,
        onSelect: this.onSelect,
        builtinPlacements: props.builtinPlacements,
        itemIcon: childProps.itemIcon || this.$props.itemIcon,
        expandIcon: childProps.expandIcon || this.$props.expandIcon,
        ...extraProps,
        direction: props.direction
      };

      // ref: https://github.com/ant-design/ant-design/issues/13943
      if (props.mode === 'inline' || isMobileDevice()) {
        newChildProps.triggerSubMenuAction = 'click';
      }

      return cloneVNode(child, newChildProps);
    },

    renderMenuItem(c: VNode, i: number, subMenuKey: VueKey) {
      if (!c) {
        return null;
      }

      const state = this.$props.store.getState();
      const extraProps = {
        openKeys: state.openKeys,
        selectedKeys: state.selectedKeys,
        triggerSubMenuAction: this.$props.triggerSubMenuAction,
        subMenuKey
      };

      return this.renderCommonMenuItem(c, i, extraProps);
    }
  },

  render() {
    this.prevChildren = this.children;
    this.children = this.$slots.default();

    // simulate `constructor`
    // ================================
    if (!this.constructed) {
      const props: SubPopupMenuProps = this.$props;

      props.store.setState({
        activeKey: {
          ...props.store.getState().activeKey,
          [props.eventKey]: getActiveKey(this.children, props, props.activeKey)
        }
      });

      this.constructed = true;
    }
    // ================================

    const { ...props }: SubPopupMenuProps = this.$props;
    this.instanceArray = [];
    const classList: ClassList = [
      props.prefixCls,
      `${props.prefixCls}-${props.mode}`
    ];

    const domProps: HTMLAttributes = {
      class: classList,

      // role could be 'select' and by default set to menu
      role: props.role || 'menu'
    };

    if (props.id) {
      domProps.id = props.id;
    }

    if (props.focusable) {
      domProps.tabindex = 0;
      domProps.onKeydown = this.onKeyDown;
    }

    const {
      prefixCls,
      eventKey,
      visible,
      level,
      mode,
      overflowedIndicator,
      theme
    } = props;

    menuAllProps.forEach((key) => delete props[key]);

    // Otherwise, the propagated click event will trigger another onClick
    delete (props as any).onClick;

    const domWrapProps = {
      ...props,
      prefixCls,
      mode,
      tag: 'ul',
      level,
      theme,
      visible,
      overflowedIndicator,
      ...domProps
    };

    return (
      <DOMWrap
        {...domWrapProps}
        v-slots={{
          ...this.$slots,

          default: () =>
            this.children.map((c, i) =>
              this.renderMenuItem(c, i, eventKey || '0-menu-')
            )
        }}
      />
    );
  }
});

const connected = connect()(SubPopupMenu);

export default connected;
