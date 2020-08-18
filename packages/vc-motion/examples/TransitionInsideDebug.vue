<template>
  <button type="button" @click="visible = true">
    visible = true
  </button>

  <button type="button" @click="visible = false">
    visible = false
  </button>

  <CSSMotion
    :visible="visible"
    motion-name="debug-transition"
    @enter-start="() => ({ maxHeight: 0 })"
    @enter-active="() => ({ maxHeight: '200px' })"
    @leave-start="() => ({ maxHeight: '200px' })"
    @leave-active="() => ({ maxHeight: 0 })"
  >
    <template v-slot="props">
      <div
        :style="{ width: '200px', height: '200px', background: 'green' }"
        v-bind="props"
      >
        <div class="inner-block">Hover when closing</div>
      </div>
    </template>
  </CSSMotion>
</template>

<script lang="ts">
import CSSMotion from '../src';

export default {
  components: { CSSMotion },

  data() {
    return {
      visible: true
    };
  }
};
</script>

<style>
.debug-transition.debug-transition-leave {
  transition: max-height 1s linear;
}

.debug-transition.debug-transition-enter {
  transition: max-height 1s linear;
}

.inner-block {
  position: relative;
  left: 50px;
  top: 50px;
  width: 100px;
  height: 100px;
  transition: background-color 1s linear;
  background-color: yellowgreen;
}

.inner-block:hover {
  background-color: blueviolet;
}
</style>
