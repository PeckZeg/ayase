import { MouseEventHandler, TouchEventHandler } from '@ayase/vc-util/lib/types';
import { getListeners, getListener } from '@ayase/vc-util/lib/instance';
import { defineComponent, ComponentPublicInstance, Ref } from 'vue';
import { toEmitsList } from '@ayase/vc-util';

interface PopupInnerProps {
  prefixCls: string;
  forwardRef?: Ref<HTMLDivElement>;
}

interface PopupInnerEmitMethods {
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  onMouseDown?: MouseEventHandler;
  onTouchStart?: TouchEventHandler;
}

export default defineComponent<PopupInnerProps>({
  name: 'PopupInner',

  props: {
    prefixCls: { type: String, default: undefined }
  } as undefined,

  emits: toEmitsList(
    'onMouseEnter',
    'onMouseLeave',
    'onMouseDown',
    'onTouchStart'
  ),

  render(ctx: ComponentPublicInstance<PopupInnerProps>) {
    const { prefixCls } = ctx.$props;
    const children = ctx.$slots.default();
    let childNode: any = children;
    const [onMouseEnter, onMouseLeave, onMouseDown] = getListeners<
      MouseEventHandler
    >(ctx, 'onMouseEnter', 'onMouseLeave', 'onMouseDown');
    const onTouchStart = getListener<TouchEventHandler>(ctx, 'onTouchStart');

    // console.log('PopupInner', this);

    if (children.length > 1) {
      childNode = <div class={`${prefixCls}-content`}>{children}</div>;
    }

    return (
      <div
        onMouseenter={onMouseEnter}
        onMouseleave={onMouseLeave}
        onMousedown={onMouseDown}
        onTouchstart={onTouchStart}
      >
        {childNode}
      </div>
    );
  }
});
