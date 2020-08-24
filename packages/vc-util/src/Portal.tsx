import { Teleport, defineComponent } from 'vue';

interface PortalProps {
  getContainer: () => HTMLElement;
  didUpdate?: Function;
}

export default defineComponent<PortalProps>({
  name: 'Portal',

  props: {
    getContainer: { type: Function, required: true },
    didUpdate: { type: Function }
  } as undefined,

  beforeCreate() {
    this._container = undefined;
  },

  mounted() {
    this.$nextTick(() => {
      this.createContainer();
    });

    this.prevProps = { ...this.$props };
  },

  updated() {
    this.$nextTick(() => {
      const { didUpdate }: PortalProps = this.$props;

      if (didUpdate) {
        didUpdate(this.prevProps);
      }
    });

    this.prevProps = { ...this.$props };
  },

  beforeUnmount() {
    this.removeContainer();
  },

  methods: {
    createContainer() {
      this._container = (this.$props as PortalProps).getContainer();
      this.$forceUpdate();
    },

    removeContainer() {
      if (this._container) {
        this._container.parentNode.removeChild(this._container);
      }
    }
  },

  render(ctx) {
    if (this._container) {
      return <Teleport to={this._container}>{ctx.$slots.default()}</Teleport>;
    }

    return null;
  }
});
