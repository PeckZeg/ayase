<template>
  <div>
    <label>
      Trigger type:
      <select :value="state.action" @change="onActionChange">
        <option>click</option>
        <option>hover</option>
        <option>contextMenu</option>
      </select>
    </label>

    <template v-if="action === 'hover'">
      <label>
        Mouse enter delay:
        <input
          type="text"
          :value="state.mouseEnterDelay"
          @input="onDelayChange"
        />
      </label>
    </template>

    <div :style="{ margin: '50px' }">
      <Trigger
        popup-placement="topLeft"
        :action="[state.action]"
        :popup-align="{ overflow: { adjustX: 1, adjustY: 1 } }"
        :mouse-enter-delay="state.mouseEnterDelay"
        :builtin-placements="builtinPlacements"
        popup-class="point-popup"
        align-point
      >
        <template v-slot:popup>
          <div
            :style="{
              padding: '20px',
              background: 'rgba(0, 255, 0, 0.3)'
            }"
          >
            This is popup
          </div>
        </template>

        <div
          :style="{
            border: '1px solid red',
            padding: '100px 0',
            textAlign: 'center'
          }"
        >
          Interactive region
        </div>
      </Trigger>
    </div>
  </div>
</template>

<script>
import Trigger from '../src';

import { computed } from 'vue';

const builtinPlacements = {
  topLeft: {
    points: ['tl', 'tl']
  }
};

export default {
  components: { Trigger },

  data() {
    return {
      state: {
        action: 'click',
        mouseEnterDelay: 0
      }
    };
  },

  methods: {
    onActionChange({ target: { value } }) {
      this.state.action = value;
    },

    onDelayChange({ target: { value } }) {
      this.state.mouseEnterDelay = Number(value) || 0;
    }
  },

  setup() {
    return {
      builtinPlacements: computed(() => builtinPlacements)
    };
  }
};
</script>

<style lang="less">
.point-popup {
  pointer-events: none;
}
</style>
