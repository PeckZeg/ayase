import { generateTrigger } from './index';
import { defineComponent } from 'vue';

interface MockPortalProps {
  didUpdate: () => void;
  getContainer: () => HTMLElement;
}

const MockPortal = defineComponent<MockPortalProps>({
  name: 'MockPortal',

  props: {
    didUpdate: { type: Function },
    getContainer: { type: Function }
  } as undefined,

  mounted() {
    this.$props.didUpdate();
    this.$props.getContainer();
  },

  render(ctx) {
    return ctx.$slots.default();
  }
});

export default generateTrigger(MockPortal);
