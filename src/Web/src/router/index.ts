import { createRouter, createWebHistory } from 'vue-router'
import { WorkspacePage } from '@workspace'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'editor',
      component: WorkspacePage,
    },
  ],
})

export default router
