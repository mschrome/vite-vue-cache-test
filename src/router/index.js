import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'
import Test from '../views/Test.vue'
import TenantProfile from '../views/TenantProfile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/test', name: 'Test', component: Test },
    { path: '/tenant', name: 'TenantProfile', component: TenantProfile },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router


