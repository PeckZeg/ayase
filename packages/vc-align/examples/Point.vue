<template>
  <div :style="{ marginBottom: '170px' }">
    <div
      :style="{
        margin: '20px',
        border: '1px solid red',
        padding: '100px 0',
        textAlign: 'center'
      }"
      @click="onClick"
    >
      Click this region please : )
    </div>

    <vc-align :target="point" :align="{ points: ['cc', 'cc'] }">
      <div
        :style="{
          position: 'absolute',
          width: '100px',
          height: '100px',
          background: 'rgba(0, 255, 0, 0.5)',
          pointerEvents: 'none'
        }"
      >
        Align
      </div>
    </vc-align>
  </div>
</template>

<script lang="ts">
import VcAlign from '../src';

export default {
  components: { VcAlign },

  data() {
    return {
      point: undefined
    };
  },

  methods: {
    onClick({ pageX, pageY }) {
      this.point = { pageX, pageY };
    }
  }
};
</script>
