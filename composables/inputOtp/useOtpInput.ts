import type { Ref, ComputedRef } from 'vue'

interface UseOtpInputOptions {
  otpLength: ComputedRef<number>
  otpData: ComputedRef<string[]>
  otpInputEl: Ref<HTMLInputElement[]>
  updateOtp: (newArr: string[]) => void
}

/** 驗證輸入值是否為單一數字 (0-9) */
const validateInput = (value: string): boolean => {
  return /^[0-9]$/.test(value)
}

export function useOtpInput (options: UseOtpInputOptions) {
  const { otpLength, otpData, otpInputEl, updateOtp } = options

  /** focus 指定索引的 input 元素 */
  const focusInputByIndex = (index: number) => {
    otpInputEl.value[index]?.focus()
  }

  /** select 指定索引的 input 元素內容 */
  const selectInputByIndex = (index: number) => {
    otpInputEl.value[index]?.select()
  }

  /** 處理單格輸入 */
  const handleInput = (event: Event, index: number) => {
    const input = event.target as HTMLInputElement
    const inputValue = input.value

    if (!validateInput(inputValue)) {
      input.value = ''
      return
    }

    const newArr = [...otpData.value]
    newArr[index] = inputValue
    updateOtp(newArr)

    // 自動跳到下一格
    if (index < otpLength.value - 1) {
      focusInputByIndex(index + 1)
    }
  }

  /** 處理貼上（修復超長字串 bug） */
  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault()
    const clipboardData = event.clipboardData
    if (!clipboardData) { return }

    const pastedData = clipboardData.getData('text')

    // 過濾非數字，並只保留 otpLength 長度
    const validDigits = pastedData
      .split('')
      .filter(char => validateInput(char))
      .slice(0, otpLength.value)

    // 建立新陣列並填入有效數字
    const newArr = Array.from({ length: otpLength.value }, () => '')
    validDigits.forEach((digit, index) => {
      newArr[index] = digit
    })

    updateOtp(newArr)

    // 將焦點移到最後一個填入的格子，或最後一格
    const focusIndex = Math.min(validDigits.length, otpLength.value - 1)
    focusInputByIndex(focusIndex)
  }

  /** 處理鍵盤事件 */
  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'Backspace':
        event.preventDefault()
        if (otpData.value[index] !== '') {
          const newArr = [...otpData.value]
          newArr[index] = ''
          updateOtp(newArr)
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

  return {
    validateInput,
    handleInput,
    handlePaste,
    handleKeyDown
  }
}
