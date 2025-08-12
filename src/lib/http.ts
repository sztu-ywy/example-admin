import { useAxios } from '@uozi-admin/request'
import { message } from 'ant-design-vue'
import router from '~/router'
import { PATH_LOGIN } from '~/router/modules/constantRoutes'
import { useUserStore } from '~/store'
import { usePermissionStore } from '~/store/modules/permissions'

// 处理 Token 和错误
const { setRequestInterceptor, setResponseInterceptor } = useAxios()
// TODO: 拦截器的代码，一定要使用
// server response

// server response
export interface CosyError {
  scope?: string
  code: string
  message: string
  params?: string[]
}

// code, message translation
// 404: () => 'Resource not found',
// 500: () => 'Internal server error',
// 403: () => 'Access forbidden'
export type CosyErrorRecord = Record<number, () => string>

// 定义与初始化为空值
const errors: Record<string, CosyErrorRecord> = {}

function registerError(scope: string, record: CosyErrorRecord) {
  errors[scope] = record
}

// Add new dedupe utility at the top
interface MessageDedupe {
  error: (content: string, duration?: number) => void
}
// 错误消息去重的作用
function useMessageDedupe(interval = 5000): MessageDedupe {
  const lastMessages = new Map<string, number>()

  return {
    async error(content, duration = 5) {
      const now = Date.now()
      if (!lastMessages.has(content) || (now - (lastMessages.get(content) || 0)) > interval) {
        lastMessages.set(content, now)
        message.error(content, duration)
      }
    },
  }
}

const dedupe = useMessageDedupe()

// 用于请求发送前和响应接收后执行操作的函数
export function serviceInterceptor() {
  // 请求发送前拦截器
  setRequestInterceptor((config) => {
    // 获取当前的用户信息
    const user = useUserStore()

    const { token } = storeToRefs(user)
    if (token)
      config.headers.Token = token.value

    return config
  })
  // 响应接收后拦截器
  setResponseInterceptor(
    (response) => {
      // get refresh-token from headers
      response.headers['refresh-token'] && useUserStore().setToken(response.headers['refresh-token'])

      return Promise.resolve(response.data)
    },
    async (error) => {
      const permission = usePermissionStore()
      const user = useUserStore()

      switch (error.response.status) {
        case 401:
        case 403:
          // 如果是 401 或 403，则重置用户状态和权限并跳转到登录页面
          user.reset()
          permission.reset()
          await router.push(PATH_LOGIN)
          break
      }
      // 告诉编译器将 error.response.data 转换为 CosyError 类型
      const err = error.response.data as CosyError
      if (err?.scope) {
        // check if already register，验证签名已经注册过  errors[scope] = record
        if (!errors[err.scope]) {
          try {
            const error = await import(/* @vite-ignore */`@/constants/errors/${err.scope}.ts`)

            registerError(err.scope, error.default)
          }
          catch {
          /* empty */
          }
        }
        // const errors = {
        //   'user': {
        //     404: () => 'User not found',
        //     500: () => 'Internal server error while fetching user'
        //   }
        // };
        // msg = Internal server error while fetching user
        const msg = errors?.[err.scope]?.[Number(err.code)]
        if (msg) {
        // if err has params
          if (err?.params && err.params.length > 0) {
            let res = msg()

            err.params.forEach((param, index) => {
              res = res.replace(`{${index}}`, param)
            })

            dedupe.error(res)
          }
          else {
            dedupe.error(msg())
          }
        }
        else {
          dedupe.error($gettext(err?.message ?? 'Server error'))
        }
      }
      else {
        dedupe.error($gettext(err?.message ?? 'Server error'))
      }

      return Promise.reject(error.response.data)
    },
  )
}
