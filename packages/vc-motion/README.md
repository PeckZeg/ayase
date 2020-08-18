# vc-motion

> the original repo: [`rc-motion`](https://github.com/react-component/motion)

Vue 3 lifecycle controlled motion library.

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

## Development

```
yarn install
yarn start
```

## License

vc-motion is released under the MIT license.
