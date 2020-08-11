import App from './App';

import { router } from './router';
import { createApp } from 'vue';
import './style/index.less';

createApp(App).use(router).mount('#app');
