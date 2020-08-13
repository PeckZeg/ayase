<template>
  <div :style="{ paddingTop: '100px' }">
    <div
      :ref="targetRef"
      :style="{ display: 'inline-block', width: '50px', height: '50px' }"
    >
      target
    </div>

    <vc-align
      v-bind="$props"
      :target="getTarget"
      :align="{ points: ['bc', 'tc'] }"
      @align="onAlign"
    >
      <div
        id="ele_src"
        :style="{ position: 'absolute', width: '50px', height: '80px' }"
      >
        source
      </div>
    </vc-align>
  </div>
</template>

<script lang="ts">
import VcAlign from '../src';
import { defineComponent } from 'vue';

interface IElementTestProps {
  monitorWindowResize?: boolean;
  disabled?: boolean;
}

export default defineComponent<IElementTestProps>({
  name: 'ElementTest',
  components: { VcAlign },

  props: {
    monitorWindowResize: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  } as undefined,

  emits: ['align'],

  methods: {
    getTarget() {
      return this.$target;
    },

    targetRef(ele) {
      this.$target = ele;
    },

    onAlign(...args) {
      this.$emit('align', ...args);
    }
  }
});
</script>
