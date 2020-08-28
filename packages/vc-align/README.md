# `vc-align`

Vue 3 Align Component. Wrapper around https://github.com/yiminghe/dom-align.

[![NPM version][npm-image]][npm-url]
[![David dm][david-dm-image]][david-dm-url]
[![node version][node-image]][node-url]

[npm-image]: http://img.shields.io/npm/v/@ayase/vc-align.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ayase/vc-align
[david-dm-image]: https://img.shields.io/david/PeckZeg/ayase.svg?path=packages/vc-align
[david-dm-url]: https://david-dm.org/PeckZeg/ayase?path=packages/vc-align
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

> [`rc-align`](https://github.com/react-component/align) for vue 3

## Install

[![vc-align](https://nodei.co/npm/@ayase/vc-align.png)](https://www.npmjs.com/package/@ayase/vc-align)

## Usage

```vue
<template>
  <Align :align="{ points: ['cc', 'cc'] }" :target="() => document.body">
    <div />
  </Align>
</template>

<script>
import Align from '@ayase/vc-align';

export default {
  components: { Align }
};
</script>
```

## API

### Props

| Prop                  | Description                                                                                                         | Type                                                                                            | Default        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------- |
| `align`               | same with alignConfig from [dom-align](https://github.com/yiminghe/dom-align)                                       | `Object`                                                                                        | -              |
| `target`              | a function which returned value or point is used for target from [dom-align](https://github.com/yiminghe/dom-align) | `() => HTMLElement \| { pageX: number, pageY: number } \| { clientX: number, clientY: number }` | `() => window` |
| `monitorWindowResize` | whether realign when window is resized                                                                              | `boolean`                                                                                       | `false`        |

## License

MIT
