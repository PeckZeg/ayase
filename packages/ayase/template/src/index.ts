import App from './App';

import { router } from './router';
import examples from './examples';
import { createApp } from 'vue';

createApp(App).use(router).mount('#app');
