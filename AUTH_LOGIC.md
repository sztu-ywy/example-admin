 <!-- # 🔐 Burn Admin 登录鉴权逻辑文档

本文档详细说明了 Burn Admin 的登录鉴权实现逻辑，参考 Hotel Admin 的完整实现。

## 📋 整体架构

### 1. 核心组件
- **HTTP 拦截器** (`src/lib/http.ts`): 处理 Token 和错误
- **路由守卫** (`src/router/guard.ts`): 验证登录状态和权限
- **权限管理** (`src/store/modules/permissions.ts`): 基于 CASL 的权限控制
- **用户状态** (`src/store/modules/user.ts`): 用户信息和登录状态

### 2. 权限库
使用 `@casl/ability` 和 `@casl/vue` 进行细粒度权限控制。

## 🔄 登录流程

### 1. 用户访问登录页面
```
用户访问 → 路由守卫检查 → 未登录 → 重定向到 /login
```

### 2. 登录验证过程
```typescript
// 标准邮箱登录
auth.login({ email, password })

设置 Token 获取用户信息 设置权限 重定向到目标页面
```

```typescript
// 手机号登录
auth.phoneLogin({ phone, captcha })

设置 Token → 获取用户信息 → 设置权限 → 重定向到目标页面
```

## 🛡️ 路由守卫逻辑

### 执行顺序
1. **检查登录状态**: 通过 `useUserStore().isLogin` 判断
2. **加载用户权限**: 如果已登录但未加载权限，调用 `userApi.current()`
3. **权限验证**: 通过 `usePermissionStore().checkRoutePermission()` 验证
4. **路由决策**: 允许访问或重定向到登录页

### 权限验证规则
```typescript
// 路由权限检查
function checkRoutePermission(to: RouteLocationNormalized | RouteRecordRaw) {
  const user = useUserStore()

  // 无需认证的路由 (noAuth: true)
  if (to.meta?.noAuth)
    return true

  // 已登录但路由没有权限要求
  if (user.isLogin && !to.meta?.permissions?.length)
    return true

  // 检查具体权限
  return ability.can('read', Acl.All) || hasPermission('read', to.meta?.permissions)
}
```

## 🔌 HTTP 拦截器

### 请求拦截器
```typescript
setRequestInterceptor((config) => {
  const { token } = useUserStore()
  if (token) {
    config.headers.Token = token // 自动添加 Token
  }
  return config
})
```

### 响应拦截器
```typescript
setResponseInterceptor(
  (response) => {
    // 处理 refresh-token
    if (response.headers['refresh-token']) {
      useUserStore().setToken(response.headers['refresh-token'])
    }
    return Promise.resolve(response.data)
  },
  async (error) => {
    // 处理认证错误
    switch (error.response.status) {
      case 401:
      case 403:
        // 清除用户状态并重定向到登录页
        useUserStore().reset()
        usePermissionStore().reset()
        await router.push('/login')
        break
    }
    return Promise.reject(error.response.data)
  }
)
```

## 🏗️ 权限系统

### 权限定义 (`src/constants/acl.ts`)
```typescript
export enum Acl {
  All = 'all', // 超级管理员权限
  User = 'user', // 用户管理
  UserGroup = 'user_group', // 用户组管理
  EncryptionKey = 'encryption_key', // 密钥管理
  BurnedHistory = 'burned_history', // 烧录历史
  Firmware = 'firmware', // 固件管理
}
```

### 路由权限配置
```typescript
{
  path: '/users',
  name: 'Users',
  component: () => import('~/views/user/index.vue'),
  meta: {
    title: '用户管理',
    permissions: [Acl.User],  // 需要用户管理权限
  }
}
```

### 权限验证机制
- **角色权限**: 用户通过用户组获得权限
- **细粒度控制**: 基于 action (read/write) 和 subject (资源)
- **继承机制**: `Acl.All` 拥有所有权限

## 🔄 状态管理

### 用户状态 (`useUserStore`)
```typescript
interface UserStore {
  token: string // JWT Token
  info: UserInfo // 用户基本信息
  isLogin: boolean // 登录状态
  setToken: (token: string) => any // 设置 Token
  reset: () => any // 清除用户状态
  updateUserInfo: (user) => any // 更新用户信息
}
```

### 权限状态 (`usePermissionStore`)
```typescript
interface PermissionStore {
  rules: Rules // 权限规则
  setRules: (rules: Rules) => any // 设置权限规则
  checkRoutePermission: (route) => any // 检查路由权限
  hasPermission: (action, subjects) => any // 检查具体权限
  reset: () => any // 清除权限状态
}
```

## 📱 登录组件

### 支持的登录方式
1. **邮箱密码登录** (`StandardLogin.vue`)
2. **手机验证码登录** (`PhoneLogin.vue`)

### 错误处理
```typescript
// 标准错误码处理
switch (error.code) {
  case 4031: // 邮箱或密码错误
  case 4291: // 登录失败次数过多
  case 4033: // 用户被封禁
  default: // 服务器错误
}
```

## 🚀 初始化配置

### 应用启动时的权限系统初始化 (`main.ts`)
```typescript
import { createAliasResolver, defineAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'

// 权限别名解析
const resolveAction = createAliasResolver({
  write: ['create', 'update', 'delete', 'read'],
})

createApp(App)
  .use(abilitiesPlugin, defineAbility(() => {}, { resolveAction }), {
    useGlobalProperties: true
  })
  .use(serviceInterceptor) // HTTP 拦截器
  .use(store) // 状态管理
  .use(router) // 路由 (包含路由守卫)
```

## 🔒 安全特性

### 1. Token 管理
- 自动在请求头添加 Token
- 支持 refresh-token 自动刷新
- Token 过期自动清除状态

### 2. 路由保护
- 未登录用户自动重定向到登录页
- 支持 `next` 参数，登录后跳转到原目标页面
- 权限不足时的错误处理

### 3. 状态持久化
- 用户状态和设置自动持久化到 localStorage
- 页面刷新后自动恢复登录状态

### 4. 错误处理
- 统一的错误码处理机制
- 防重复错误提示
- 多语言错误信息支持

## 📋 最佳实践

1. **路由配置**: 为需要权限的路由添加 `permissions` 元数据
2. **组件权限**: 在组件中使用 `usePermissionStore().hasPermission()` 检查权限
3. **错误处理**: 使用统一的错误码和翻译机制
4. **状态管理**: 通过 store 统一管理用户状态和权限
5. **安全考虑**: 敏感操作前再次验证权限

这套登录鉴权系统提供了完整的用户认证、权限控制和安全保护机制，确保应用的安全性和可维护性。 -->
