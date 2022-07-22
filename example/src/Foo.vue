<script setup>
defineProps({ modelValue: null })
defineEmits(['update:modelValue'])
</script>

<template>
  <section>
    <slot />
  </section>
</template>
