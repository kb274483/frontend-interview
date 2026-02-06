<script setup lang="ts">
import { ref, watch } from 'vue'

type OtpResData = {
  success: boolean
  data: {
    verified: boolean
    timestamp: string
  }
}

const feedback = ref<{
  show: boolean
  type: 'success' | 'error'
  message: string
}>({
  show: false,
  type: 'error',
  message: ''
})

const disabledComponent = ref(false)
const cols = ref(3)
const otpValue = ref('')
const checkOtpLength = ref(6)

const resetStatus = () => {
  feedback.value = { show: false, type: 'error', message: '' }
  disabledComponent.value = false
}

const verifyOtp = async (value: string) => {
  try {
    const res = await useHttp().post('/examples/verify-otp-simple', {
      body: {
        otp: value
      }
    }) as OtpResData
    if (res.success) {
      feedback.value = { show: true, type: 'success', message: 'Verify Success' }
    } else {
      feedback.value = { show: true, type: 'error', message: 'Verify Failed' }
    }
  } catch (error) {
    console.error(error)
    feedback.value = { show: true, type: 'error', message: 'Please try again later' }
  } finally {
    setTimeout(() => {
      resetStatus()
    }, 3000)
  }
}

watch(otpValue, (newVal) => {
  if (newVal.length === checkOtpLength.value) {
    disabledComponent.value = true
    verifyOtp(newVal)
  }
})
</script>

<template>
  <div class="flex h-dvh w-full flex-col items-center justify-center bg-gray-200">
    <BaseInputOtp
      v-model="otpValue"
      :cols="cols"
      :disabled="disabledComponent"
      :error="feedback.type === 'error' && feedback.show"
      :success="feedback.type === 'success' && feedback.show"
    />

    <!-- 驗證訊息 -->
    <BaseFeedbackMessage
      :show="feedback.show"
      :type="feedback.type"
      :message="feedback.message"
    />
  </div>
</template>
