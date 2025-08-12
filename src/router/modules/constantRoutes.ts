import type { RouteRecordRaw } from 'vue-router'

export const PATH_LOGIN = '/login'
export const PATH_DASHBOARD = '/dashboard'
export const PATH_ERROR = '/error'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: PATH_LOGIN,
    name: 'login',
    component: () => import('~/views/login/index.vue'),
    meta: {
      title: () => $gettext('Login'),
      noAuth: true,
    },
  },
  {
    path: `${PATH_ERROR}/:code`,
    name: 'error',
    component: () => import('~/pages/error/index.vue'),
    meta: {
      title: () => $gettext('Error'),
      noAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/error/404',
    meta: {
      title: () => $gettext('Not Found'),
      noAuth: true,
    },
  },
]
