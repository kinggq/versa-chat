<template>
  <div ref="listRoot" class="vim-message-list" @scroll="onScroll">
    <template v-for="(msg, index) in messages" :key="msg.id">
      <div v-if="showTimeDivider(index)" class="time-divider">
        {{ formatTime(msg.timestamp) }}
      </div>

      <div
        class="message-row"
        :class="msg.sender === 'self' ? 'is-self' : 'is-other'"
        :data-message-id="msg.id"
      >
        <img
          v-if="showAvatar && msg.sender === 'other' && msg.avatar"
          class="avatar"
          :src="msg.avatar"
          alt="avatar"
          @click="$emit('click-avatar', msg)"
        />
        <div v-else-if="showAvatar && msg.sender === 'other'" class="avatar placeholder" />

        <div class="bubble-column">
          <button
            v-if="msg.quote"
            type="button"
            class="quote-bar"
            @click="onQuoteClick(msg.quote!)"
          >
            <span class="quote-label">引用</span>
            <span class="quote-preview">{{ msg.quote.preview || "消息" }}</span>
          </button>

          <div
            class="bubble"
            @contextmenu.prevent="openMenu($event, msg)"
          >
            <slot name="message-item" :message="msg">
              <component
                :is="resolveMessageRenderer(msg.type)"
                :content="msg.content"
                :message="msg"
              />
            </slot>
          </div>

          <div v-if="msg.sender === 'self' && (msg.sending || msg.failed)" class="send-status">
            <span v-if="msg.sending" class="status sending">发送中…</span>
            <span v-if="msg.failed" class="status failed">发送失败</span>
          </div>
        </div>

        <img
          v-if="showAvatar && msg.sender === 'self' && msg.avatar"
          class="avatar"
          :src="msg.avatar"
          alt="avatar"
          @click="$emit('click-avatar', msg)"
        />
        <div v-else-if="showAvatar && msg.sender === 'self'" class="avatar placeholder" />
      </div>
    </template>

    <Teleport to="body">
      <div
        v-if="menuOpen && menuPosition"
        class="vim-context-menu-backdrop"
        @click="closeMenu"
        @contextmenu.prevent="closeMenu"
      />
      <ul
        v-if="menuOpen && menuPosition && activeMenuMessage"
        class="vim-context-menu"
        :style="{ left: `${menuPosition.left}px`, top: `${menuPosition.top}px` }"
        @click.stop
      >
        <li
          v-for="item in resolvedMenuItems(activeMenuMessage)"
          :key="item.key"
        >
          <button type="button" class="menu-item" @click="onMenuSelect(item.key)">
            {{ item.label }}
          </button>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { Component } from "vue";
import type { VIMMenuItem, VIMMessage, VIMMessageTypeMap, VIMQuoteRef } from "../types";
import TextMessage from "./message-types/TextMessage.vue";
import ImageMessage from "./message-types/ImageMessage.vue";
import FileMessage from "./message-types/FileMessage.vue";

const props = withDefaults(
  defineProps<{
    messages: VIMMessage[];
    showAvatar?: boolean;
    mobile?: boolean;
    customMessageTypes?: VIMMessageTypeMap;
    enableRecall?: boolean;
    enableMessageMenu?: boolean;
    menuItems?: VIMMenuItem[];
  }>(),
  {
    showAvatar: true,
    mobile: false,
    customMessageTypes: () => ({}),
    enableRecall: true,
    enableMessageMenu: true,
    menuItems: undefined
  }
);

const emit = defineEmits<{
  (event: "pull-history"): void;
  (event: "click-avatar", message: VIMMessage): void;
  (event: "menu-click", payload: { action: string; message: VIMMessage }): void;
  (event: "quote-locate", payload: { quotedId: string; message?: VIMMessage }): void;
}>();

const listRoot = ref<HTMLElement | null>(null);

const menuOpen = ref(false);
const menuPosition = ref<{ left: number; top: number } | null>(null);
const activeMenuMessage = ref<VIMMessage | null>(null);

const builtInTypeMap = computed<Record<string, Component>>(() => ({
  text: TextMessage,
  image: ImageMessage,
  file: FileMessage
}));

const mergedTypeMap = computed<Record<string, Component>>(() => ({
  ...builtInTypeMap.value,
  ...props.customMessageTypes
}));

function resolveMessageRenderer(type: string): Component {
  return mergedTypeMap.value[type] ?? TextMessage;
}

function showTimeDivider(index: number): boolean {
  if (index === 0) {
    return true;
  }
  const current = props.messages[index];
  const prev = props.messages[index - 1];
  return current.timestamp - prev.timestamp > 5 * 60 * 1000;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

function onScroll(event: Event): void {
  const target = event.target as HTMLElement;
  if (target.scrollTop <= 20) {
    emit("pull-history");
  }
}

function defaultMenuItemsFor(message: VIMMessage): VIMMenuItem[] {
  return [
    { key: "copy", label: "复制", visible: () => canCopyMessage(message) },
    {
      key: "recall",
      label: "撤回",
      visible: (m) => m.sender === "self" && props.enableRecall
    },
    { key: "delete", label: "删除", visible: () => true }
  ];
}

function resolvedMenuItems(message: VIMMessage): VIMMenuItem[] {
  const items = props.menuItems ?? defaultMenuItemsFor(message);
  return items.filter((item) => (item.visible ? item.visible(message) : true));
}

function canCopyMessage(message: VIMMessage): boolean {
  if (message.type === "text" && typeof message.content === "string") {
    return true;
  }
  return false;
}

async function copyMessage(message: VIMMessage): Promise<void> {
  const text =
    message.type === "text" && typeof message.content === "string"
      ? message.content
      : "";
  if (!text || typeof navigator === "undefined" || !navigator.clipboard) {
    return;
  }
  await navigator.clipboard.writeText(text);
}

function openMenu(event: MouseEvent, message: VIMMessage): void {
  if (!props.enableMessageMenu) {
    return;
  }
  activeMenuMessage.value = message;
  menuPosition.value = { left: event.clientX, top: event.clientY };
  menuOpen.value = true;
}

function closeMenu(): void {
  menuOpen.value = false;
  menuPosition.value = null;
  activeMenuMessage.value = null;
}

async function onMenuSelect(action: string): Promise<void> {
  const message = activeMenuMessage.value;
  if (!message) {
    closeMenu();
    return;
  }
  if (action === "copy") {
    await copyMessage(message);
  }
  emit("menu-click", { action, message });
  closeMenu();
}

function onQuoteClick(quote: VIMQuoteRef): void {
  const msg = props.messages.find((m) => m.id === quote.id);
  emit("quote-locate", { quotedId: quote.id, message: msg });
  scrollToMessage(quote.id);
}

function escapeAttr(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function scrollToMessage(id: string): void {
  const root = listRoot.value;
  if (!root) {
    return;
  }
  const el = root.querySelector(`[data-message-id="${escapeAttr(id)}"]`);
  if (el instanceof HTMLElement) {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

function onDocClick(): void {
  if (menuOpen.value) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
});

defineExpose({
  scrollToMessage
});
</script>

<style scoped>
.vim-message-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: var(--vim-bg-color);
}

.time-divider {
  margin: 10px 0;
  text-align: center;
  font-size: 12px;
  color: var(--vim-muted-text-color);
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.message-row.is-self {
  justify-content: flex-end;
  flex-direction: row;
}

.message-row.is-other {
  justify-content: flex-start;
  flex-direction: row;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar.placeholder {
  visibility: hidden;
}

.bubble-column {
  display: flex;
  flex-direction: column;
  align-items: inherit;
  max-width: min(60%, 500px);
}

.is-self .bubble-column {
  align-items: flex-end;
}

.is-other .bubble-column {
  align-items: flex-start;
}

.quote-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  margin-bottom: 4px;
  padding: 4px 8px;
  border: 1px solid var(--vim-quote-border);
  border-radius: 4px;
  background: var(--vim-quote-bg);
  font-size: 12px;
  color: var(--vim-muted-text-color);
  cursor: pointer;
  text-align: left;
}

.quote-label {
  flex-shrink: 0;
  color: var(--vim-primary-color);
}

.quote-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bubble {
  padding: 8px 10px;
  border-radius: var(--vim-border-radius);
  background: var(--vim-bubble-left-bg);
  color: var(--vim-text-color);
  word-break: break-word;
}

.is-self .bubble {
  background: var(--vim-bubble-right-bg);
}

.send-status {
  margin-top: 4px;
  font-size: 12px;
}

.status.sending {
  color: var(--vim-status-sending);
}

.status.failed {
  color: var(--vim-status-failed);
}

:global(.vim-context-menu-backdrop) {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: transparent;
}

:global(.vim-context-menu) {
  position: fixed;
  z-index: 9999;
  min-width: 120px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--vim-menu-bg);
  border: 1px solid var(--vim-border-color);
  border-radius: var(--vim-border-radius);
  box-shadow: var(--vim-menu-shadow);
}

.menu-item {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 13px;
  cursor: pointer;
}

.menu-item:hover {
  background: var(--vim-bg-color);
}
</style>
