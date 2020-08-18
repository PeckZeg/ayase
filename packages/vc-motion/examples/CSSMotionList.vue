<template>
  key 3 is a different component with others.

  <!-- Input field -->
  <div>
    <label>
      node count
      <input v-model="count" type="number" />
    </label>
    <button type="button" @click="onFlushMotion">
      Flush Motion
    </button>
  </div>

  <!-- Motion State -->
  <div>
    <label v-for="(_, key) in new Array(count).fill(undefined)" :key="key">
      <input
        type="checkbox"
        :checked="checkedMap[key] !== false"
        @change="
          checkedMap = { ...checkedMap, [key]: !(checkedMap[key] !== false) }
        "
      />
      {{ key }}
    </label>
  </div>

  <!-- Motion List -->
  <CSSMotionList
    :keys="keyList"
    motion-name="transition"
    @appear-start="onCollapse"
    @enter-start="onCollapse"
    @leave-active="onCollapse"
  >
    <template v-slot="{ key, background, ...props }">
      <div class="demo-block" :style="{ background }" v-bind="props">
        <span>{{ key }}</span>
      </div>
    </template>
  </CSSMotionList>
</template>

<script>
import { defineComponent } from 'vue';
import { CSSMotionList } from '../src';

export default defineComponent({
  components: { CSSMotionList },

  data() {
    return {
      count: 1,
      checkedMap: {},
      keyList: []
    };
  },

  mounted() {
    this.onFlushMotion();
  },

  methods: {
    onCountChange({ target: { value } }) {
      this.count = Number(value);
    },

    onFlushMotion() {
      const { count, checkedMap } = this;
      let keyList = [];

      for (let i = 0; i < count; i += 1) {
        if (checkedMap[i] !== false) {
          keyList.push(i);
        }
      }

      keyList = keyList.map((key) => {
        if (key === 3) {
          return { key, background: 'orange' };
        }

        return key;
      });

      this.keyList = keyList;
    },

    // Motion
    onCollapse() {
      return { width: 0, margin: '0 -5px 0 0' };
    }
  }
});
</script>

<style lang="less">
.demo-block {
  display: inline-block;
  height: 100px;
  width: 100px;
  border-right: 5px solid #fff;
  position: relative;
  box-sizing: border-box;

  > span {
    color: #fff;
    font-size: 30px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.transition {
  transition: all 0.5s;
}
</style>
