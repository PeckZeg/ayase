import { Provider, Store, create, connect } from '../src';
import { Component, defineComponent, ref } from 'vue';
import { VueWrapper, mount } from '@vue/test-utils';

let StatelessApp: Component;
let Connected: any;
let store: Store<any>;
let wrapper: VueWrapper<any>;

function getWrapperText(wrapper: VueWrapper<any>) {
  return wrapper.element.parentElement.textContent;
}
defineComponent<{ msg: string; count: number }>({
  props: ['msg', 'count'] as undefined,

  render() {
    return <div>{this.$props.msg}</div>;
  }
});

describe('stateless', () => {
  beforeEach(() => {
    StatelessApp = defineComponent<{ msg: string }>({
      inheritAttrs: false,

      props: ['msg'] as undefined,

      render() {
        return <div>{this.$props.msg}</div>;
      }
    });

    Connected = connect((state) => state)(StatelessApp);
    store = create({ msg: 'hello', count: 0 });
    wrapper = mount(() => (
      <Provider store={store}>
        <Connected />
      </Provider>
    ));
  });

  test('map state to props', async () => {
    await wrapper.vm.$nextTick();
    expect(getWrapperText(wrapper)).toBe('hello');
  });

  test('renrender as subscribed state changes', async () => {
    store.setState({ msg: 'halo' });

    await wrapper.vm.$nextTick();
    expect(getWrapperText(wrapper)).toBe('halo');
  });

  test('do not subscribe', async () => {
    Connected = connect()(StatelessApp);

    wrapper = mount(() => (
      <Provider store={store}>
        <Connected msg="hello" />
      </Provider>
    ));

    await wrapper.vm.$nextTick();
    expect(wrapper.vm.unsubscribe).toBeUndefined();
  });

  test('pass own props to mapStateToProps', async () => {
    Connected = connect<{ msg: string }, { name: string }, { msg: string }>((state, props) => ({
      msg: `${state.msg} ${props.name}`
    }))(StatelessApp);

    wrapper = mount(() => (
      <Provider store={store}>
        <Connected name="world" />
      </Provider>
    ));

    await wrapper.vm.$nextTick();
    expect(getWrapperText(wrapper)).toBe('hello world');
  });

  test('mapStateToProps is invoked when own props changes', async () => {
    Connected = connect<{ msg: string }, { name: string }, { msg: string }>((state, props) => ({
      msg: `${state.msg} ${props.name}`
    }))(StatelessApp);

    const connectedRef = ref(null);

    const App = defineComponent({
      data() {
        return {
          state: {
            name: 'world'
          }
        };
      },

      render() {
        return (
          <div>
            <button onClick={() => (this.state.name = 'there')}>Click</button>
            <div>{this.state.name}</div>
            <Connected ref={connectedRef} name={this.state.name} />
          </div>
        );
      }
    });

    wrapper = mount(() => (
      <Provider store={store}>
        <App />
      </Provider>
    ));

    await wrapper.find('button').trigger('click');
    expect(connectedRef.value.$el.textContent).toBe('hello there');
  });

  test('mapStateToProps is not invoked when own props is not used', async () => {
    const mapStateToProps = jest.fn((state) => ({ msg: state.msg }));
    Connected = connect(mapStateToProps)(StatelessApp);

    const App = defineComponent({
      data() {
        return {
          state: {
            name: 'world'
          }
        };
      },

      render() {
        return (
          <div>
            <button onClick={() => (this.state.name = 'there')}>Click</button>
            <Connected name={this.state.name} />
          </div>
        );
      }
    });

    wrapper = mount(() => (
      <Provider store={store}>
        <App />
      </Provider>
    ));

    await wrapper.find('button').trigger('click');
    expect(mapStateToProps).toHaveBeenCalledTimes(2);
  });

  // https://github.com/ant-design/ant-design/issues/11723
  test('rerender component when props changes', async () => {
    interface Props {
      visible: boolean;
    }

    const Dummy = defineComponent<Props>({
      inheritAttrs: false,
      props: ['visible'] as undefined,

      render(vm) {
        return <div>{vm.$props.visible && 'hello'}</div>;
      }
    });

    Connected = connect<Props, { ownVisible: boolean }, Props>((state, props) => ({
      visible: state.visible === false ? props.ownVisible : state.visible
    }))(Dummy);

    const connectedRef = ref(null);

    const App = defineComponent({
      inheritAttrs: false,

      data() {
        return {
          state: {
            visible: true
          }
        };
      },

      render() {
        return (
          <div>
            <button onClick={() => (this.state.visible = false)}>Click</button>
            <Connected ref={connectedRef} ownVisible={this.state.visible} />
          </div>
        );
      }
    });

    store = create({ visible: false });

    wrapper = mount(() => (
      <Provider store={store}>
        <App />
      </Provider>
    ));

    await wrapper.find('button').trigger('click');
    expect(connectedRef.value.$el.textContent).toBe('');
    store.setState({ visible: true });
    await wrapper.vm.$nextTick();
    expect(connectedRef.value.$el.textContent).toBe('hello');
  });
});
