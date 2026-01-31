<script setup lang="ts">

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

const resetStatus = () => {
  verifyError.value = false
  verifyErrorMessage.value = ''
  verifySuccess.value = false
  verifySuccessMessage.value = ''
}

const verifyOtp = async (value: string)=>{ 
  try {
    const res = await useHttp().post('/examples/verify-otp-simple', {
      body: {
        otp: value
      }
    }) as otpResData
    if(res.success) {
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

const handleComplete = (value: string) => {
  verifyOtp(value)
}

</script>

<template>
  <BaseInputOtp 
    @complete="handleComplete" 
    :error="verifyError" 
    :error-message="verifyErrorMessage" 
    :success="verifySuccess" 
    :success-message="verifySuccessMessage" 
  />
</template>
