<template>
  <Provider :store="store">
    <div>
      <Buttons />
      <Result />
    </div>
  </Provider>
</template>

<script>
import { Provider, create, connect } from '../src';
import Buttons from './components/Buttons';

import { computed, h } from 'vue';
import Result from './Result';

export default {
  components: { Provider, Buttons: connect()(Buttons), Result },

  setup() {
    return {
      store: computed(() => create({ count: 0 }))
    };
  }
};
</script>
