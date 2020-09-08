import KeyCode from '@ayase/vc-util/lib/KeyCode';
import { CSSProperties, defineComponent } from 'vue';

import {
  SelectEventHandler,
  HoverEventHandler,
  DestroyEventHandler,
  RenderIconType,
  MenuHoverEventHandler,
  MenuClickEventHandler,
  MenuMode,
  LegacyFunctionRef
} from './interface';

import { connect } from '@ayase/mini-store';
import { noop, menuAllProps } from './util';
import omit from 'omit.js';
import { ClassList, VueInstance, VueKey } from '@ayase/vc-util/lib/types';
import { getListener, getPropOrSlot } from '@ayase/vc-util/lib/instance';
import { toEmitsList } from '@ayase/vc-util';

export interface MenuItemProps {
  /** @deprecated No place to use this. Should remove */
  attribute?: Record<string, string>;
  rootPrefixCls?: string;
  eventKey?: VueKey;
  // className?: string;
  // style?: React.CSSProperties;
  active?: boolean;
  // children?: React.ReactNode;
  selectedKeys?: string[];
  disabled?: boolean;
  title?: string;

  parentMenu?: VueInstance;

  multiple?: boolean;
  isSelected?: boolean;
  manualRef?: LegacyFunctionRef;
  itemIcon?: RenderIconType;
  role?: string;
  mode?: MenuMode;
  inlineIndent?: number;
  level?: number;
  direction?: 'ltr' | 'rtl';
}

export interface MenuItemEmits {
  onItemHover?: HoverEventHandler;
  onSelect?: SelectEventHandler;
  onClick?: MenuClickEventHandler;
  onDeselect?: SelectEventHandler;
  onDestroy?: DestroyEventHandler;
  onMouseEnter?: MenuHoverEventHandler;
  onMouseLeave?: MenuHoverEventHandler;
}

export const MenuItem = defineComponent<MenuItemProps>({
  name: 'MenuItem',
  isMenuItem: true,
  inheritAttrs: false,

  emits: toEmitsList<keyof MenuItemEmits>(
    'onItemHover',
    'onSelect',
    'onClick',
    'onDeselect',
    'onDestroy',
    'onMouseEnter',
    'onMouseLeave'
  ),

  // TODO: replace with vue-types
  props: {
    attribute: { type: Object },
    rootPrefixCls: { type: String },
    eventKey: { type: [String, Number] },
    active: { type: Boolean },
    selectedKeys: { type: Array },
    disabled: { type: Boolean },
    title: { type: String },
    parentMenu: { type: undefined },
    multiple: { type: Boolean },
    isSelected: { type: Boolean },
    manualRef: { type: Function },
    itemIcon: { type: undefined },
    role: { type: String },
    mode: { type: String },
    inlineIndent: { type: Number },
    level: { type: Number },
    direction: { type: String }
  } as undefined,

  computed: {
    prefixCls() {
      return `${this.$props.rootPrefixCls}-item`;
    },

    activeClass() {
      return `${this.prefixCls}-active`;
    },

    selectedClass() {
      return `${this.prefixCls}-selected`;
    },

    disabledClass() {
      return `${this.prefixCls}-disabled`;
    }
  },

  mounted() {
    // invoke customized ref to expose component to mixin
    this.callRef();
  },

  updated() {
    this.callRef();
  },

  beforeUnmount() {
    const onDestroy = getListener<DestroyEventHandler>(this, 'onDestroy');

    if (onDestroy) {
      onDestroy(this.$props.eventKey);
    }
  },

  methods: {
    onKeyDown(e: KeyboardEvent): boolean | undefined {
      if (e.keyCode === KeyCode.ENTER) {
        this.onClick(e as any);
        return true;
      }

      return undefined;
    },

    onMouseLeave(e: MouseEvent) {
      const { eventKey }: MenuItemProps = this.$props;
      const onItemHover = getListener<HoverEventHandler>(this, 'onItemHover');
      const onMouseEnter = getListener<MenuHoverEventHandler>(
        this,
        'onMouseEnter'
      );

      if (onItemHover) {
        onItemHover({ key: eventKey, hover: false });
      }

      if (onMouseEnter) {
        onMouseEnter({ key: eventKey, domEvent: e });
      }
    },

    onMouseEnter(e: MouseEvent) {
      const { eventKey }: MenuItemProps = this.$props;
      const onItemHover = getListener<HoverEventHandler>(this, 'onItemHover');
      const onMouseEnter = getListener<MenuHoverEventHandler>(
        this,
        'onMouseEnter'
      );

      if (onItemHover) {
        onItemHover({
          key: eventKey,
          hover: true
        });
      }

      if (onMouseEnter) {
        onMouseEnter({
          key: eventKey,
          domEvent: e
        });
      }
    },

    onClick(e: MouseEvent) {
      const { eventKey, multiple, isSelected }: MenuItemProps = this.$props;
      const onClick = getListener<MenuClickEventHandler>(this, 'onClick');
      const onSelect = getListener<SelectEventHandler>(this, 'onSelect');
      const onDeselect = getListener<SelectEventHandler>(this, 'onDeselect');

      const info = {
        key: eventKey,
        keyPath: [eventKey],
        item: this,
        domEvent: e
      };

      if (onClick) {
        onClick(info);
      }

      if (multiple) {
        if (isSelected) {
          if (onDeselect) {
            onDeselect(info);
          }
        } else {
          if (onSelect) {
            onSelect(info);
          }
        }
      } else if (!isSelected) {
        if (onSelect) {
          onSelect(info);
        }
      }
    },

    saveNode(node: HTMLLIElement) {
      this.node = node;
    },

    callRef() {
      if (this.$props.manualRef) {
        this.$props.manualRef(this);
      }
    }
  },

  render() {
    const props: MenuItemProps = this.$props;

    // prettier-ignore
    const classList: ClassList = [this.prefixCls, this.$.vnode.props?.class, {
      [this.activeClass]: !props.disabled && props.active,
      [this.selectedClass]: props.isSelected,
      [this.disabledClass]: props.disabled,
    }];

    let attrs: {
      title?: string;
      class?: ClassList;
      style?: CSSProperties;
      role?: string;
      'aria-disabled'?: boolean;
      'aria-selected'?: boolean;
    } = {
      ...props.attribute,
      title: typeof props.title === 'string' ? props.title : undefined,
      class: classList,
      style: this.$.vnode.props?.style,
      // set to menuitem by default
      role: props.role || 'menuitem',
      'aria-disabled': props.disabled
    };

    if (props.role === 'option') {
      // overwrite to option
      attrs = {
        ...attrs,
        role: 'option',
        'aria-selected': props.isSelected
      };
    } else if (props.role === null || props.role === 'none') {
      // sometimes we want to specify role inside <li/> element
      // <li><a role='menuitem'>Link</a></li> would be a good example
      // in this case the role on <li/> should be "none" to
      // remove the implied listitem role.
      // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menubar/menubar-1/menubar-1.html
      attrs.role = 'none';
    }

    // In case that onClick/onMouseLeave/onMouseEnter is passed down from owner
    const mouseEvent = {
      onClick: props.disabled ? null : this.onClick,
      onMouseleave: props.disabled ? null : this.onMouseLeave,
      onMouseenter: props.disabled ? null : this.onMouseEnter
    };

    const style: CSSProperties = {};

    if (props.mode === 'inline') {
      if (props.direction === 'rtl') {
        style.paddingRight = `${props.inlineIndent * props.level}px`;
      } else {
        style.paddingLeft = `${props.inlineIndent * props.level}px`;
      }
    }

    let icon = getPropOrSlot(this, 'itemIcon', false);

    if (typeof icon === 'function') {
      icon = (icon as Function)(props);
    }

    const itemProps = { ...attrs, ...mouseEvent };

    return (
      <li {...itemProps} ref={this.saveNode} style={style}>
        {this.$slots.default()}
        {icon}
      </li>
    );
  }
});

const connected = connect<any, any, any>(
  ({ activeKey, selectedKeys }, { eventKey, subMenuKey }) => ({
    active: activeKey[subMenuKey] === eventKey,
    isSelected: selectedKeys.indexOf(eventKey) !== -1
  })
)(MenuItem);

connected.isMenuItem = true;

export default connected;
