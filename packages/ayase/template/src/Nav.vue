<template>
  <nav id="nav">
    <h1>
      <code>{{ name }}</code>
      <sup>{{ version }}</sup>
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

<script lang="ts">
import examples from './examples';
import { computed } from 'vue';
import _ from 'lodash';

export default {
  setup() {
    const links = computed(() =>
      examples.map(([name]) => [_.kebabCase(name), name])
    );

    return {
      name: computed(() => document.body.dataset.name.replace(/^@ayase\//, '')),
      version: computed(() => document.body.dataset.version),
      links
    };
  }
};
</script>
