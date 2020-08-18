<template>
  <label>
    <input v-model="show" type="checkbox" />
    Show Component
  </label>

  <div class="grid">
    <div>
      <h2>With Transition Class</h2>
      <CSSMotion
        :visible="show"
        :motion-deadline="1000"
        motion-name="no-trigger"
        remove-on-leave
        @appear-start="onStart"
        @enter-start="onStart"
        @leave-start="onStart"
        @appear-end="onEnd"
        @enter-end="onEnd"
        @leave-end="onEnd"
      >
        <template v-slot="props">
          <div class="demo-block" v-bind="props" />
        </template>
      </CSSMotion>
    </div>
  </div>
</template>

<script lang="ts">
import CSSMotion from '../src';

export default {
  components: { CSSMotion },

  data() {
    return {
      show: true
    };
  },

  methods: {
    onStart(ele, event) {
      console.log('start!', ele, event);
    },

    onEnd(ele, event) {
      console.log('end!', ele, event);
    }
  }
};
</script>
