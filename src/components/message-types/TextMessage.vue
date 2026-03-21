<template>
  <span class="vim-text-message">{{ text }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  content: unknown;
}>();

const text = computed(() => {
  if (typeof props.content === "string") {
    return props.content;
  }
  return "";
});
</script>

<style scoped>
.vim-text-message {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
