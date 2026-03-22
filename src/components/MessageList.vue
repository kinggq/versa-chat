<template>
  <div ref="listRoot" class="vim-message-list" @scroll="onScroll">
    <div v-if="!messages.length" class="vim-message-empty">
      <slot name="empty">
        <span class="vim-message-empty-text">{{ emptyText }}</span>
      </slot>
    </div>
    <div
      v-else-if="virtualScroll"
      class="vim-virtual-inner"
      :style="virtualInnerStyle"
    >
      <template v-for="(msg, index) in visibleMessages" :key="msg.id">
        <div v-if="showTimeDivider(index)" class="time-divider">
          {{ formatTime(msg.timestamp) }}
        </div>

        <div
          class="message-row"
          :class="msg.sender === 'self' ? 'is-self' : 'is-other'"
          :data-message-id="msg.id"
        >
        <VimAvatar
          v-if="showAvatar && msg.sender === 'other'"
          :src="msg.avatar"
          :show-placeholder="!msg.avatar"
          @click="$emit('click-avatar', msg)"
        />

        <VimMessageBubble
          :is-self="msg.sender === 'self'"
          :quote="msg.quote"
          :sending="msg.sending"
          :failed="msg.failed"
          :delivery-status="msg.deliveryStatus"
          @quote-click="onQuoteClick"
          @contextmenu="openMenu($event, msg)"
        >
          <slot name="message-item" :message="msg">
            <component
              :is="resolveMessageRenderer(msg.type)"
              :content="msg.content"
              :message="msg"
              @click-image="(url: string) => emit('click-image', { url, message: msg })"
            />
          </slot>
        </VimMessageBubble>

        <VimAvatar
          v-if="showAvatar && msg.sender === 'self'"
          :src="msg.avatar"
          :show-placeholder="!msg.avatar"
          @click="$emit('click-avatar', msg)"
        />
      </div>
    </template>
    </div>

    <template v-else v-for="(msg, index) in messages" :key="msg.id">
      <div v-if="showTimeDivider(index)" class="time-divider">
        {{ formatTime(msg.timestamp) }}
      </div>

      <div
        class="message-row"
        :class="msg.sender === 'self' ? 'is-self' : 'is-other'"
        :data-message-id="msg.id"
      >
        <VimAvatar
          v-if="showAvatar && msg.sender === 'other'"
          :src="msg.avatar"
          :show-placeholder="!msg.avatar"
          @click="$emit('click-avatar', msg)"
        />

        <VimMessageBubble
          :is-self="msg.sender === 'self'"
          :quote="msg.quote"
          :sending="msg.sending"
          :failed="msg.failed"
          :delivery-status="msg.deliveryStatus"
          @quote-click="onQuoteClick"
          @contextmenu="openMenu($event, msg)"
        >
          <slot name="message-item" :message="msg">
            <component
              :is="resolveMessageRenderer(msg.type)"
              :content="msg.content"
              :message="msg"
              @click-image="(url: string) => emit('click-image', { url, message: msg })"
            />
          </slot>
        </VimMessageBubble>

        <VimAvatar
          v-if="showAvatar && msg.sender === 'self'"
          :src="msg.avatar"
          :show-placeholder="!msg.avatar"
          @click="$emit('click-avatar', msg)"
        />
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { Component } from "vue";
import type { VIMMenuItem, VIMMessage, VIMMessageTypeMap, VIMQuoteRef } from "../types";
import VimAvatar from "./VimAvatar.vue";
import VimMessageBubble from "./VimMessageBubble.vue";
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
    /** Enable virtual scroll when messages exceed threshold. Default 100. */
    virtualScrollThreshold?: number;
    /** Estimated row height for virtual scroll (px). Default 88. */
    virtualRowHeight?: number;
    /** Text when messages is empty */
    emptyText?: string;
  }>(),
  {
    showAvatar: true,
    mobile: false,
    customMessageTypes: () => ({}),
    enableRecall: true,
    enableMessageMenu: true,
    menuItems: undefined,
    virtualScrollThreshold: 100,
    virtualRowHeight: 88,
    emptyText: "暂无消息"
  }
);

const emit = defineEmits<{
  (event: "pull-history"): void;
  (event: "click-avatar", message: VIMMessage): void;
  (event: "menu-click", payload: { action: string; message: VIMMessage }): void;
  (event: "quote-locate", payload: { quotedId: string; message?: VIMMessage }): void;
  (event: "click-image", payload: { url: string; message: VIMMessage }): void;
}>();

const listRoot = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const containerHeight = ref(400);

const menuOpen = ref(false);
const menuPosition = ref<{ left: number; top: number } | null>(null);
const activeMenuMessage = ref<VIMMessage | null>(null);

const virtualScroll = computed(
  () => props.messages.length >= props.virtualScrollThreshold
);

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

const visibleRange = computed(() => {
  if (!virtualScroll.value) {
    return { start: 0, end: props.messages.length };
  }
  const buffer = 5;
  const start = Math.max(
    0,
    Math.floor(scrollTop.value / props.virtualRowHeight) - buffer
  );
  const visibleCount = Math.ceil(containerHeight.value / props.virtualRowHeight) + buffer * 2;
  const end = Math.min(props.messages.length, start + visibleCount);
  return { start, end };
});

const visibleMessages = computed(() => {
  const { start, end } = visibleRange.value;
  return props.messages.slice(start, end);
});

const totalHeight = computed(() => {
  if (!virtualScroll.value) return 0;
  return props.messages.length * props.virtualRowHeight;
});

const virtualInnerStyle = computed(() => {
  if (!virtualScroll.value) return {};
  const { start } = visibleRange.value;
  return {
    minHeight: `${totalHeight.value}px`,
    paddingTop: `${start * props.virtualRowHeight}px`
  };
});

function showTimeDivider(index: number): boolean {
  const actualIndex = visibleRange.value.start + index;
  if (actualIndex === 0) return true;
  const current = props.messages[actualIndex];
  const prev = props.messages[actualIndex - 1];
  return current.timestamp - prev.timestamp > 5 * 60 * 1000;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

function onScroll(event: Event): void {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
  if (target.scrollTop <= 20) {
    emit("pull-history");
  }
}

function updateContainerHeight(): void {
  if (listRoot.value) {
    containerHeight.value = listRoot.value.clientHeight;
  }
}

function defaultMenuItemsFor(message: VIMMessage): VIMMenuItem[] {
  return [
    { key: "copy", label: "复制", visible: () => canCopyMessage(message) },
    { key: "quote", label: "引用回复", visible: () => true },
    { key: "forward", label: "转发", visible: () => true },
    {
      key: "recall",
      label: "撤回",
      visible: (m) => m.sender === "self" && props.enableRecall
    },
    { key: "retry", label: "重新发送", visible: (m) => !!m.failed },
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
  if (!root) return;
  const el = root.querySelector(`[data-message-id="${escapeAttr(id)}"]`);
  if (el instanceof HTMLElement) {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

function scrollToBottom(): void {
  const root = listRoot.value;
  if (!root) return;
  root.scrollTop = root.scrollHeight - root.clientHeight;
}

function onDocClick(): void {
  if (menuOpen.value) closeMenu();
}

let resizeObserver: ResizeObserver | null = null;

watch(
  () => {
    const last = props.messages[props.messages.length - 1];
    return last ? { id: last.id, sender: last.sender, type: last.type } : null;
  },
  (curr, prev) => {
    if (curr && curr.sender === "self" && (!prev || curr.id !== prev.id)) {
      nextTick(() => scrollToBottom());
      if (curr.type === "image") {
        nextTick(() => {
          scrollToBottom();
          [100, 300, 600].forEach((ms) => setTimeout(() => scrollToBottom(), ms));
        });
      }
    }
  }
);

onMounted(() => {
  document.addEventListener("click", onDocClick);
  updateContainerHeight();
  resizeObserver = new ResizeObserver(updateContainerHeight);
  if (listRoot.value) resizeObserver.observe(listRoot.value);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
  resizeObserver?.disconnect();
});

defineExpose({
  scrollToMessage,
  scrollToBottom
});
</script>

<style scoped>
.vim-message-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: var(--vim-bg-color);
}

.vim-message-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.vim-message-empty-text {
  font-size: 14px;
  color: var(--vim-muted-text-color);
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

.vim-virtual-inner {
  box-sizing: border-box;
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
