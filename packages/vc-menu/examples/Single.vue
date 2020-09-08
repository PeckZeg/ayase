<template>
  <h2>single selectable menu</h2>

  <p>
    <button type="button" @click="setDestroy(true)">destroy</button>
    &nbsp;
    <a href="#">archor</a>
  </p>

  <div v-if="!destroy" :style="{ width: '400px' }">
    <Menu default-active-first @select="handleSelect" @click="handleClick">
      <SubMenu key="1">
        <template v-slot:title>
          <span>sub menu</span>
        </template>

        <MenuItem key="1-1">0-1</MenuItem>
        <MenuItem key="1-2">0-2</MenuItem>
      </SubMenu>

      <MenuItem>
        <a href="http://taobao.com" target="_blank" rel="noopener noreferrer">
          i do not need key
        </a>
      </MenuItem>

      <MenuItem key="3">outer</MenuItem>

      <SubMenu key="4">
        <template v-slot:title>
          <span>sub menu 1</span>
        </template>

        <MenuItem key="4-1">inner inner</MenuItem>
        <Divider />

        <SubMenu key="4-2-2">
          <template v-slot:title>
            <span>sub menu 3</span>
          </template>

          <MenuItem key="4-2-2-1">inner inner</MenuItem>
          <MenuItem key="4-2-2-2">inner inner2</MenuItem>
        </SubMenu>
      </SubMenu>

      <MenuItem disabled>disabled</MenuItem>
      <MenuItem key="4-3">outer3</MenuItem>
    </Menu>
  </div>
</template>

<script lang="ts">
import Menu, { SubMenu, Item as MenuItem, Divider } from '../src';
import { ref } from 'vue';

export default {
  components: {
    Menu,
    SubMenu,
    MenuItem,
    Divider
  },

  setup() {
    const destroy = ref(false);
    const setDestroy = (value: boolean) => (destroy.value = value);

    return {
      destroy,
      setDestroy
    };
  },

  methods: {
    handleSelect(info) {
      console.log('selected ', info);
    },

    handleClick(info) {
      console.log('click ', info);
    }
  }
};
</script>

<style lang="less" src="../assets/index.less"></style>
