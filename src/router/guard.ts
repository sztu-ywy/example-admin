import type { Router } from 'vue-router'

import { getAppConfig } from '@uozi-admin/layout-antdv'
import NProgress from 'nprogress'
import { userApi } from '~/api/user'
import { usePermissionStore, useUserStore } from '~/store'
import 'nprogress/nprogress.css'
// 路由守卫 验证登录状态和权限
const appSettings = getAppConfig()
// - **路由守卫** (`src/router/guard.ts`): 验证登录状态和权限

export function setupRouterGuard(router: Router) {
  NProgress.configure({ showSpinner: false })

  router.beforeEach(async (to, _, next) => {
    NProgress.start()

    // 设置页面标题
    const title = typeof to.meta?.title === 'function' ? to.meta.title() : to.meta?.title
    document.title = `${title || ''} | ${appSettings.siteTitle}`

    const { updateUserInfo, isLogin } = useUserStore()
    const { rules, setRules, checkRoutePermission } = usePermissionStore()

    // 如果用户已登录但没有加载权限，则加载用户信息和权限
    if (!rules?.length && isLogin) {
      try {
        const userStore = useUserStore()

        // 只有在用户信息不完整时才调用 API
        // 这样可以避免在刚登录时的重复调用
        if (!userStore.info.id || !userStore.info.user_group_name) {
          const res = await userApi.current()
          updateUserInfo(res)
          setRules(res.user_group?.permissions || [])
        }
        else {
          // 如果用户信息已存在但权限为空，说明是页面刷新或权限失效
          // 只在这种情况下重新获取权限信息
          const res = await userApi.current()
          setRules(res.user_group?.permissions || [])
        }
      }
      catch {
        // 如果获取用户信息失败，清除登录状态
        const userStore = useUserStore()
        const permissionStore = usePermissionStore()
        userStore.reset()
        permissionStore.reset()
        next({ path: '/login', query: { next: to.fullPath } })
        return
      }
    }

    // 检查路由权限
    if (checkRoutePermission(to)) {
      next()
    }
    else {
      next({ path: '/login', query: { next: to.fullPath } })
    }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
