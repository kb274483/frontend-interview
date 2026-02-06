<!-- 元件基本需要的功能
- [ ] 可支援 4-8 位數字驗證碼（預設 6 位） // ok
- [ ] 輸入數字或是 Tab 後自動跳到下一格 // ok
- [ ] 按 Backspace 回到上一格 // ok
- [ ] 任何輸入框內可一次貼上完整驗證碼  // ok
- [ ] 只允許輸入 0-9 數字 // ok
- [ ] 輸入完成時觸發 complete 事件 // ok
- [ ] 支援錯誤樣式和訊息顯示 // ok
- [ ] 透過API 驗證與處理otp驗證碼：`/api/examples/verify-otp-simple`  // ok

補上：
  驗證成功的訊息顯示3秒後消失
  驗證失敗時，清空輸入匡
  submit 按鈕？ 參考預覽圖片 assets/preview.png
-->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

type Props = {
  modelValue:string;
  cols?: number;
  length?: number;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  // 增加驗證成功訊息的屬性
  success?: boolean;
  successMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  cols: 6,
  modelValue: '',
  error: false,
  errorMessage: '',
  disabled: false,
  success: false,
  successMessage: ''
})

const emit = defineEmits <{
  // (e: 'complete', value: string): void 
  (e: 'update:modelValue', value: string): void
}> ()

const otpLength = computed(() => {
  const length = props.length ?? 6
  return Math.max(4, Math.min(8, length)) // 限制在 4 - 8 碼
})

const otpData = ref<string[]>([]) // 儲存輸入的值
const otpInputEl = ref<HTMLInputElement[]>([]) // 儲存 input 元素DOM

// const isComplete = computed(() => { // 檢查是否輸入完成
//   return otpData.value.every(item => item !== '' && validateInput(item))
// })

// 驗證錯誤時清空輸入匡
watch(() => props.error, (newVal) => {
  if (newVal) { otpData.value = Array.from({ length: otpLength.value }, () => '') }
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== otpData.value.join('')) {
    const newArr = Array.from({ length: otpLength.value }, () => '')
    const splitVal = newVal.split('').slice(0, otpLength.value)
    splitVal.forEach((char, index) => {
      newArr[index] = char
    })
    otpData.value = newArr
  }
}, { immediate: true })

const emitUpdate = () => {
  const currentValue = otpData.value.join('')
  emit('update:modelValue', currentValue)
}

// 限制輸入的值（只接受 0-9 ）
const validateInput = (value: string) => {
  return /^[0-9]$/.test(value)
}

// focus 指定索引的 input 元素
const focusInputByIndex = (index: number) => {
  otpInputEl.value[index].focus()
}

const selectInputByIndex = (index: number) => {
  otpInputEl.value[index].select()
}

const handleInput = (event: Event, index: number) => {
  const inputValue = (event.target as HTMLInputElement).value
  const input = event.target as HTMLInputElement
  if (!validateInput(inputValue)) {
    input.value = ''
    otpData.value[index] = ''
    return
  }
  otpData.value[index] = inputValue
  emitUpdate()

  if (index < otpLength.value - 1) {
    focusInputByIndex(index + 1)
  }

  // if (isComplete.value) {
  //   emit('complete', otpData.value.join(''))
  // }
}

// 處理貼上
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const clipboardData = event.clipboardData
  if (!clipboardData) { return }

  const pastedData = clipboardData.getData('text')
  // 字串先轉成陣列 再過濾掉非數字的值
  pastedData.split('').filter(item => validateInput(item)).forEach((item, index) => {
    otpData.value[index] = item
  })
  emitUpdate()
}

const handleKeyDown = (event: KeyboardEvent, index: number) => {
  switch (event.key) {
    case 'Backspace': // 刪除鍵
      // 開啟阻止預設行為，有值先清空，沒值才退回上一格
      // event.preventDefault();
      if (otpData.value[index] !== '') {
        otpData.value[index] = ''
        emitUpdate()
        return
      }
      if (index > 0) {
        focusInputByIndex(index - 1)
        selectInputByIndex(index - 1)
      }
      break
    default:
      break
  }
}

// const handleSubmit = () => {
//   if (props.disabled) { return }
//   if (!isComplete.value) { return }
//   emit('complete', otpData.value.join(''))
// }

onMounted(() => {
  otpData.value = Array.from({ length: otpLength.value }, () => '')
})

</script>
<template>
  <div class="flex h-dvh w-full flex-col items-center justify-center bg-gray-200">
    <div
      class="relative items-center justify-center gap-2 grid"
      :style="{
        gridTemplateColumns: props.cols ? `repeat(${props.cols}, 1fr)` : 'auto'
      }"
      >
      <!-- :class="props.cols ? `grid grid-cols-${props.cols}` : 'flex'" -->
      <input
        v-for="(item, index) in otpData"
        :key="index"
        ref="otpInputEl"
        :value="item"
        type="text"
        maxlength="1"
        inputmode="numeric"
        autocomplete="one-time-code"
        class="relative z-50 size-12 rounded-xl border-2
        border-gray-600 bg-white text-center text-2xl
        text-black outline-none transition-all
        duration-300 ease-linear focus:border-blue-400
        focus:ring-2 focus:ring-blue-200 sm:size-16"
        :class="{
          'border-red-500 focus:border-red-500 focus:ring-red-200': props.error,
          'border-green-500 focus:border-green-500 focus:ring-green-200': props.success,
        }"
        :disabled="props.disabled"
        @input="handleInput($event, index)"
        @paste="handlePaste($event)"
        @keydown="handleKeyDown($event, index)"
      >
      <!-- 錯誤訊息 -->
      <transition name="fade">
        <div
          v-if="props.error"
          class="absolute -bottom-8 left-0 w-full"
        >
          <div class="mt-2 text-center text-red-500">
            {{ props.errorMessage }}
          </div>
        </div>
      </transition>
      <!-- 成功訊息 -->
      <transition name="fade">
        <div
          v-if="props.success"
          class="absolute -bottom-8 left-0 w-full"
        >
          <div class="mt-2 text-center text-green-500">
            {{ props.successMessage }}
          </div>
        </div>
      </transition>
    </div>
    <!-- <div>
      <button
        class="mt-12 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
        :class="{
          'cursor-not-allowed bg-gray-500 text-gray-300 hover:bg-gray-400': props.disabled,
        }"
        @click="handleSubmit()"
      >
        Submit
      </button>
    </div> -->
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
