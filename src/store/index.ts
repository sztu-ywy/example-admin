import piniaPluginPersistState from 'pinia-plugin-persistedstate'

export * from './modules/permissions'
export * from './modules/settings'
export * from './modules/user'

export const store = createPinia()

store.use(piniaPluginPersistState)
