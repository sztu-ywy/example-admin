import type { RouteRecordRaw } from 'vue-router'

import { HistoryOutlined, HomeOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons-vue'
import { createRouter, createWebHistory } from 'vue-router'
import { Acl } from '~/constants/acl'
import { setupRouterGuard } from './guard'
import { constantRoutes, PATH_DASHBOARD } from './modules/constantRoutes'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('~/layouts/BaseLayout.vue'),
    redirect: PATH_DASHBOARD,
    meta: {
      title: () => $gettext('Home'),
    },
    children: [
      {
        path: PATH_DASHBOARD,
        name: 'dashboard',
        component: () => import('~/pages/dashboard/index.vue'),
        meta: {
          title: () => $gettext('Dashboard'),
          icon: HomeOutlined,
        },
      },
      // 用户管理
      {
        path: '/users',
        name: 'Users',
        component: () => import('~/views/user/index.vue'),
        meta: {
          title: '用户管理',
          permissions: [Acl.User],
          icon: UserOutlined,
        },
      },
    ],
  },
  ...constantRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    else {
      return {
        top: 0,
        left: 0,
      }
    }
  },
})

setupRouterGuard(router)

export default router
