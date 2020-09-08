import { menuAllProps } from './util';

import { VNode, VNodeChild, defineComponent } from 'vue';
import { getPropOrSlot } from '@ayase/vc-util/lib/instance';

export interface MenuItemGroupProps {
  disabled?: boolean;
  menuItem?: ({ item: VNode, index: number, key: string }) => VNodeChild;
  index?: number;
  // className?: string;
  subMenuKey?: string;
  rootPrefixCls?: string;
  title?: VNodeChild | (() => VNodeChild);
  // onClick?: MenuClickEventHandler;
  direction?: 'ltr' | 'rtl';
}

export default defineComponent<MenuItemGroupProps>({
  name: 'MenuItemGroup',
  isMenuItemGroup: true,
  inheritAttrs: false,

  props: {
    disabled: { type: Boolean, default: true },
    menuItem: { type: Function, default: undefined },
    index: { type: Number, default: undefined },
    subMenuKey: { type: String, default: undefined },
    rootPrefixCls: { type: String, default: undefined },
    title: { type: undefined, default: undefined },
    direction: { type: String, default: undefined }
  } as undefined,

  emits: ['click'],

  methods: {
    renderInnerMenuItem(item: VNode) {
      const renderMenuItem = getPropOrSlot(
        this,
        'menuItem',
        false
      ) as MenuItemGroupProps['menuItem'];

      return renderMenuItem({
        item,
        index: this.$props.index,
        key: this.$props.subMenuKey
      });
    }
  },

  render() {
    const { rootPrefixCls }: MenuItemGroupProps = this.$props;
    const title = getPropOrSlot(this, 'title');
    const props = { ...this.$props, ...this.$attrs };
    const children: VNode[] = this.$slots.default();

    menuAllProps.forEach((key) => delete props[key]);

    // Set onClick to null, to ignore propagated onClick event
    delete props.onClick;
    delete props.direction;

    return (
      <li class={`${rootPrefixCls}-item-group`} {...props}>
        <div
          class={`${rootPrefixCls}-item-group-title`}
          title={typeof title === 'string' ? title : undefined}
        >
          {title}
        </div>

        <ul class={`${rootPrefixCls}-item-group-list`}>
          {children.map(this.renderInnerMenuItem)}
        </ul>
      </li>
    );
  }
});
