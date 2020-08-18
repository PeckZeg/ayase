<template>
  <label>
    <input v-model="show" type="checkbox" />
    Show Component
  </label>

  <label>
    <input v-model="hasMotionClassName" type="checkbox" />
    hasMotionClassName
  </label>

  <label>
    <input v-model="removeOnLeave" type="checkbox" />
    removeOnLeave
    {{ removeOnLeave ? '' : ' (use leavedClassName)' }}
  </label>

  <div class="grid">
    <div>
      <h2>With Transition Class</h2>
      <CSSMotion
        :visible="show"
        :motion-name="hasMotionClassName ? 'transition' : null"
        :remove-on-leave="removeOnLeave"
        leaved-class="hidden"
        @appear-start="onCollapse"
        @enter-start="onCollapse"
        @leave-active="onCollapse"
        @enter-end="skipColorTransition"
        @leave-end="skipColorTransition"
      >
        <template v-slot="props">
          <div class="demo-block" v-bind="props" />
        </template>
      </CSSMotion>
    </div>

    <div>
      <h2>With Animation Class</h2>
      <CSSMotion
        :visible="show"
        :motion-name="hasMotionClassName ? 'animation' : null"
        :remove-on-leave="removeOnLeave"
        leaved-class="hidden"
        @leave-active="styleGreen"
      >
        <template v-slot="props">
          <div class="demo-block" v-bind="props" />
        </template>
      </CSSMotion>
    </div>

    <div>
      <button
        type="button"
        @click="motionLeaveImmediately = !motionLeaveImmediately"
      >
        motionLeaveImmediately
      </button>

      <div>
        <CSSMotion
          v-if="motionLeaveImmediately"
          :visible="false"
          :motion-name="hasMotionClassName ? 'transition' : null"
          :remove-on-leave="removeOnLeave"
          leaved-class="hidden"
          motion-leave-immediately
          @leave-active="onCollapse"
          @leave-end="skipColorTransition"
        >
          <template v-slot="props">
            <div class="demo-block" v-bind="props" />
          </template>
        </CSSMotion>
      </div>
    </div>
  </div>
</template>

<script>
import CSSMotion from '../src';
export default {
  components: { CSSMotion },

  data() {
    return {
      show: true,
      motionLeaveImmediately: false,
      removeOnLeave: true,
      hasMotionClassName: true
    };
  },

  methods: {
    onCollapse() {
      return { height: '0px' };
    },

    skipColorTransition(_, event) {
      // CSSMotion support multiple transition.
      // You can return false to prevent motion end when fast transition finished.
      if (event.propertyName === 'background-color') {
        return false;
      }
      return true;
    },

    styleGreen() {
      return { background: 'green' };
    }
  }
};
</script>

<style lang="less">
.grid {
  display: table;

  > div {
    display: table-cell;
    min-width: 350px;
  }
}

.demo-block {
  display: block;
  height: 300px;
  width: 300px;
  background: red;
  overflow: hidden;
}

.transition {
  transition: background 0.3s, height 1.3s, opacity 1.3s;

  &.transition-appear,
  &.transition-enter {
    opacity: 0;
  }

  &.transition-appear.transition-appear-active,
  &.transition-enter.transition-enter-active {
    opacity: 1;
  }

  &.transition-leave-active {
    opacity: 0;
    background: green;
  }
}

.animation {
  animation-duration: 1.3s;
  animation-fill-mode: both;

  &.animation-appear,
  &.animation-enter {
    animation-name: enter;
    animation-fill-mode: both;
    animation-play-state: paused;
  }

  &.animation-appear.animation-appear-active,
  &.animation-enter.animation-enter-active {
    animation-name: enter;
    animation-play-state: running;
  }

  &.animation-leave {
    animation-name: leave;
    animation-fill-mode: both;
    animation-play-state: paused;

    &.animation-leave-active {
      animation-name: leave;
      animation-play-state: running;
    }
  }
}

.hidden {
  display: none;
}

@keyframes enter {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes leave {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
}
</style>
