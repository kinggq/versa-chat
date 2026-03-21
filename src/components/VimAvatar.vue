<template>
  <img
    v-if="src"
    class="vim-avatar"
    :style="sizeStyle"
    :src="src"
    :alt="alt"
    @click="$emit('click')"
  />
  <div v-else-if="showPlaceholder" class="vim-avatar vim-avatar-placeholder" :style="sizeStyle" />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    showPlaceholder?: boolean;
    size?: number;
  }>(),
  { size: 32 }
);

defineEmits<{
  (event: "click"): void;
}>();

const sizeStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}));
</script>

<style scoped>
.vim-avatar {
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  flex-shrink: 0;
}

.vim-avatar-placeholder {
  visibility: hidden;
}
</style>
