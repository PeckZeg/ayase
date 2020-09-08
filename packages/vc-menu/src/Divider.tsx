import { defineComponent } from 'vue';

export interface DividerProps {
  // className?: string;
  rootPrefixCls?: string;
  // style?: CSSProperties;
  disabled?: boolean;
}

export default defineComponent<DividerProps>({
  name: 'Divider',
  inheritAttrs: false,

  // TODO: replace with vue-types
  props: {
    rootPrefixCls: { type: String },

    // To fix keyboard UX.
    disabled: { type: Boolean, default: true }
  } as undefined,

  render() {
    return <li class={`${this.$props.rootPrefixCls}-item-divider`} />;
  }
});
