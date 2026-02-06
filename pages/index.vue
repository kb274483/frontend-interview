<script setup lang="ts">
import { ref, watch } from 'vue'

type otpResData = {
  success: boolean
  data: {
    verified: boolean
    timestamp: string
  }
}

const verifyError = ref(false)
const verifyErrorMessage = ref('')
const verifySuccess = ref(false)
const verifySuccessMessage = ref('')
const disabledComponent = ref(false)


const cols = 6
const otpValue = ref('')
const checkOtpLength = ref(6)

const resetStatus = () => {
  verifyError.value = false
  verifyErrorMessage.value = ''
  verifySuccess.value = false
  verifySuccessMessage.value = ''
  disabledComponent.value = false
}

const verifyOtp = async (value: string) => {
  try {
    const res = await useHttp().post('/examples/verify-otp-simple', {
      body: {
        otp: value
      }
    }) as otpResData
    if (res.success) {
      verifySuccess.value = true
      verifySuccessMessage.value = 'Verify Success'
    } else {
      verifyError.value = true
      verifyErrorMessage.value = ' Verify Failed'
    }
  } catch (error) {
    console.error(error)
    verifyError.value = true
    verifyErrorMessage.value = 'Please try again later'
  } finally {
    setTimeout(() => {
      resetStatus()
    }, 3000)
  }
}

// const handleComplete = (value: string) => {
//   disabledComponent.value = true
//   verifyOtp(value)
// }

watch(otpValue, (newVal) => {
  if (newVal.length === checkOtpLength.value) {
    disabledComponent.value = true
    verifyOtp(newVal)
  }
})

</script>

<template>
  <BaseInputOtp
    v-model="otpValue"
    :cols="cols"
    :disabled="disabledComponent"
    :error="verifyError"
    :error-message="verifyErrorMessage"
    :success="verifySuccess"
    :success-message="verifySuccessMessage"
  />
</template>

<!-- @complete="handleComplete" -->