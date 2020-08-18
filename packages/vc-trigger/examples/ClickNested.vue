<template>
  <div :style="{ margin: '200px' }">
    <Trigger
      popup-placement="right"
      :action="['click']"
      :builtin-placements="builtinPlacements"
    >
      <template v-slot:popup>
        <!-- Level 2 -->
        <Trigger
          popup-placement="right"
          :action="['click']"
          :builtin-placements="builtinPlacements"
        >
          <template v-slot:popup>
            <div :style="popupBorderStyle">i am a click popup</div>
          </template>

          <div :style="popupBorderStyle">
            i am a click popup
            <button
              type="button"
              @click="
                (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }
              "
            >
              I am preventPop
            </button>
          </div>
        </Trigger>
      </template>

      <span>Click Me</span>
    </Trigger>
  </div>
</template>

<script>
import Trigger from '../src';

import { computed } from 'vue';

const builtinPlacements = {
  left: {
    points: ['cr', 'cl']
  },
  right: {
    points: ['cl', 'cr']
  },
  top: {
    points: ['bc', 'tc']
  },
  bottom: {
    points: ['tc', 'bc']
  },
  topLeft: {
    points: ['bl', 'tl']
  },
  topRight: {
    points: ['br', 'tr']
  },
  bottomRight: {
    points: ['tr', 'br']
  },
  bottomLeft: {
    points: ['tl', 'bl']
  }
};

const popupBorderStyle = {
  border: '1px solid red',
  padding: '10px',
  background: 'rgba(255, 0, 0, 0.1)'
};

export default {
  components: { Trigger },

  setup() {
    return {
      builtinPlacements: computed(() => builtinPlacements),
      popupBorderStyle: computed(() => popupBorderStyle)
    };
  },

  methods: {
    saveContainerRef(component) {
      this.containerInstance = component;
    },

    getPopupContainer() {
      return this.containerInstance;
    }
  }
};
</script>
