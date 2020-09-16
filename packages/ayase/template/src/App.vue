<template>
  <Nav />

  <div id="preview">
    <router-view />
  </div>
</template>

<script type="tsx">
import { RouterLink, RouterView } from 'vue-router';
import Nav from './Nav';

import examples from "./examples";
import { ref } from 'vue';
import _ from 'lodash';

export default {
  components: { RouterLink, RouterView, Nav },

  mounted() {
    const node = <div>123</div>

    console.log(node)
  },

  setup() {
    const links = ref(examples.map(([name]) => [_.kebabCase(name), name]))

    return {
      links
    };
  }
}
</script>
