<template>
  <div :style="{ margin: '200px' }">
    <div>
      <Trigger
        :action="['click']"
        :builtin-placements="builtinPlacements"
        popup-placement="left"
      >
        <template v-slot:popup>
          <div :style="popupBorderStyle">i am a click popup</div>
        </template>

        <span>
          <Trigger
            :action="['hover']"
            :builtin-placements="builtinPlacements"
            popup-placement="bottom"
          >
            <template v-slot:popup>
              <div :style="popupBorderStyle">i am a hover popup</div>
            </template>

            <span href="#" :style="{ margin: '20px' }">
              trigger
            </span>
          </Trigger>
        </span>
      </Trigger>
    </div>

    <div :style="{ margin: '50px' }">
      <Trigger
        popup-placement="right"
        :action="['hover']"
        :builtin-placements="builtinPlacements"
      >
        <template v-slot:popup>
          <div :ref="saveContainerRef" />

          <div :style="popupBorderStyle">
            <Trigger
              :action="['click']"
              :builtin-placements="builtinPlacements"
              :get-popup-container="getPopupContainer"
              popup-placement="bottom"
            >
              <template v-slot:popup>
                <div :style="popupBorderStyle">I am inner Trigger Popup</div>
              </template>

              <span href="#" :style="{ margin: '20px' }">
                clickToShowInnerTrigger
              </span>
            </Trigger>
          </div>
        </template>

        <span href="#" :style="{ margin: '20px' }">
          trigger
        </span>
      </Trigger>
    </div>
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
  padding: '10px'
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
