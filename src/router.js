import { createRouter, createWebHistory } from 'vue-router';

import MillPage from './components/MillPage.vue';
import HomePage from './components/HomePage.vue';
import { useState } from './state';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  {
    path: '/mill',
    name: 'mill',
    component: MillPage,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(
    (record) => record.meta.requiresAuth
  );
  const state = useState();
  if (requiresAuth && !state.player) {
    next('home');
  } else {
    next();
  }
});

export default router;
