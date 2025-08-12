import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import type { Action, AppAbility, Rules } from '~/api/userGroup'
import { useAbility } from '@casl/vue'
import { keys } from 'lodash-es'

import { defineStore } from 'pinia'
import { Acl } from '~/constants/acl'
import { store, useUserStore } from '~/store'
//  基于 CASL 的权限控制
export const usePermissionStore = defineStore('permission', () => {
  const ability = useAbility<AppAbility>()

  const rules = ref<Rules>([])

  ability.update(rules.value)

  const reset = () => {
    rules.value = []
    ability.update([])
  }

  const setRules = (r: Rules) => {
    rules.value = r
    ability.update(r)
  }

  const hasPermission = (action: Action, subjects?: string[]): boolean => {
    if (!subjects)
      return false

    return subjects.some((s: string) => ability.can(action, s) || ability.can(action, Acl.All))
  }

  const checkRoutePermission = (to: RouteLocationNormalized | RouteRecordRaw) => {
    const user = useUserStore()
    // 路由无需认证 或者 已登录但没有设置权限，直接通过
    if (to.meta?.noAuth || (user.isLogin && !to.meta?.permissions?.length))
      return true

    return ability.can('read', Acl.All) || hasPermission('read', to.meta?.permissions)
  }

  const permissionMap: Record<Action, boolean> = reactive({
    read: true,
    write: true,
  })

  const getActionMap = () => {
    permissionMap.read = true
    permissionMap.write = true

    const route = useRoute()

    const { permissions } = route?.meta ?? {}

    const actions = keys(permissionMap) as Action[]

    actions.forEach((action: Action) => {
      permissionMap[action] = hasPermission(action, permissions)
    })

    return permissionMap
  }

  const setPermissionMap = (action: Action, value: boolean) => {
    permissionMap[action] = value
  }

  return {
    rules,
    setRules,
    checkRoutePermission,
    hasPermission,
    reset,
    getActionMap,
    setPermissionMap,
  }
})

// Use for outside setup
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
