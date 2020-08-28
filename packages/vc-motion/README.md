# vc-motion

Vue 3 lifecycle controlled motion library.

[![NPM version][npm-image]][npm-url]
[![David dm][david-dm-image]][david-dm-url]
[![node version][node-image]][node-url]

[npm-image]: http://img.shields.io/npm/v/@ayase/vc-motion.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ayase/vc-motion
[david-dm-image]: https://img.shields.io/david/PeckZeg/ayase.svg?path=packages/vc-motion
[david-dm-url]: https://david-dm.org/PeckZeg/ayase?path=packages/vc-motion
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

> [`rc-motion`](https://github.com/react-component/motion) for vue 3

## Install

[![vc-motion](https://nodei.co/npm/@ayase/vc-motion.png)](https://www.npmjs.com/package/@ayase/vc-motion)

## Example

```vue
<template>
  <CSSMotion :visible="visible" motion-name="my-motion">
    <template v-slot="props">
      <div v-bind="props" />
    </template>
  </CSSMotion>
</template>

<script>
import CSSMotion from '@ayase/vc-motion';

export default {
  components: { CSSMotion },

  data() {
    return {
      visible: false
    };
  }
};
</script>
```

## API

### `CSSMotion`

#### Props

| Prop                     | Description                                                  | Type                  | Default |
| ------------------------ | ------------------------------------------------------------ | --------------------- | ------- |
| `motionName`             | Config motion name, will dynamic update when status changed  | `string`              | -       |
| `visible`                | Trigger motion events                                        | `boolean`             | `true`  |
| `motionAppear`           | Use motion when appear                                       | `boolean`             | `true`  |
| `motionEnter`            | Use motion when enter                                        | `boolean`             | `true`  |
| `motionLeave`            | Use motion when leave                                        | `boolean`             | `true`  |
| `motionLeaveImmediately` | Will trigger leave even on mount                             | `boolean`             | -       |
| `motionDeadline`         | Trigger motion status change even when motion event not fire | `number`              | -       |
| `removeOnLeave`          | Remove element when motion leave end                         | `boolean`             | `true`  |
| `leavedClass`            | Set leaved element className                                 | `string/object/array` | -       |

#### Slots

| Name      | Params                             | Description             |
| --------- | ---------------------------------- | ----------------------- |
| `default` | `({ ref, class, style }) => VNode` | render default children |

#### Emits

| Name             | Params                                  | Description                                                    |
| ---------------- | --------------------------------------- | -------------------------------------------------------------- |
| `onAppearStart`  | `(HTMLElement, Event) => CSSProperties` | Trigger when appear start, return style will patch to element  |
| `onEnterStart`   | `(HTMLElement, Event) => CSSProperties` | Trigger when enter start, return style will patch to element   |
| `onLeaveStart`   | `(HTMLElement, Event) => CSSProperties` | Trigger when leave start, return style will patch to element   |
| `onAppearActive` | `(HTMLElement, Event) => CSSProperties` | Trigger when appear active, return style will patch to element |
| `onEnterActive`  | `(HTMLElement, Event) => CSSProperties` | Trigger when enter active, return style will patch to element  |
| `onLeaveActive`  | `(HTMLElement, Event) => CSSProperties` | Trigger when leave active, return style will patch to element  |
| `onAppearEnd`    | `(HTMLElement, Event) => boolean`       | Trigger when appear end, will not finish when return false     |
| `onEnterEnd`     | `(HTMLElement, Event) => boolean`       | Trigger when enter end, will not finish when return false      |
| `onLeaveEnd`     | `(HTMLElement, Event) => boolean`       | Trigger when leave end, will not finish when return false      |

### CSSMotionList

extends all the props from CSSMotion

#### Props

| Prop        | Description       | Type               | Default |
| ----------- | ----------------- | ------------------ | ------- |
| `keys`      | Motion list keys  | `VNode['key'][]`   | -       |
| `component` | wrapper component | `string/Component` | `div`   |

## Development

```
yarn install
yarn start
```

## License

vc-motion is released under the MIT license.
