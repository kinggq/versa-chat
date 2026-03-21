<template>
  <div class="vim-file-message">
    <span class="name">{{ fileName }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  content: unknown;
}>();

const fileName = computed(() => {
  if (typeof props.content === "string") {
    return props.content;
  }
  if (
    props.content &&
    typeof props.content === "object" &&
    "name" in props.content &&
    typeof (props.content as { name: unknown }).name === "string"
  ) {
    return (props.content as { name: string }).name;
  }
  return "未命名文件";
});
</script>

<style scoped>
.vim-file-message {
  min-width: 160px;
  padding: 8px 10px;
  border: 1px solid var(--vim-border-color);
  border-radius: 8px;
  background: #fff;
}

.name {
  font-size: 13px;
}
</style>
