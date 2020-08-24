<template>
  <template v-if="!state.destroyed">
    <div :style="{ margin: '10px 20px' }">
      <label>
        placement:
        <select :value="state.placement" @change="onPlacementChange">
          <option>right</option>
          <option>left</option>
          <option>top</option>
          <option>bottom</option>
          <option>topLeft</option>
          <option>topRight</option>
          <option>bottomRight</option>
          <option>bottomLeft</option>
        </select>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        Stretch:
        <select :value="state.stretch" @change="onStretch">
          <option value="">--NONE--</option>
          <option value="width">width</option>
          <option value="minWidth">minWidth</option>
          <option value="height">height</option>
          <option value="minHeight">minHeight</option>
        </select>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        <!-- prettier-ignore -->
        <input
            type="checkbox"
            :checked="state.transitionName === 'vc-trigger-popup-zoom'"
            @change="onTransitionChange"
        />
        transitionName
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp; trigger:
      <label>
        <input
          type="checkbox"
          :checked="!!state.trigger.hover"
          @change="onTriggerChange('hover', $event)"
        />
        hover
      </label>
      <label>
        <input
          type="checkbox"
          :checked="!!state.trigger.focus"
          @change="onTriggerChange('focus', $event)"
        />
        focus
      </label>
      <label>
        <input
          type="checkbox"
          :checked="!!state.trigger.click"
          @change="onTriggerChange('click', $event)"
        />
        click
      </label>
      <label>
        <input
          type="checkbox"
          :checked="!!state.trigger.contextMenu"
          @change="onTriggerChange('contextMenu', $event)"
        />
        contextMenu
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        <input
          type="checkbox"
          :checked="state.destroyPopupOnHide"
          @input="destroyPopupOnHide"
        />
        destroyPopupOnHide
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        <input
          type="checkbox"
          :checked="state.autoDestroy"
          @change="autoDestroy"
        />
        autoDestroy
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        <input type="checkbox" :checked="state.mask" @change="onMask" />
        mask
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        <input
          type="checkbox"
          :checked="!!state.maskClosable"
          @change="onMaskClosable"
        />
        maskClosable
      </label>
      <br />
      <label>
        offsetX:
        <input
          type="text"
          :style="{ width: '50px' }"
          :value="state.offsetX"
          @input="onOffsetXChange"
        />
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        offsetY:
        <input
          type="text"
          :style="{ width: '50px' }"
          :value="state.offsetY"
          @input="onOffsetYChange"
        />
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button type="button" @click="destroy">
        destroy
      </button>
    </div>
    <div :style="{ margin: '120px', position: 'relative' }">
      <Trigger
        :get-popup-container="getPopupContainer"
        :popup-align="getPopupAlign()"
        :popup-placement="state.placement"
        :destroy-popup-on-hide="state.destroyPopupOnHide"
        :auto-destroy="state.autoDestroy"
        :mask="state.mask"
        :mask-closable="state.maskClosable"
        :stretch="state.stretch"
        :action="Object.keys(state.trigger)"
        :builtin-placements="builtinPlacements"
        :popup-style="{
          border: '1px solid red',
          padding: '10px',
          background: 'white',
          boxSizing: 'border-box'
        }"
        :popup-transition-name="state.transitionName"
      >
        <template v-slot:popup>
          <div>i am a popup</div>
        </template>

        <div
          :tab-index="0"
          :style="{
            margin: '20px',
            display: 'inline-block',
            background: 'rgba(255, 0, 0, 0.05)'
          }"
          role="button"
        >
          <p>This is a example of trigger usage.</p>
          <p>You can adjust the value above</p>
          <p>which will also change the behaviour of popup.</p>
        </div>
      </Trigger>
    </div>
  </template>
</template>

<script lang="ts">
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

function getPopupContainer(trigger) {
  return trigger.parentNode;
}

export default {
  components: { Trigger },

  data() {
    return {
      state: {
        mask: false,
        maskClosable: false,
        placement: 'right',
        trigger: { hover: 1 },
        offsetX: undefined,
        offsetY: undefined,
        stretch: '',
        transitionName: 'vc-trigger-popup-zoom',
        destroyed: false
      }
    };
  },

  methods: {
    onPlacementChange(e) {
      this.state.placement = e.target.value;
    },

    onStretch(e) {
      this.state.stretch = e.target.value;
    },

    onTransitionChange(e) {
      this.state.transitionName = e.target.checked ? e.target.value : '';
    },

    onTriggerChange(
      value,
      { target: { checked } }: { target: { checked: any } }
    ) {
      const clone = { ...this.state.trigger };

      if (checked) {
        clone[value] = 1;
      } else {
        delete clone[value];
      }

      this.state.trigger = clone;
    },

    onOffsetXChange(e) {
      this.state.offsetX = e.target.value || undefined;
    },

    onOffsetYChange(e) {
      this.state.offsetY = e.target.value || undefined;
    },

    onVisibleChange(visible) {
      console.log('tooltip', visible);
    },

    onMask(e) {
      this.state.mask = e.target.checked;
    },

    onMaskClosable(e) {
      this.state.maskClosable = e.target.checked;
    },

    getPopupAlign() {
      return {
        offset: [this.state.offsetX, this.state.offsetY],
        overflow: {
          adjustX: 1,
          adjustY: 1
        }
      };
    },

    destroy() {
      this.state.destroyed = true;
    },

    destroyPopupOnHide(e) {
      this.state.destroyPopupOnHide = e.target.checked;
    },

    autoDestroy(e) {
      this.state.autoDestroy = e.target.checked;
    }
  },

  setup() {
    return {
      builtinPlacements: computed(() => builtinPlacements),
      getPopupContainer: computed(() => getPopupContainer)
    };
  }
};
</script>

<style lang="less">
@import '../assets/index.less';
</style>
