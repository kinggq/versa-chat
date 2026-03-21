<template>
  <div
    class="vim-input-wrap"
    :class="{ 'is-drag-over': dragOver }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div class="tools">
      <slot name="input-tools" />
    </div>
    <textarea
      v-model="text"
      class="input"
      placeholder="输入消息，Ctrl+Enter 发送；可粘贴图片或拖拽文件"
      @keydown="onKeydown"
      @paste="onPaste"
    />
    <div class="action">
      <button class="send-btn" type="button" @click="submit">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { VIMInputFilesPayload } from "../types";

const emit = defineEmits<{
  (event: "send", text: string): void;
  (event: "input-files", payload: VIMInputFilesPayload): void;
}>();

const text = ref("");
const dragOver = ref(false);
function submit(): void {
  const payload = text.value.trim();
  if (!payload) {
    return;
  }
  emit("send", payload);
  text.value = "";
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

.tools {
  padding: 8px 10px;
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
