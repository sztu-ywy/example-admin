import type { Theme } from '@uozi-admin/layout-antdv'
import type { Locale } from 'ant-design-vue/es/locale'
import type { ComputedRef, Ref } from 'vue'
import { useColorMode } from '@vueuse/core'
import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import gettext from '~/language/gettext'

// Define the type for the store state
interface SettingsState {
  language: Ref<string>
  theme: Ref<Theme>
  preference_theme: Ref<Theme>
  isDark: ComputedRef<boolean>
  antdLanguage: ComputedRef<Locale>
  setLanguage: (lang: string) => void
  setTheme: (t: Theme) => void
  setPreferenceTheme: (t: Theme) => void
  captchaEndTime: Ref<number>
  setCaptchaEndTime: (endTime: number) => void
  getRemainingCaptchaTime: () => number
}

export const useSettingsStore = defineStore('settings', (): SettingsState => {
  const language = ref('zh_CN')
  const theme = useColorMode({
    initialValue: 'auto',
  }) as unknown as Ref<Theme>
  const preference_theme = ref<Theme>('auto')

  const captchaEndTime = ref<number>(0)

  const isDark = computed(() => {
    return theme.value === 'dark'
  })

  const antdLanguage = computed(() => {
    return language.value === 'zh_CN' ? zhCN : enUS
  })

  function setLanguage(lang: string) {
    language.value = lang
    gettext.current = lang
  }
  function setTheme(t: Theme) {
    theme.value = t
  }
  function setPreferenceTheme(t: Theme) {
    preference_theme.value = t
  }

  function setCaptchaEndTime(endTime: number) {
    captchaEndTime.value = endTime
  }
  function getRemainingCaptchaTime(): number {
    const now = Date.now()
    return Math.max(0, Math.floor((captchaEndTime.value - now) / 1000))
  }
  return {
    antdLanguage,
    language,
    theme,
    preference_theme,
    isDark,
    setLanguage,
    setTheme,
    setPreferenceTheme,
    captchaEndTime,
    setCaptchaEndTime,
    getRemainingCaptchaTime,
  }
}, {
  persist: true,
})
