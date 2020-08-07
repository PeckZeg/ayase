<script>
import { ref, version, h } from 'vue';

export default {
  name: 'Com',

  setup() {
    const count = ref(0);

    console.log(12);
    return {
      onClick() {
        count.value++;
      },

      count
    };
  },

  render(ctx) {
    console.log(ctx);
    return h('div', '哈哈');
  }
};
</script>
