<template>
  <Nav />
  <div id="preview">
    <RouterView />
  </div>
</template>

<script type="tsx">
import { RouterView } from 'vue-router';
import Nav from './Nav';

export default {
  components: { RouterView, Nav },
}
</script>
