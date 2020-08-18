import { VNode, defineComponent, cloneVNode } from 'vue';
import { getPropOrSlot } from '@ayase/vc-util/lib/instance';

export default defineComponent<{ title: VNode }>({
  name: 'LabelItem',
  inheritAttrs: false,
  props: ['title'] as undefined,

  render(ctx) {
    const [children] = ctx.$slots.default();
    const { type, props } = children;

    const style = {
      display: 'inline-flex',
      padding: '0 8px',
      alignItems: 'center'
    };

    const spacing = <span style={{ width: '4px' }} />;

    if (type === 'input' && children.props?.type === 'checkbox') {
      return (
        <label style={style}>
          {cloneVNode(children, ctx.$attrs)}
          {spacing}
          {getPropOrSlot(ctx, 'title')}
        </label>
      );
    }

    return (
      <label style={style}>
        {getPropOrSlot(ctx, 'title')}
        {spacing}
        {cloneVNode(children, ctx.$attrs)}
      </label>
    );
  }
});
