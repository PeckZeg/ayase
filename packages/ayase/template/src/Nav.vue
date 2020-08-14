<template>
  <nav id="nav">
    <h1>
      <code>{{ title }}</code>
    </h1>

    <ul>
      <li v-for="[name, text] in links" :key="name">
        <router-link :to="{ name }">
          <code>{{ text }}</code>
        </router-link>
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

    const title = computed(() =>
      (process.env.AYASE_TITLE || '').replace(/^@ayase\//, '')
    );

    return {
      title,
      links
    };
  }
};
</script>
