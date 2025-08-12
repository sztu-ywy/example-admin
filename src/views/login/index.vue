<script setup lang="ts">
import { getAppConfig, LanguageSelect, ThemeSwitch } from '@uozi-admin/layout-antdv'
import { useRouter } from 'vue-router'
import gettext from '~/language/gettext'
import { useSettingsStore, useUserStore } from '~/store'
import PhoneLogin from './components/PhoneLogin.vue'
import StandardLogin from './components/StandardLogin.vue'

const router = useRouter()

const appConfig = getAppConfig()

const settings = useSettingsStore()

const user = useUserStore()

if (user.isLogin) {
  router.push('/')
}
</script>

<template>
  <ALayout>
    <ALayoutContent>
      <div class="login-container">
        <div class="login-form">
          <div class="project-title">
            <h1>{{ appConfig.siteTitle }}</h1>
          </div>
          <ATabs>
            <ATabPane
              key="phone"
              :tab="$gettext('Phone Login')"
            >
              <PhoneLogin />
            </ATabPane>
            <ATabPane
              key="standard"
              :tab="$gettext('Email Login')"
            >
              <StandardLogin />
            </ATabPane>
          </ATabs>
          <div class="footer">
            <p>{{ appConfig.copyright }}</p>
            <AFlex
              justify="center"
              align="center"
              gap="8"
            >
              <LanguageSelect
                class="inline"
                :current-language="settings.language"
                :languages="gettext.available"
                @change-language="(l) => settings.setLanguage(l)"
              />
            </AFlex>
            <div class="flex justify-center mt-4">
              <ThemeSwitch
                :current-theme="settings.theme"
                @toggle-theme="t => settings.setTheme(t)"
              />
            </div>
          </div>
        </div>
      </div>
    </ALayoutContent>
  </ALayout>
</template>

<style lang="less" scoped>
.ant-layout-content {
  background: #fff;
}

.dark .ant-layout-content {
  background: transparent;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;

  .login-form {
    max-width: 400px;
    width: 80%;

    .project-title {
      margin: 50px;

      h1 {
        font-size: 50px;
        font-weight: 100;
        text-align: center;
      }
    }

    .anticon {
      color: #a8a5a5 !important;
    }

    .footer {
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
  }
}
</style>
