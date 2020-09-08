<template>
  <div v-if="!state.destroyed">
    <h2>multiple selectable menu</h2>

    <p>
      selectedKeys: &nbsp;&nbsp;&nbsp;
      <label v-for="k in ['1-1', '1-2', '2-1', '2-2', '3']" :key="k">
        {{ k }}
        <input
          :key="k"
          :value="k"
          :checked="state.selectedKeys.indexOf(k) !== -1"
          type="checkbox"
          @change="onCheck"
        />
      </label>
    </p>

    <p>
      openKeys: &nbsp;&nbsp;&nbsp;
      <label v-for="k in ['1', '2']" :key="k">
        {{ k }}
        <input
          :value="k"
          :checked="state.openKeys.indexOf(k) !== -1"
          type="checkbox"
          @change="onOpenCheck"
        />
      </label>
    </p>

    <div :style="{ width: '400px' }">
      <Menu
        :open-keys="state.openKeys"
        :selected-keys="state.selectedKeys"
        multiple
        @select="onSelect"
        @deselect="onDeselect"
        @open-change="onOpenChange"
      >
        <SubMenu key="1" title="submenu1">
          <MenuItem key="1-1">item1-1</MenuItem>
          <MenuItem key="1-2">item1-2</MenuItem>
        </SubMenu>

        <SubMenu key="2" title="submenu2">
          <MenuItem key="2-1">item2-1</MenuItem>
          <MenuItem key="2-2">item2-2</MenuItem>
        </SubMenu>

        <MenuItem key="3">item3</MenuItem>
      </Menu>
    </div>
  </div>
</template>

<script>
import Menu, { SubMenu, Item as MenuItem } from '../src';

export default {
  components: { Menu, MenuItem, SubMenu },

  data() {
    return {
      state: {
        destroyed: false,
        selectedKeys: [],
        openKeys: []
      }
    };
  },

  methods: {
    onSelect(info) {
      console.log('selected ', info);
      this.state.selectedKeys = info.selectedKeys;
    },

    onDeselect(info) {
      console.log('deselect ', info);
    },

    onOpenChange(openKeys) {
      console.log('onOpenChange ', openKeys);
      this.state.openKeys = openKeys;
    },

    onCheck(e) {
      const { value } = e.target;

      if (e.target.checked) {
        this.state.selectedKeys = this.state.selectedKeys.concat(value);
      } else {
        const newSelectedKeys = this.state.selectedKeys.concat();
        const index = newSelectedKeys.indexOf(value);

        if (index !== -1) {
          newSelectedKeys.splice(index, 1);
        }

        this.state.selectedKeys = newSelectedKeys;
      }
    },

    onOpenCheck(e) {
      const { value } = e.target;
      if (e.target.checked) {
        this.state.openKeys = this.state.openKeys.concat(value);
      } else {
        const newOpenKeys = this.state.openKeys.concat();
        const index = newOpenKeys.indexOf(value);

        if (index !== -1) {
          newOpenKeys.splice(index, 1);
        }

        this.state.openKeys = newOpenKeys;
      }
    },

    destroy() {
      this.state.destroyed = true;
    }
  }
};
</script>

<style lang="less" src="../assets/index.less"></style>
