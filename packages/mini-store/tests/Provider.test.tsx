import { MiniStoreContext } from '../src/Provider';
import { Provider, create } from '../src';

import { defineComponent, inject } from 'vue';
import { mount } from '@vue/test-utils';

test('store context', (done) => {
  const store = create({});

  const App = defineComponent({
    setup() {
      return {
        contextStore: inject(MiniStoreContext)
      };
    },

    render() {
      expect(this.contextStore).toBe(store);
      done();

      return <div>hello</div>;
    }
  });

  mount(() => (
    <Provider store={store}>
      <App />
    </Provider>
  ));
});
