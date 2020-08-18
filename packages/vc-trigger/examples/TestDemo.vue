<template>
  <Trigger
    :popupAlign="{ points: ['tl'] }"
    :action="['click']"
    :builtinPlacements="{
      left: {
        points: ['tl']
      }
    }"
    popupPlacement="right"
    alignPoint
  >
    <template v-slot:popup>
      <div class="point-popup">POPUP</div>
    </template>
    <div
      class="point-region"
      :style="{ width: '100px', height: '100px', background: '#ddd' }"
    />
  </Trigger>
</template>

<script>
import Trigger from '../src';

export default {
  components: { Trigger }
};
</script>
