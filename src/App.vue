<script setup lang="ts">
import { theme } from 'ant-design-vue'
import { useSettingsStore, useUserStore } from '~/store'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

const watermarkFontColor = computed(() => {
  return settingsStore.isDark ? 'rgba(255, 255, 255, .06)' : 'rgba(0, 0, 0, .06)'
})

onMounted(() => {
  if (userStore.isLogin) {
    // settingsStore.fetchVoices()
    // settingsStore.fetchLLMs()
  }
})

watch(() => userStore.isLogin, (v) => {
  if (v) {
    // settingsStore.fetchVoices()
    // settingsStore.fetchLLMs()
  }
})
</script>

<template>
  <AConfigProvider
    :theme="{
      algorithm: settingsStore.isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }"
    :locale="settingsStore.antdLanguage"
    :auto-insert-space-in-button="false"
  >
    <!-- 水印设置为用户名 -->
    <AWatermark
      :content="`${userStore.info.name || ''}`"
      :font="{ color: watermarkFontColor }"
    >
      <div class="bg-truegray-1 dark:bg-truegray-9">
        <RouterView />
      </div>
    </AWatermark>
  </AConfigProvider>
</template>
