import type { User } from './user'
import { http } from '@uozi-admin/request'
import { useUserStore } from '~/store'
import { usePermissionStore } from '~/store/modules/permissions'

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface LoginReq {
  email: string
  password: string
}

const auth = {
  async login(data: LoginReq) {
    const user = useUserStore()
    const permissionStore = usePermissionStore()

    return http
      .post<AuthResponse>('/admin/login', data)
      .then((r) => {
        user.setToken(r.token)
        user.updateUserInfo(r.user)
        // 如果登录接口返回了权限信息，也设置权限
        if (r.user.user_group?.permissions) {
          permissionStore.setRules(r.user.user_group.permissions)
        }
        return r
      })
  },
  async validPhone(data: { area_code: number, phone: string }) {
    return http.post('admin/valid_phone', data)
  },
  async phoneLogin(data: { area_code: number, phone: string, captcha: string }) {
    const user = useUserStore()
    const permissionStore = usePermissionStore()

    return http.post('admin/phone_login', data).then((r) => {
      user.setToken(r.token)
      user.updateUserInfo(r.user)
      // 如果登录接口返回了权限信息，也设置权限
      if (r.user.user_group?.permissions) {
        permissionStore.setRules(r.user.user_group.permissions)
      }
      return r
    })
  },
  async logout() {
    const user = useUserStore()
    const permissionStore = usePermissionStore()

    return http.delete('admin/logout').then(async () => {
      user.reset()
      permissionStore.reset()
    })
  },
}

export default auth
