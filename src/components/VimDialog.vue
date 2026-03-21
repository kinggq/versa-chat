<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="vim-dialog-mask"
      role="presentation"
      @click.self="onMaskClick"
    >
      <div
        class="vim-dialog"
        :style="dialogStyle"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'vim-dialog-title' : undefined"
      >
        <div v-if="title || $slots.title || showClose" class="vim-dialog-header">
          <h2 v-if="title" id="vim-dialog-title" class="vim-dialog-title">{{ title }}</h2>
          <slot v-else name="title" />
          <button
            v-if="showClose"
            type="button"
            class="vim-dialog-close"
            aria-label="关闭"
            @click="close"
          >
            ×
          </button>
        </div>
        <div class="vim-dialog-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    width?: string | number;
    height?: string | number;
    showClose?: boolean;
    closeOnMaskClick?: boolean;
  }>(),
  {
    title: "",
    showClose: true,
    closeOnMaskClick: true
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

const dialogStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width != null) {
    style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
  }
  if (props.height != null) {
    style.height = typeof props.height === "number" ? `${props.height}px` : props.height;
  }
  return style;
});

function close(): void {
  emit("update:modelValue", false);
}

function onMaskClick(): void {
  if (props.closeOnMaskClick) close();
}
</script>

<style scoped>
.vim-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.vim-dialog {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--vim-border-radius);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.vim-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--vim-border-color);
}

.vim-dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.vim-dialog-close {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: var(--vim-muted-text-color);
  cursor: pointer;
  border-radius: 4px;
}

.vim-dialog-close:hover {
  background: var(--vim-bg-color);
  color: var(--vim-text-color);
}

.vim-dialog-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
