<!-- 元件基本需要的功能
- [x] 可支援 4-8 位數字驗證碼（預設 6 位）
- [x] 輸入數字或是 Tab 後自動跳到下一格
- [x] 按 Backspace 回到上一格
- [x] 任何輸入框內可一次貼上完整驗證碼
- [x] 只允許輸入 0-9 數字
- [x] 輸入完成時觸發 complete 事件
- [x] 支援錯誤/成功邊框樣式
- [x] 透過API 驗證與處理otp驗證碼：`/api/examples/verify-otp-simple`
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOtpInput } from '~/composables/inputOtp/useOtpInput'

type Props = {
  modelValue: string
  cols?: number
  length?: number
  error?: boolean
  success?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  cols: 6,
  modelValue: '',
  error: false,
  success: false,
  disabled: false
})

const emit = defineEmits<{(e: 'update:modelValue', value: string): void}>()

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, minmax(0, 1fr))`
}))

const otpLength = computed(() => {
  const length = props.length ?? 6
  return Math.max(4, Math.min(8, length)) // 限制在 4 - 8 碼
})

// otpData 從 modelValue 取得
const otpData = computed(() => {
  const arr = Array.from({ length: otpLength.value }, () => '')
  props.modelValue.split('').slice(0, otpLength.value).forEach((char, i) => {
    arr[i] = char
  })
  return arr
})

const otpInputEl = ref<HTMLInputElement[]>([]) // 儲存 input 元素 DOM

const updateOtp = (newArr: string[]) => {
  emit('update:modelValue', newArr.join(''))
}

// 使用 composable 處理輸入邏輯
const { handleInput, handlePaste, handleKeyDown } = useOtpInput({
  otpLength,
  otpData,
  otpInputEl,
  updateOtp
})

const baseInputClass = 'relative z-50 size-12 rounded-xl border-2 bg-white text-center text-2xl text-black outline-none transition-all duration-300 ease-linear focus:ring-2 sm:size-16'

const inputClass = computed(() => {
  if (props.error) {
    return `${baseInputClass} border-red-500 focus:border-red-500 focus:ring-red-200`
  }
  if (props.success) {
    return `${baseInputClass} border-green-500 focus:border-green-500 focus:ring-green-200`
  }
  return `${baseInputClass} border-gray-600 focus:border-blue-400 focus:ring-blue-200`
})
</script>

<template>
  <div
    class="relative grid items-center justify-center gap-2"
    :style="gridStyle"
  >
    <input
      v-for="(item, index) in otpData"
      :key="index"
      ref="otpInputEl"
      :value="item"
      type="text"
      maxlength="1"
      inputmode="numeric"
      autocomplete="one-time-code"
      :class="inputClass"
      :disabled="props.disabled"
      @input="handleInput($event, index)"
      @paste="handlePaste($event)"
      @keydown="handleKeyDown($event, index)"
    >
  </div>
</template>
