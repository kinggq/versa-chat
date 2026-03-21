<template>
  <div
    class="vim-input-wrap"
    :class="{ 'is-drag-over': dragOver }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div v-if="replyingQuote" class="vim-reply-bar">
      <span class="vim-reply-label">引用</span>
      <span class="vim-reply-preview">{{ replyingQuote.preview || "消息" }}</span>
      <button type="button" class="vim-reply-close" aria-label="取消" @click="clearReply">×</button>
    </div>
    <div class="tools">
      <button
        v-if="showImageButton"
        type="button"
        class="vim-tool-btn"
        title="发送图片"
        aria-label="发送图片"
        @click="triggerImageInput"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
      </button>
      <slot name="input-tools" />
    </div>
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="vim-file-input-hidden"
      multiple
      @change="onFileSelect"
    />
    <textarea
      v-model="text"
      class="input"
      :placeholder="placeholder"
      @keydown="onKeydown"
      @paste="onPaste"
    />
    <div class="action">
      <button class="send-btn" type="button" @click="submit">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { VIMInputFilesPayload, VIMQuoteRef, VIMSendPayload } from "../types";

const props = withDefaults(
  defineProps<{
    /** Show image upload button in toolbar */
    showImageButton?: boolean;
    /** Input placeholder */
    placeholder?: string;
    /** Draft text (v-model) */
    modelValue?: string;
    /** 引用回复时的引用信息 */
    replyingQuote?: VIMQuoteRef | null;
  }>(),
  { showImageButton: true, placeholder: "输入消息，Ctrl+Enter 发送；可粘贴图片或拖拽文件", modelValue: "", replyingQuote: null }
);

const emit = defineEmits<{
  (event: "send", payload: VIMSendPayload): void;
  (event: "input-files", payload: VIMInputFilesPayload): void;
  (event: "update:modelValue", v: string): void;
  (event: "cancel-reply"): void;
}>();

const text = computed({
  get: () => props.modelValue ?? "",
  set: (v: string) => emit("update:modelValue", v)
});
const dragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerImageInput(): void {
  fileInputRef.value?.click();
}

function onFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files?.length) {
    emit("input-files", { files: Array.from(files), source: "drop" });
  }
  input.value = "";
}
function clearReply(): void {
  emit("cancel-reply");
}

function submit(): void {
  const textVal = text.value.trim();
  if (!textVal) {
    return;
  }
  const payload: VIMSendPayload = {
    text: textVal,
    quote: props.replyingQuote || undefined
  };
  emit("send", payload);
  emit("update:modelValue", "");
  emit("cancel-reply");
}

function onKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    submit();
  }
}

function emitFiles(files: File[], source: VIMInputFilesPayload["source"]): void {
  if (!files.length) {
    return;
  }
  emit("input-files", { files, source });
}

function onPaste(event: ClipboardEvent): void {
  const items = event.clipboardData?.items;
  if (!items) {
    return;
  }
  const files: File[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.kind === "file") {
      const f = item.getAsFile();
      if (f) {
        files.push(f);
      }
    }
  }
  if (files.length) {
    event.preventDefault();
    emitFiles(files, "paste");
  }
}

function onDragOver(): void {
  dragOver.value = true;
}

function onDragLeave(): void {
  dragOver.value = false;
}

function onDrop(event: DragEvent): void {
  dragOver.value = false;
  const dt = event.dataTransfer;
  if (!dt?.files?.length) {
    return;
  }
  emitFiles(Array.from(dt.files), "drop");
}
</script>

<style scoped>
.vim-input-wrap {
  border-top: 1px solid var(--vim-border-color);
  background: #fff;
  transition: box-shadow 0.15s ease, background 0.15s ease;
}

.vim-input-wrap.is-drag-over {
  outline: 2px dashed var(--vim-primary-color);
  outline-offset: -2px;
  background: #fafafa;
}

.vim-reply-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--vim-quote-bg, #f0f0f0);
  border-bottom: 1px solid var(--vim-quote-border, #d9d9d9);
  font-size: 12px;
}

.vim-reply-label {
  color: var(--vim-muted-text-color);
  flex-shrink: 0;
}

.vim-reply-preview {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vim-reply-close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: var(--vim-muted-text-color);
  border-radius: 4px;
}

.vim-reply-close:hover {
  background: rgba(0, 0, 0, 0.08);
}

.tools {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
}

.vim-tool-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vim-muted-text-color);
  cursor: pointer;
  border-radius: 4px;
}

.vim-tool-btn:hover {
  background: var(--vim-bg-color);
  color: var(--vim-primary-color);
}

.vim-file-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.input {
  width: 100%;
  min-height: 88px;
  border: none;
  resize: none;
  padding: 8px 10px;
  font-size: var(--vim-font-size);
  outline: none;
  box-sizing: border-box;
}

.action {
  display: flex;
  justify-content: flex-end;
  padding: 8px 10px 10px;
}

.send-btn {
  border: none;
  background: var(--vim-primary-color);
  color: #fff;
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
}
</style>
