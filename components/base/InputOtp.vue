<!-- 元件需要的功能
- [ ] 可支援 4-8 位數字驗證碼（預設 6 位） // ok
- [ ] 輸入數字或是 Tab 後自動跳到下一格 // ok
- [ ] 按 Backspace 回到上一格 
- [ ] 任何輸入框內可一次貼上完整驗證碼
- [ ] 只允許輸入 0-9 數字 // ok
- [ ] 輸入完成時觸發 complete 事件 // ok
- [ ] 支援錯誤樣式和訊息顯示
- [ ] 透過API 驗證與處理otp驗證碼：`/api/examples/verify-otp-simple` 
-->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

type Props = {  
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
  error: false,
  errorMessage: '',
  disabled: false,
  success: false,
  successMessage: ''
});

const emit = defineEmits<{
  (e: 'complete', value: string): void
}>();

const otpLength = computed(() => {
  let length = props.length ?? 6;
  return Math.max(4, Math.min(8, length)); // 限制在 4 - 8 碼
});

const otpData = ref<string[]>([]);
const otpInputEl = ref<HTMLInputElement[]>([]); // 儲存 input 元素DOM

const isComplete = computed(() => {
  return otpData.value.every(item => item !== '' && validateInput(item));
});

// 限制輸入的值（只接受 0-9 ）
const validateInput = (value: string) => {
  return /^[0-9]$/.test(value);
}

// focus 指定索引的 input 元素
const focusInputByIndex = (index: number) => {
  otpInputEl.value[index].focus();
}

const handleInput = (event: Event, index: number) => {
  const inputValue = (event.target as HTMLInputElement).value;
  const input = event.target as HTMLInputElement;

  if (!validateInput(inputValue)) {
    input.value = '';
    return;
  }

  otpData.value[index] = inputValue;
  if (index < otpLength.value - 1) {
    focusInputByIndex(index + 1);
  }

  if(isComplete.value) {
    emit('complete', otpData.value.join(''));
  }
}



onMounted(() => {
  otpData.value = Array.from({ length: otpLength.value }, () => '');
});

</script>
<template>
  <div class="flex flex-col w-full h-dvh justify-center items-center bg-gray-200">
    <div class="sm:flex sm:items-center sm:justify-center gap-2 h-20">
      <input
        v-for="(item, index) in otpData"
        :key="index"
        :value="item"
        :ref="(el) => { if(el) otpInputEl[index] = el as HTMLInputElement }"
        type="text"
        maxlength="1"
        inputmode="numeric"
        autocomplete="one-time-code"
        class="w-20 h-full rounded-xl border-2 border-gray-600 bg-white px-3 py-2 text-center text-2xl text-black outline-0"
        :disabled="props.disabled"
        @input="handleInput($event, index)"
      >
    </div>
  </div>
</template>
