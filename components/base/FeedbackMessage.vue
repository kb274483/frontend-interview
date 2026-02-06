<script setup lang="ts">
type Props = {
  show: boolean
  type?: 'success' | 'error'
  message?: string
}

withDefaults(defineProps<Props>(), {
  show: false,
  type: 'error',
  message: ''
})

type FeedbackType = NonNullable<Props['type']>

const typeStyles: Record<FeedbackType, string> = {
  success: 'text-green-500',
  error: 'text-red-500'
}
</script>

<template>
  <transition name="fade">
    <p
      v-if="show && message"
      class="mt-4 text-center"
      :class="typeStyles[type]"
    >
      {{ message }}
    </p>
  </transition>
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
