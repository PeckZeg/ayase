# vc-trigger

Vue 3 Trigger Component

[![NPM version][npm-image]][npm-url]
[![David dm][david-dm-image]][david-dm-url]
[![node version][node-image]][node-url]

[npm-image]: http://img.shields.io/npm/v/@ayase/vc-trigger.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ayase/vc-trigger
[david-dm-image]: https://img.shields.io/david/PeckZeg/ayase.svg?path=packages/vc-trigger
[david-dm-url]: https://david-dm.org/PeckZeg/ayase?path=packages/vc-trigger
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

> [`rc-trigger`](https://github.com/react-component/trigger) for vue 3

## Install

[![vc-trigger](https://nodei.co/npm/@ayase/vc-trigger.png)](https://www.npmjs.com/package/@ayase/vc-trigger)

## Usage

Include the default [styling](https://github.com/PeckZeg/ayase/blob/master/packages/vc-trigger/assets/index.less) and then:

```vue
<template>
  <Trigger
    :action="['click']"
    :popup-align="{
      points: ['tl', 'bl'],
      offset: [0, 3]
    }"
  >
    <template v-slot:popup>
      <span>popup</span>
    </template>

    <a href="#">hover</a>
  </Trigger>
</template>

<script>
import Trigger from '@ayase/vc-trigger';

export default {
  components: { Trigger }
};
</script>
```

## API

| Prop                     | Description                                                                                                                                  | Type                        | Default            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------ |
| `alignPoint`             | Popup will align with mouse position (support action of 'click', 'hover' and 'contextMenu')                                                  | `boolean`                   | `false`            |
| `popupClass`             | additional className added to popup                                                                                                          | `string`                    | -                  |
| `forceRender`            | whether render popup before first show                                                                                                       | `boolean`                   | `false`            |
| `destroyPopupOnHide`     | whether destroy popup when hide                                                                                                              | `boolean`                   | `false`            |
| `getPopupClassFromAlign` | additional className added to popup according to align                                                                                       | `(align: object) => string` | -                  |
| `action`                 | which actions cause popup shown. enum of `"hover"`, `click`, `"focus"`, `"contextMenu"`                                                      | `string[]`                  | `['hover']`        |
| `mouseEnterDelay`        | delay time to show when mouse enter. unit: s.                                                                                                | `number`                    | `0`                |
| `mouseLeaveDelay`        | delay time to hide when mouse leave. unit: s.                                                                                                | `number`                    | `0.1`              |
| `popupStyle`             | additional style of popup                                                                                                                    | `Object`                    | -                  |
| `prefixCls`              | prefix class name                                                                                                                            | `string`                    | `vc-trigger-popup` |
| `popupTransitionName`    | [`vc-motion`][vc-motion]                                                                                                                     | `string/Object`             | -                  |
| `maskTransitionName`     | [`vc-motion`][vc-motion]                                                                                                                     | `string/Object`             | -                  |
| `mask`                   | whether to support mask                                                                                                                      | `boolean`                   | `false`            |
| `maskClosable`           | whether to support click mask to hide                                                                                                        | `boolean`                   | `true`             |
| `popupVisible`           | whether popup is visible                                                                                                                     | `boolean`                   | -                  |
| `zIndex`                 | popup's zIndex                                                                                                                               | `number`                    | -                  |
| `defaultPopupVisible`    | whether popup is visible initially                                                                                                           | `boolean`                   | -                  |
| `popupAlign`             | popup 's align config, [`dom-align`][dom-align]                                                                                              | `object`                    | -                  |
| `getPopupContainer`      | function returning html node which will act as popup container                                                                               | `() => HTMLElement`         | -                  |
| `getDocument`            | function returning document node which will be attached click event to close trigger                                                         | `() => HTMLElement`         | -                  |
| `popupPlacement`         | use preset popup align config from builtinPlacements, can be merged by popupAlign prop                                                       | `string`                    | -                  |
| `builtinPlacements`      | builtin placement align map. used by placement prop                                                                                          | `object`                    | -                  |
| `stretch`                | Let popup div stretch with trigger element. enums of 'width', 'minWidth', 'height', 'minHeight'. (You can also mixed with 'height minWidth') | `string`                    | -                  |

#### Slots

| Name    | Params                   | Description   |
| ------- | ------------------------ | ------------- |
| `popup` | `() => VNode \| VNode[]` | popup content |

#### Emits

| Name                   | Params                        | Description                         |
| ---------------------- | ----------------------------- | ----------------------------------- |
| `onPopupVisibleChange` | `() => void`                  | call when popup visible is changed  |
| `onPopupAlign`         | (popupDomNode, align) => void | callback when popup node is aligned |

## Development

```
yarn install
yarn start
```

## License

MIT
