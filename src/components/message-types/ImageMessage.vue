<template>
  <img class="vim-image-message" :src="src" alt="image message" />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  content: unknown;
}>();

const src = computed(() => {
  if (typeof props.content === "string") {
    return props.content;
  }
  if (
    props.content &&
    typeof props.content === "object" &&
    "url" in props.content &&
    typeof (props.content as { url: unknown }).url === "string"
  ) {
    return (props.content as { url: string }).url;
  }
  return "";
});
</script>

<style scoped>
.vim-image-message {
  display: block;
  max-width: 220px;
  border-radius: 8px;
  object-fit: cover;
}
</style>
