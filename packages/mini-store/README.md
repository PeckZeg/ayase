# mini-store

[![NPM version][npm-image]][npm-url]
[![David dm][david-dm-image]][david-dm-url]
[![node version][node-image]][node-url]

[npm-image]: http://img.shields.io/npm/v/@ayase/mini-store.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ayase/mini-store
[david-dm-image]: https://img.shields.io/david/PeckZeg/ayase.svg?path=packages/mini-store
[david-dm-url]: https://david-dm.org/PeckZeg/ayase?path=packages/mini-store
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

> [`mini-store`](https://github.com/yesmeck/mini-store) for vue 3

A state store for React component.

## Install

[![mini-store](https://nodei.co/npm/@ayase/mini-store.png)](https://www.npmjs.com/package/@ayase/mini-store)

## Example

```jsx
import { Provider, create, connect } from '@ayase/mini-store';
import { computed } from 'vue';

const Counter = {
  name: 'Counter',

  setup() {
    return { store: computed(() => create({ count: 0 })) };
  },

  render() {
    return (
      <Provider store={this.store}>
        <div>
          <Buttons />
          <Result />
        </div>
      </Provider>
    );
  }
};

const Buttons = connect()({
  name: 'Buttons',
  props: ['store'],

  methods: {
    handleClick(step) {
      const { count } = this.store.getState();
      this.store.setState({ count: count + step });
    }
  },

  render() {
    return (
      <div>
        <button onClick={() => this.handleClick(1)}>+</button>
        <button onClick={() => this.handleClick(-1)}>-</button>
      </div>
    );
  }
});

const Result = connect((state) => ({ count: state.count }))({
  props: ['count'],

  render() {
    return <div>{this.count}</div>;
  }
});
```

## API

### `create(initialState)`

Creates a store that holds the state. `initialState` is plain object.

### `<Provider store>`

Makes the store available to the connect() calls in the component hierarchy below.

### `connect(mapStateToProps)`

Connects a React component to the store. It works like Redux's `connect`, but only accept `mapStateToProps`. The connected component also receive `store` as a prop, you can call `setState` directly on store.

## Development

```
yarn install
yarn start
```

## License

MIT
