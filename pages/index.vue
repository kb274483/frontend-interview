<script setup lang="ts">

const handleComplete = (value: string) => {
  console.log("輸入完成: ", value);
}
</script>

<template>
  <BaseInputOtp :length="6" @complete="handleComplete" />
</template>
