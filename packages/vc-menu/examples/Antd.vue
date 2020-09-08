<template>
  <div :style="{ margin: '20px' }">
    <h2>antd menu</h2>

    <div>
      <!--      <h3>horizontal</h3>-->
      <!--      <div :style="{ margin: '20px' }">-->
      <!--        <Menu-->
      <!--          :selected-keys="['3']"-->
      <!--          mode="horizontal"-->
      <!--          open-animation="slide-up"-->
      <!--          @click="handleClick"-->
      <!--          @open-change="onOpenChange"-->
      <!--        >-->
      <!--          <SubMenu key="1">-->
      <!--            <template v-slot:title>-->
      <!--              <span class="submenu-title-wrapper">sub menu</span>-->
      <!--            </template>-->

      <!--            <MenuItem key="1-1">0-1</MenuItem>-->
      <!--            <MenuItem key="1-2">0-2</MenuItem>-->
      <!--          </SubMenu>-->

      <!--          <SubMenu key="4" :popup-offset="[10, 15]">-->
      <!--            <template v-slot:title>-->
      <!--              <span class="submenu-title-wrapper">offset sub menu 2</span>-->
      <!--            </template>-->

      <!--            <MenuItem key="4-1">inner inner</MenuItem>-->
      <!--            <Divider />-->

      <!--            <SubMenu key="4-2">-->
      <!--              <template v-slot:title>-->
      <!--                <span class="submenu-title-wrapper">sub menu 1</span>-->
      <!--              </template>-->

      <!--              <SubMenu key="4-2-0">-->
      <!--                <template v-slot:title>-->
      <!--                  <span class="submenu-title-wrapper">sub 4-2-0</span>-->
      <!--                </template>-->

      <!--                <MenuItem key="4-2-0-1">inner inner</MenuItem>-->
      <!--                <MenuItem key="4-2-0-2">inner inner2</MenuItem>-->
      <!--              </SubMenu>-->

      <!--              <MenuItem key="4-2-1">inn</MenuItem>-->

      <!--              <SubMenu key="4-2-2">-->
      <!--                <template v-slot:title>-->
      <!--                  <span class="submenu-title-wrapper">sub menu 4</span>-->
      <!--                </template>-->

      <!--                <MenuItem key="4-2-2-1">inner inner</MenuItem>-->
      <!--                <MenuItem key="4-2-2-2">inner inner2</MenuItem>-->
      <!--              </SubMenu>-->

      <!--              <SubMenu key="4-2-3">-->
      <!--                <template v-slot:title>-->
      <!--                  <span class="submenu-title-wrapper">sub menu 3</span>-->
      <!--                </template>-->

      <!--                <MenuItem key="4-2-3-1">inner inner</MenuItem>-->
      <!--                <MenuItem key="4-2-3-2">inner inner2</MenuItem>-->
      <!--              </SubMenu>-->
      <!--            </SubMenu>-->
      <!--          </SubMenu>-->

      <!--          <MenuItem key="2">1</MenuItem>-->
      <!--          <MenuItem key="3">outer</MenuItem>-->
      <!--          <MenuItem key="5" disabled>disabled</MenuItem>-->
      <!--          <MenuItem key="6">outer3</MenuItem>-->
      <!--        </Menu>-->
      <!--      </div>-->

      <h3>horizontal and click</h3>
      <div :style="{ margin: '20px' }">
        <div>
          <button type="button" @click="toggleChildren">toggle children</button>
          <button type="button" @click="toggleOverflowedIndicator">
            toggle overflowedIndicator
          </button>
        </div>

        <Menu
          :selected-keys="['3']"
          mode="horizontal"
          open-animation="slide-up"
          trigger-sub-menu-action="click"
          @click="handleClick"
          @open-change="onOpenChange"
        >
          <template
            v-if="state.overflowedIndicator === 'customizeIndicator'"
            v-slot:overflowed-indicator
          >
            <span>Add More Items</span>
          </template>

          <template v-if="state.children === 'children1'">
            <SubMenu key="1">
              <template v-slot:title>
                <span class="submenu-title-wrapper">sub menu</span>
              </template>

              <MenuItem key="1-1">0-1</MenuItem>
              <MenuItem key="1-2">0-2</MenuItem>
            </SubMenu>

            <SubMenu key="4" :popup-offset="[10, 15]">
              <template v-slot:title>
                <span class="submenu-title-wrapper">offset sub menu 2</span>
              </template>

              <MenuItem key="4-1">inner inner</MenuItem>
              <Divider />

              <SubMenu key="4-2">
                <template v-slot:title>
                  <span class="submenu-title-wrapper">sub menu 1</span>
                </template>

                <SubMenu key="4-2-0">
                  <template v-slot:title>
                    <span class="submenu-title-wrapper">sub 4-2-0</span>
                  </template>

                  <MenuItem key="4-2-0-1">inner inner</MenuItem>
                  <MenuItem key="4-2-0-2">inner inner2</MenuItem>
                </SubMenu>

                <MenuItem key="4-2-1">inn</MenuItem>

                <SubMenu key="4-2-2">
                  <template v-slot:title>
                    <span class="submenu-title-wrapper">sub menu 4</span>
                  </template>

                  <MenuItem key="4-2-2-1">inner inner</MenuItem>
                  <MenuItem key="4-2-2-2">inner inner2</MenuItem>
                </SubMenu>

                <SubMenu key="4-2-3">
                  <template v-slot:title>
                    <span class="submenu-title-wrapper">sub menu 3</span>
                  </template>

                  <MenuItem key="4-2-3-1">inner inner</MenuItem>
                  <MenuItem key="4-2-3-2">inner inner2</MenuItem>
                </SubMenu>
              </SubMenu>
            </SubMenu>

            <MenuItem key="2">1</MenuItem>
            <MenuItem key="3">outer</MenuItem>
            <MenuItem key="5" disabled>disabled</MenuItem>
            <MenuItem key="6">outer3</MenuItem>
          </template>
          <template v-else-if="state.children === 'children2'">
            <SubMenu key="1">
              <template v-slot:title>
                <span class="submenu-title-wrapper">sub menu</span>
              </template>

              <MenuItem key="1-1">0-1</MenuItem>
              <MenuItem key="1-2">0-2</MenuItem>
            </SubMenu>

            <MenuItem key="2">1</MenuItem>
            <MenuItem key="3">outer</MenuItem>
          </template>
        </Menu>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import Menu, { SubMenu, Item as MenuItem, Divider } from '../src';

export default {
  components: { Menu, SubMenu, MenuItem, Divider },

  data() {
    return {
      state: {
        children: 'children1',
        overflowedIndicator: undefined
      }
    };
  },

  methods: {
    toggleChildren() {
      this.state.children =
        this.state.children === 'children1' ? 'children2' : 'children1';
    },

    toggleOverflowedIndicator() {
      this.state.overflowedIndicator =
        this.state.overflowedIndicator === undefined
          ? 'customizeIndicator'
          : undefined;
    },

    handleClick(info) {
      console.log(`clicked ${info.key}`);
      console.log(info);
    },

    onOpenChange(value) {
      console.log('onOpenChange', value);
    }
  }
};
</script>

<style lang="less" src="../assets/index.less"></style>
