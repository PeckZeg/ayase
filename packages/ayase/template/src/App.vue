<template>
  <ul>
    <li v-for="[name, text] in links" :key="name">
      <router-link :to="{ name }">{{ text }}</router-link>
    </li>
  </ul>

  <router-view />
</template>

<script type="ts">
import { RouterLink, RouterView } from 'vue-router';
import examples from "./examples";
import { ref } from 'vue';
import _ from 'lodash';

export default {
  components: { RouterLink, RouterView },

  setup() {
    const links = ref(examples.map(([name]) => [_.kebabCase(name), name]))

    return {
      links
    };
  }
}
</script>
