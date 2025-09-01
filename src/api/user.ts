import type { UserGroup } from './userGroup'
import type { ModelBase } from '~/api/types'
import { extendCurdApi, http, useCurdApi } from '@uozi-admin/request'
import { useUserStore } from '~/store'

// export const userApi = useCurdApi<User>('/users')

// const current = () => http.get<User>('/user')

// const updateSelf = (data: Partial<User>) => http.post<User>('/user', data)

// // export {
// //   type User,
// // }

// export const userApi = {
//   current,
//   updateSelf,

// }

export interface User extends ModelBase {
  username: string
  name: string
  email: string
  phone: string
  gender: string
  student_no: string
  role: string
  avatar_id: string
  last_active: string
  user_group: UserGroup
  user_group_id: number
  status: number
  // avatar?: Upload
}

export const userApi = extendCurdApi(useCurdApi<User>('/admin/users'), {
  async current() {
    return http.get<User>('/admin/user').then((r) => {
      useUserStore().updateUserInfo(r)
      return r
    })
  },

  // update current user
  async updateSelf(data: User) {
    return http.post<User>('/admin/user', data)
  },
})
