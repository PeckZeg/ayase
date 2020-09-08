import { InjectionKey, defineComponent, provide } from 'vue';
import { Store } from './types';

export const MiniStoreContext: InjectionKey<Store<any> | null> = Symbol();

export interface ProviderProps {
  store: Store;
}

export const Provider = defineComponent<ProviderProps>({
  name: 'Provider',
  inheritAttrs: false,

  // TODO: replace with vue-types
  props: {
    store: { type: Object, required: true }
  } as undefined,

  setup(props) {
    provide(MiniStoreContext, props.store);
    return {};
  },

  render(ctx) {
    return ctx.$slots.default();
  }
});
