<script setup lang="ts">
import type { SidebarItem, Theme } from '@uozi-admin/layout-antdv'
import type { RouteRecordRaw } from 'vue-router'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { AdminLayout, getAppConfig } from '@uozi-admin/layout-antdv'
import { message } from 'ant-design-vue'
import { computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import auth from '~/api/auth'
import gettext from '~/language/gettext'
import { routes } from '~/router'
import { usePermissionStore, useSettingsStore, useUserStore } from '~/store'

const route = useRoute()
const router = useRouter()

const settings = useSettingsStore()
const userStore = useUserStore()

const languageAvailable = gettext.available

// 添加HTTP请求监控
const requestCount = ref(0)
const maxRequestCount = 1000 // 最大请求数阈值

// 监控请求数量，超过阈值时建议刷新页面
watch(requestCount, (count) => {
  if (count > maxRequestCount) {
    message.warning('请求数量过多，建议刷新页面以释放资源')
  }
})

function toggleTheme(t: Theme) {
  settings.setTheme(t)
}
function changeLanguage(l: string) {
  settings.setLanguage(l)
}

// 登出功能
async function handleLogout() {
  try {
    await auth.logout()
    const permissionStore = usePermissionStore()
    permissionStore.reset()
    message.success('登出成功')
    router.push('/login')
  }
  catch {
    message.error('登出失败，请重试')
  }
}

function getSidebarTree(routes?: RouteRecordRaw[]): SidebarItem[] {
  if (!routes)
    return []

  return routes
    .filter((r) => {
      return !r.meta?.hidden
    })
    .map<SidebarItem>(r => ({
      title: r.meta?.title as any,
      name: r.name as string,
      path: r.path,
      icon: r.meta?.icon,
      children: getSidebarTree(r.children),
    }))
}

const sidebarItems = computed<SidebarItem[]>(() => {
  return getSidebarTree(routes[0].children)
})

const appConfig = getAppConfig()
const settingsStore = useSettingsStore()
</script>

<template>
  <AdminLayout
    :sidebar-items="sidebarItems"
    logo="/logo.svg"
    :current-theme="settingsStore.theme"
    :languages="languageAvailable"
    :current-language="settingsStore.language"
    :page-title="route.meta.title"
    show-footer
    :site-title="appConfig.siteTitle"
    :copyright="appConfig.copyright"
    @toggle-theme="toggleTheme"
    @change-language="changeLanguage"
  >
    <RouterView v-slot="{ Component, route: r }">
      <component
        :is="Component"
        :key="r.path"
      />
    </RouterView>

    <!-- 用户信息区域 - 显示在主题切换按钮右边 -->
    <template #header-extra>
      <div class="user-area">
        <a-dropdown
          v-if="userStore.isLogin"
          placement="bottomRight"
        >
          <div class="user-info">
            <UserOutlined class="user-icon" />
            <span class="username">{{ userStore.info.name || userStore.info.email || '用户' }}</span>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                key="logout"
                @click="handleLogout"
              >
                <LogoutOutlined />
                <span>登出</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </template>
  </AdminLayout>
</template>

<style scoped>
.user-area {
  margin-left: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 32px;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

:global(.dark) .user-info:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.user-icon {
  margin-right: 8px;
  font-size: 16px;
  color: #666;
}

:global(.dark) .user-icon {
  color: #ccc;
}

/* 用户名的高度和宽度 */
.username {
  color: #ccc;
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
}

:global(.dark) .username {
  color: #fff;
}
</style>
