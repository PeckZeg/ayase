<template>
  <div :style="{ margin: '10px 20px' }">
    <strong>Actions: </strong>
    <LabelItem v-bind="hoverProps" title="Hover">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="focusProps" title="Focus">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="clickProps" title="Click">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="contextMenuProps" title="ContextMenu">
      <input type="checkbox" />
    </LabelItem>

    <hr />

    <LabelItem v-bind="stretchProps" title="Stretch">
      <select>
        <option value="">--NONE--</option>
        <option value="width">width</option>
        <option value="minWidth">minWidth</option>
        <option value="height">height</option>
        <option value="minHeight">minHeight</option>
      </select>
    </LabelItem>

    <LabelItem v-bind="placementProps" title="Placement">
      <select>
        <option>right</option>
        <option>left</option>
        <option>top</option>
        <option>bottom</option>
        <option>topLeft</option>
        <option>topRight</option>
        <option>bottomRight</option>
        <option>bottomLeft</option>
      </select>
    </LabelItem>

    <LabelItem v-bind="motionProps" title="Motion">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="destroyPopupOnHideProps" title="Destroy Popup On Hide">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="maskProps" title="Mask">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="maskClosableProps" title="Mask Closable">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="forceRenderProps" title="Force Render">
      <input type="checkbox" />
    </LabelItem>

    <LabelItem v-bind="offsetXProps" title="OffsetX">
      <input />
    </LabelItem>

    <LabelItem v-bind="offsetYProps" title="OffsetY">
      <input />
    </LabelItem>
  </div>

  <div :style="{ margin: '120px', position: 'relative' }">
    <Trigger
      :popup-align="{
        offset: [offsetX, offsetY],
        overflow: {
          adjustX: 1,
          adjustY: 1
        }
      }"
      :popup-placement="placement"
      :destroyPopupOnHide="destroyPopupOnHide"
      :mask="mask"
      :mask-motion="motion ? MaskMotion : null"
      :mask-closable="maskClosable"
      :stretch="stretch"
      :action="Object.keys(actions).filter((action) => actions[action])"
      :builtin-placements="builtinPlacements"
      :force-render="forceRender"
      :popup-style="{
        border: '1px solid red',
        padding: '10px',
        background: 'white',
        boxSizing: 'border-box'
      }"
      :popup-motion="motion ? Motion : null"
      @popup-align="onPopupAlign"
    >
      <template v-slot:popup>
        <div>i am a popup</div>
      </template>

      <div
        :style="{
          margin: '20px',
          display: 'inline-block',
          background: 'rgba(255, 0, 0, 0.05)'
        }"
        :tabindex="0"
        role="button"
      >
        <p>This is a example of trigger usage.</p>
        <p>You can adjust the value above</p>
        <p>which will also change the behaviour of popup.</p>
      </div>
    </Trigger>
  </div>
</template>

<script lang="tsx">
import Trigger, { BuildInPlacements } from '../src';
import LabelItem from './LabelItem';

import { VNode, reactive, defineComponent, computed, ref } from 'vue';

interface MotionType {
  motionName: string;
}

const builtinPlacements: BuildInPlacements = {
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

const Motion: MotionType = {
  motionName: 'case-motion'
};

const MaskMotion: MotionType = {
  motionName: 'mask-motion'
};

function useControl<T>(
  valuePropName: string,
  defaultValue: T,
  handler: 'onChange' | 'onInput' = 'onChange'
) {
  const state = ref<T>(defaultValue);

  return [
    state,
    {
      value: state.value,
      checked: state.value,
      [handler]({ target }) {
        state.value = target[valuePropName];
      }
    } as any
  ] as const;
}

export default {
  components: { LabelItem, Trigger },

  setup() {
    const [hover, hoverProps] = useControl('checked', true);
    const [focus, focusProps] = useControl('checked', false);
    const [click, clickProps] = useControl('checked', false);
    const [contextMenu, contextMenuProps] = useControl('checked', false);

    const [placement, placementProps] = useControl('value', 'right');
    const [stretch, stretchProps] = useControl('value', '');
    const [motion, motionProps] = useControl('checked', true);
    const [destroyPopupOnHide, destroyPopupOnHideProps] = useControl(
      'checked',
      false
    );
    const [mask, maskProps] = useControl('checked', false);
    const [maskClosable, maskClosableProps] = useControl('checked', true);
    const [forceRender, forceRenderProps] = useControl('checked', false);
    const [offsetX, offsetXProps] = useControl<number>('value', 0, 'onInput');
    const [offsetY, offsetYProps] = useControl<number>('value', 0, 'onInput');

    const actions = computed(() => ({
      hover: hover.value,
      focus: focus.value,
      click: click.value,
      contextMenu: contextMenu.value
    }));

    return {
      MaskMotion: computed(() => MaskMotion),
      Motion: computed(() => Motion),
      builtinPlacements: computed(() => builtinPlacements),
      destroyPopupOnHideProps,
      destroyPopupOnHide,
      maskClosableProps,
      forceRenderProps,
      contextMenuProps,
      placementProps,
      maskClosable,
      offsetXProps,
      offsetYProps,
      stretchProps,
      forceRender,
      motionProps,
      hoverProps,
      focusProps,
      clickProps,
      maskProps,
      placement,
      offsetX,
      offsetY,
      actions,
      stretch,
      motion,
      mask
    };
  },

  methods: {
    onPopupAlign() {
      console.warn('Aligned!');
    }
  }
};
</script>

<style lang="less">
.vc-trigger-popup-placement-right {
  border-width: 10px !important;
}

// ======================= Popup =======================
.case-motion {
  transform-origin: 50% 50%;

  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.28);
  animation-fill-mode: both;

  &::after {
    content: 'Animating...';
    position: absolute;
    bottom: -3em;
  }

  &-appear,
  &-enter {
    animation-play-state: paused;

    &-active {
      animation-name: case-zoom-in;
      animation-play-state: running;
    }
  }

  &-leave {
    animation-play-state: paused;

    &-active {
      animation-name: case-zoom-out;
      animation-play-state: running;
    }
  }
}

@keyframes case-zoom-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes case-zoom-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

// ======================= Mask =======================
.mask-motion {
  animation-duration: 0.3s;
  animation-fill-mode: both;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);

  &-appear,
  &-enter {
    animation-play-state: paused;
    opacity: 0;

    &-active {
      animation-name: mask-zoom-in;
      animation-play-state: running;
    }
  }

  &-leave {
    animation-play-state: paused;

    &-active {
      animation-name: mask-zoom-out;
      animation-play-state: running;
    }
  }
}

@keyframes mask-zoom-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes mask-zoom-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
