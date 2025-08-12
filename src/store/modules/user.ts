// import type { User } from '@/api/user'

// export interface UserInfo extends Omit<User, 'user_group'> {
//   user_group_name: string
// }
// 用户信息和登录状态
import type { User } from '~/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const unreadCount = ref(0)
  const info = ref({} as Omit<User, 'user_group'> & { user_group_name: string })

  const isLogin = computed(() => !!token.value)

  function setToken(t: string) {
    token.value = t
  }
  function reset() {
    token.value = ''
    info.value = {} as Omit<User, 'user_group'> & { user_group_name: string }
  }
  function updateUserInfo(data: User) {
    const { user_group, ...rest } = data
    info.value = { user_group_name: user_group?.name, ...rest }
  }

  return {
    token,
    info,
    unreadCount,
    isLogin,
    setToken,
    reset,
    updateUserInfo,
  }
}, {
  persist: true,
})
