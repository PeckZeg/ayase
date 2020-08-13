<template>
  <div :style="{ margin: '50px' }">
    <p>
      <button type="button" @click="forceAlign">Force align</button>
      &nbsp;
      <button type="button" @click="toggleSourceSize">Resize Source</button>
      &nbsp;
      <label>
        <input type="checkbox" :checked="monitor" @change="toggleMonitor" />
        Monitor window resize
      </label>
      <label>
        <input type="checkbox" :checked="random" @change="toggleRandom" />
        Random Size
      </label>
      <label>
        <input type="checkbox" :checked="disabled" @change="toggleDisabled" />
        Disabled
      </label>
    </p>

    <div
      id="container"
      :ref="containerRef"
      :style="{
        width: '80%',
        height: '500px',
        border: '1px solid red',
        ...(random ? { width: `${randomWidth}%` } : undefined)
      }"
    >
      <vc-align
        :ref="alignRef"
        :target="getTarget"
        :monitor-window-resize="monitor"
        :align="align"
        :disabled="disabled"
        @align="onAlign"
      >
        <div
          :style="{
            position: 'absolute',
            width: `${sourceWidth}px`,
            height: '50px',
            background: 'yellow'
          }"
        >
          <input :style="{ width: '100%' }" value="source" />
        </div>
      </vc-align>
    </div>
  </div>
</template>

<script lang="ts">
import VcAlign from '../src';

export default {
  components: {
    VcAlign
  },

  data() {
    return {
      monitor: true,
      random: false,
      disabled: false,
      randomWidth: 100,
      align: {
        points: ['cc', 'cc']
      },
      sourceWidth: 50
    };
  },

  mounted() {
    this.id = setInterval(() => {
      if (this.random) {
        this.randomWidth = 60 + 40 * Math.random();
      }
    }, 1000);
  },

  beforeUnmount() {
    clearInterval(this.id);
  },

  methods: {
    getTarget() {
      if (!this.$container) {
        // parent ref not attached
        this.$container = document.getElementById('container');
      }

      return this.$container;
    },

    containerRef(ele) {
      this.$container = ele;
    },

    alignRef(node) {
      this.$align = node;
    },

    toggleMonitor() {
      this.monitor = !this.monitor;
    },

    toggleRandom() {
      this.random = !this.random;
    },

    toggleDisabled() {
      this.disabled = !this.disabled;
    },

    forceAlign() {
      this.$align.forceAlign();
    },

    toggleSourceSize() {
      this.sourceWidth = this.sourceWidth + 10;
    },

    onAlign(...args) {
      console.log('onAlign', ...args);
    }
  }
};
</script>
