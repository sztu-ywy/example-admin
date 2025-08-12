<script setup lang="ts">
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import { Form, message } from 'ant-design-vue'
import auth from '~/api/auth'
import gettext from '~/language/gettext'
import { useUserStore } from '~/store'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)

const modelRef = reactive({
  email: '',
  password: '',
})

const rulesRef = reactive({
  email: [
    {
      required: true,
      message: () => $gettext('Please input your email!'),
    },
  ],
  password: [
    {
      required: true,
      message: () => $gettext('Please input your password!'),
    },
  ],
})

const { validate, validateInfos, clearValidate } = Form.useForm(modelRef, rulesRef)

function onSubmit() {
  loading.value = true

  validate().then(async () => {
    await auth.login(modelRef)
      .then(async () => {
        message.success($gettext('Login successful'), 1)

        // 获取用户信息,出现重复调用
        // await userApi.current()

        redirectToNext()
      })
      .catch((e) => {
        // 处理不同的错误码
        switch (e.code) {
          case 4031:
            message.error($gettext('Incorrect email or password'))
            break
          case 4291:
            message.error($gettext('Too many login failed attempts, please try again later'))
            break
          case 4033:
            message.error($gettext('User is banned'))
            break
          default:
            message.error($gettext(e.message ?? 'Server error'))
            break
        }
      })
  }).finally(() => {
    loading.value = false
  })
}

function redirectToNext() {
  const next = (route.query?.next || '').toString() || '/dashboard'

  router.push(next)
}

if (userStore.token) {
  redirectToNext()
}

watch(() => gettext.current, () => {
  clearValidate()
})
</script>

<template>
  <AForm id="components-form-demo-normal-login">
    <AFormItem v-bind="validateInfos.email">
      <AInput
        v-model:value="modelRef.email"
        :placeholder="$gettext('Email')"
      >
        <template #prefix>
          <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
        </template>
      </AInput>
    </AFormItem>
    <AFormItem v-bind="validateInfos.password">
      <AInputPassword
        v-model:value="modelRef.password"
        :placeholder="$gettext('Password')"
      >
        <template #prefix>
          <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
        </template>
      </AInputPassword>
    </AFormItem>
    <AFormItem>
      <AButton
        type="primary"
        block
        html-type="submit"
        :loading
        @click="onSubmit"
      >
        {{ $gettext('Login') }}
      </AButton>
    </AFormItem>
  </AForm>
</template>

<style lang="less" scoped>

</style>
