<template>
  <nav id="nav">
    <ul>
      <li v-for="[name, text] in links" :key="name">
        <router-link :to="{ name }">{{ text }}</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import examples from './examples';
import { computed } from 'vue';
import _ from 'lodash';

export default {
  setup() {
    const links = computed(() =>
      examples.map(([name]) => [_.kebabCase(name), name])
    );

    return {
      links
    };
  }
};
</script>
