import { createWebHashHistory, createRouter } from 'vue-router';
import examples from './examples';
import _ from 'lodash';

export const routerHistory = createWebHashHistory();

export const router = createRouter({
  history: routerHistory,
  strict: true,
  routes: [
    {
      path: '/',
      redirect: { name: _.kebabCase(examples[0][0]) }
    },
    ...examples.map(([name, component]) => ({
      path: `/${_.kebabCase(name)}`,
      name: _.kebabCase(name),
      component
    }))
  ]
});
