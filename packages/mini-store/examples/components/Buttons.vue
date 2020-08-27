<template>
  <div>
    <button @click="handleClick(1)">+</button>
    <button @click="handleClick(-1)">-</button>
  </div>
</template>

<script>
export default {
  props: ['store'],

  methods: {
    handleClick(step) {
      const { count } = this.store.getState();
      this.store.setState({ count: count + step });
    }
  }
};
</script>
