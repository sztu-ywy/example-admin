<script lang="ts" setup>
import { Form, message } from 'ant-design-vue'
import auth from '~/api/auth'
import { useSettingsStore } from '~/store/modules/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

// Form data
const formState = reactive({
  phone: '',
  captcha: '',
})

const loading = ref(false)
const captchaLoading = ref(false)

// Form validation rules
const rules = reactive({
  phone: [
    {
      required: true,
      message: () => $gettext('Please enter your phone number'),
    },
    {
      pattern: /^\d+$/,
      message: () => $gettext('Phone number must be numeric'),
    },
  ],
  captcha: [
    {
      required: true,
      message: () => $gettext('Please enter verification code'),
    },
    {
      pattern: /^\d{6}$/,
      message: () => $gettext('Verification code must be 6 digits'),
    },
  ],
})

const { validate, validateInfos } = Form.useForm(formState, rules)
const formRef = ref()

// Countdown timer
const countdown = ref(settingsStore.getRemainingCaptchaTime())
const canSendCaptcha = computed(() => countdown.value === 0)
const countdownText = computed(() => canSendCaptcha.value
  ? $gettext('Send')
  : $gettext('%{countdown}s', { countdown: countdown.value.toString() }),
)

// Start timer on component mount if needed
onMounted(() => {
  if (countdown.value > 0) {
    startCountdown(false)
  }
})

// Start countdown timer
function startCountdown(isNewRequest = true) {
  if (isNewRequest) {
    countdown.value = 60
    // Store end time in settings store
    const endTime = Date.now() + countdown.value * 1000
    settingsStore.setCaptchaEndTime(endTime)
  }

  const timer = setInterval(() => {
    countdown.value = settingsStore.getRemainingCaptchaTime()
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// Send verification code
async function sendCaptcha() {
  // Check if phone is empty first to avoid unnecessary API calls
  if (!formState.phone) {
    message.warning($gettext('Please enter your phone number'))
    return
  }

  try {
    await formRef.value.validateFields(['phone'])
    captchaLoading.value = true
    await auth.validPhone({
      area_code: 86,
      phone: formState.phone,
    })
    message.success($gettext('Verification code sent successfully'))
    startCountdown()
  }
  catch (error: any) {
    // Validation error, already handled by form
    if (!error.message)
      return

    message.error(error.message || $gettext('Failed to send verification code'))
  }
  finally {
    captchaLoading.value = false
  }
}

// Submit login form
function handleLogin() {
  loading.value = true

  validate().then(async () => {
    await auth.phoneLogin({
      area_code: 86,
      phone: formState.phone,
      captcha: formState.captcha,
    })
      .then(async () => {
        message.success($gettext('Login successful'))

        // 获取用户信息，出现重复调用
        // await userApi.current()

        router.push('/')
      })
      .catch((error) => {
        // 处理不同的错误码
        switch (error.code) {
          case 4031:
            message.error($gettext('Incorrect phone or captcha'))
            break
          case 4291:
            message.error($gettext('Too many login failed attempts, please try again later'))
            break
          case 4033:
            message.error($gettext('User is banned'))
            break
          default:
            message.error($gettext(error.message ?? 'Server error'))
            break
        }
      })
  }).finally(() => {
    loading.value = false
  })
}
</script>

<template>
  <div class="phone-login">
    <AForm
      ref="formRef"
      :model="formState"
      layout="vertical"
    >
      <AFormItem v-bind="validateInfos.phone">
        <AInputGroup compact>
          <AButton
            style="width: 60px"
            disabled
          >
            +86
          </AButton>
          <AInput
            v-model:value="formState.phone"
            style="width: calc(100% - 60px)"
            :placeholder="$gettext('Enter phone number')"
          />
        </AInputGroup>
      </AFormItem>

      <AFormItem v-bind="validateInfos.captcha">
        <AInputGroup compact>
          <AInput
            v-model:value="formState.captcha"
            :placeholder="$gettext('Enter verification code')"
            style="width: calc(100% - 100px)"
            :maxlength="6"
          />
          <AButton
            :disabled="!canSendCaptcha || captchaLoading"
            :loading="captchaLoading"
            style="width: 100px"
            @click="sendCaptcha"
          >
            {{ countdownText }}
          </AButton>
        </AInputGroup>
      </AFormItem>

      <AFormItem>
        <AButton
          type="primary"
          :loading="loading"
          block
          html-type="submit"
          @click="handleLogin"
        >
          {{ $gettext('Login') }}
        </AButton>
      </AFormItem>
    </AForm>
  </div>
</template>

<style scoped lang="less">
.phone-login {
  width: 100%;
}
</style>
