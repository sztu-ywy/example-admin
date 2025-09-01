import type { RouteRecordRaw } from 'vue-router'

import {
  HistoryOutlined,
  HomeOutlined,
  SafetyOutlined,
  UserOutlined,
  BankOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ToolOutlined,
  ContactsOutlined
} from '@ant-design/icons-vue'
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
      // 楼栋管理
      {
        path: '/buildings',
        name: 'Buildings',
        component: () => import('~/views/dormitory/BuildingView.vue'),
        meta: {
          title: '楼栋管理',
          permissions: [Acl.Building],
          icon: BankOutlined,
        },
      },
      // 房间管理
      {
        path: '/rooms',
        name: 'Rooms',
        component: () => import('~/views/dormitory/RoomView.vue'),
        meta: {
          title: '房间管理',
          permissions: [Acl.Room],
          icon: AppstoreOutlined,
        },
      },
      // 学生住宿
      {
        path: '/students',
        name: 'Students',
        component: () => import('~/views/dormitory/StudentView.vue'),
        meta: {
          title: '学生住宿',
          permissions: [Acl.Student],
          icon: TeamOutlined,
        },
      },
      // 维修工单
      {
        path: '/repairs',
        name: 'Repairs',
        component: () => import('~/views/dormitory/RepairView.vue'),
        meta: {
          title: '维修工单',
          permissions: [Acl.Repair],
          icon: ToolOutlined,
        },
      },
      // 访客管理
      {
        path: '/visits',
        name: 'Visits',
        component: () => import('~/views/dormitory/VisitView.vue'),
        meta: {
          title: '访客管理',
          permissions: [Acl.Visit],
          icon: ContactsOutlined,
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
