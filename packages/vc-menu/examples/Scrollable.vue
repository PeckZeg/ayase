<template>
  <h2>keyboard scrollable menu</h2>

  <Menu :style="{ width: '200px', height: '200px', overflow: 'auto' }">
    <MenuItem v-for="i in 20" :key="String(i)">
      {{ i }}
    </MenuItem>
  </Menu>
</template>

<script>
import Menu, { Item as MenuItem } from '../src';

export default {
  components: { Menu, MenuItem }
};
</script>

<style lang="less" src="../assets/index.less"></style>
