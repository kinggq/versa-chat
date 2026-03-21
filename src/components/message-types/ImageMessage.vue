<template>
  <div ref="wrapRef" class="vim-image-message-wrap" @click="onClick">
    <div v-if="!loaded" class="vim-image-placeholder">
      <span class="vim-image-placeholder-text">图片</span>
    </div>
    <img
      v-show="loaded"
      ref="imgRef"
      class="vim-image-message vim-image-clickable"
      :src="shouldLoad ? resolvedSrc : undefined"
      alt="image message"
      @load="loaded = true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  content: unknown;
  message?: { id: string };
}>();

const emit = defineEmits<{
  (event: "click-image", url: string): void;
}>();

function onClick(): void {
  if (resolvedSrc.value) emit("click-image", resolvedSrc.value);
}

const wrapRef = ref<HTMLElement | null>(null);
const imgRef = ref<HTMLImageElement | null>(null);
const loaded = ref(false);
const shouldLoad = ref(false);

const resolvedSrc = computed(() => {
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

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!wrapRef.value || !resolvedSrc.value || typeof IntersectionObserver === "undefined") {
    shouldLoad.value = true;
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        shouldLoad.value = true;
        observer?.disconnect();
      }
    },
    { rootMargin: "100px" }
  );
  observer.observe(wrapRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.vim-image-message-wrap {
  position: relative;
  min-width: 120px;
  min-height: 80px;
}

.vim-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vim-quote-bg);
  border-radius: 8px;
  color: var(--vim-muted-text-color);
  font-size: 12px;
}

.vim-image-placeholder-text {
  opacity: 0.8;
}

.vim-image-message {
  display: block;
  max-width: 220px;
  border-radius: 8px;
  object-fit: cover;
}

.vim-image-clickable {
  cursor: pointer;
}
</style>
