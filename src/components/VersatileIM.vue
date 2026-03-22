<template>
  <section ref="rootRef" class="vim-root" :class="[{ mobile: isMobile }, `mode-${mode}`]">
    <div v-if="showSessionList" class="vim-left-panel">
      <VimSidebarMenu
        v-if="sidebarItems.length || sidebarBottomItems.length"
        :items="sidebarItems"
        :bottom-items="sidebarBottomItems"
        :active-key="activeSidebarKey"
        @select="onSidebarSelect"
      >
        <template v-if="$slots['sidebar-item-icon']" #item-icon="slotProps">
          <slot name="sidebar-item-icon" v-bind="slotProps" />
        </template>
      </VimSidebarMenu>
      <div v-if="!showMainPaneSlot" class="vim-session-area">
        <slot
          v-if="$slots['sidebar-pane']"
          name="sidebar-pane"
          :active-sidebar-key="activeSidebarKey"
          :session-list-props="sessionListSlotProps"
        />
        <template v-else>
          <SessionList
            :list="list"
            :border="false"
            :active-id="activeSessionId"
            :sort-by-latest="resolvedConfig.sortSessionByLatest"
            :search-placeholder="sessionSearchPlaceholder"
            :search-query="sessionSearchQuery"
            :menu-items="resolvedConfig.sessionMenuItems"
            @select="$emit('select-session', $event)"
            @update:search-query="$emit('update:session-search-query', $event)"
            @session-menu-click="$emit('session-menu-click', $event)"
          >
            <template v-if="$slots['session-list-search']" #search="slotProps">
              <slot name="session-list-search" v-bind="slotProps" />
            </template>
          </SessionList>
        </template>
      </div>
    </div>

    <main class="chat-panel">
      <template v-if="showMainPaneSlot">
        <slot name="main-pane" :active-sidebar-key="activeSidebarKey" />
      </template>
      <template v-else>
        <header class="chat-header">
          <div class="chat-header-left" @click="onHeaderClick">
            <slot name="header">{{ activeSessionTitle || "会话" }}</slot>
          </div>
          <div class="chat-header-right" @click.stop>
            <slot name="header-actions" :session="activeSession" />
          </div>
        </header>

        <MessageList
        ref="messageListRef"
        :messages="messages"
        :empty-text="emptyText"
        @click-image="$emit('click-image', $event)"
        :show-avatar="resolvedConfig.showAvatar"
        :mobile="isMobile"
        :custom-message-types="messageTypeMap"
        :enable-recall="resolvedConfig.enableRecall"
        :enable-message-menu="resolvedConfig.enableMessageMenu"
        :menu-items="resolvedConfig.menuItems"
        :virtual-scroll-threshold="resolvedConfig.virtualScrollThreshold"
        :virtual-row-height="resolvedConfig.virtualRowHeight"
        @pull-history="$emit('pull-history')"
        @click-avatar="$emit('click-avatar', $event)"
        @menu-click="$emit('menu-click', $event)"
        @quote-locate="$emit('quote-locate', $event)"
      >
        <template #message-item="slotProps">
          <slot name="message-item" v-bind="slotProps" />
        </template>
        <template #empty>
          <slot name="empty">
            <span class="vim-message-empty-text">{{ emptyText }}</span>
          </slot>
        </template>
      </MessageList>

        <div v-if="typing" class="vim-typing-indicator">{{ typingText }}</div>
        <IMInput
          :show-image-button="resolvedConfig.showImageButton"
          :placeholder="resolvedConfig.inputPlaceholder"
          :model-value="draftValue"
          :replying-quote="replyingQuote"
          @update:model-value="onDraftInput"
          @send="$emit('send', $event)"
          @cancel-reply="$emit('update:replying-to', null)"
          @input-files="$emit('input-files', $event)"
        >
          <template #input-tools>
            <slot name="input-tools" />
          </template>
        </IMInput>
      </template>
    </main>

    <VimDialog
      v-model="headerDialogVisible"
      title="好友资料"
      :width="dialogSize.width"
      :height="dialogSize.height"
    >
      <slot name="header-dialog" :session="activeSession">
        <div v-if="activeSession" class="vim-dialog-default">
          <VimAvatar :src="activeSession.avatar" :size="64" :show-placeholder="!activeSession.avatar" />
          <p class="vim-dialog-name">{{ activeSession.title }}</p>
          <p v-if="activeSession.subtitle" class="vim-dialog-subtitle">{{ activeSession.subtitle }}</p>
        </div>
      </slot>
    </VimDialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, useSlots } from "vue";
import SessionList from "./SessionList.vue";
import MessageList from "./MessageList.vue";
import IMInput from "./IMInput.vue";
import VimSidebarMenu from "./VimSidebarMenu.vue";
import VimAvatar from "./VimAvatar.vue";
import VimDialog from "./VimDialog.vue";
import type {
  VIMConfig,
  VIMInputFilesPayload,
  VIMMessage,
  VIMMessageTypeMap,
  VIMQuoteRef,
  VIMSessionItem,
  VIMSidebarMenuItem,
  VIMTheme
} from "../types";

const props = withDefaults(
  defineProps<{
    list?: VIMSessionItem[];
    messages: VIMMessage[];
    activeSessionId?: string;
    theme?: VIMTheme;
    config?: VIMConfig;
    messageTypeMap?: VIMMessageTypeMap;
    /** Placeholder for session list search input */
    sessionSearchPlaceholder?: string;
    /** Search query for session list (use v-model:session-search-query for two-way binding) */
    sessionSearchQuery?: string;
    /** Active sidebar menu key (use v-model:active-sidebar-key for two-way binding) */
    activeSidebarKey?: string;
    /** Draft text for current session (use v-model:draft for two-way binding, enables per-session draft) */
    draft?: string;
    /** 引用回复时的被引用消息 (use v-model:replying-to) */
    replyingTo?: VIMMessage | null;
    /** Show "对方正在输入..." above input */
    typing?: boolean;
  }>(),
  {
    list: () => [],
    activeSessionId: "",
    theme: () => ({}),
    config: () => ({}),
    messageTypeMap: () => ({}),
    sessionSearchPlaceholder: "搜索",
    sessionSearchQuery: "",
    activeSidebarKey: "",
    typing: false
  }
);

const emptyText = computed(() => props.config?.emptyText ?? "暂无消息，发一条试试吧");

const typingText = computed(
  () => props.config?.typingText ?? "对方正在输入..."
);

const sessionSearchPlaceholder = computed(
  () => props.config?.sessionSearchPlaceholder ?? props.sessionSearchPlaceholder
);

const emit = defineEmits<{
  (event: "send", payload: import("../types").VIMSendPayload): void;
  (event: "pull-history"): void;
  (event: "click-avatar", message: VIMMessage): void;
  (event: "menu-click", payload: { action: string; message: VIMMessage }): void;
  (event: "quote-locate", payload: { quotedId: string; message?: VIMMessage }): void;
  (event: "input-files", payload: VIMInputFilesPayload): void;
  (event: "select-session", id: string): void;
  (event: "update:session-search-query", value: string): void;
  (event: "update:activeSidebarKey", value: string): void;
  (event: "session-menu-click", payload: { action: string; session: VIMSessionItem }): void;
  (event: "click-header", session: VIMSessionItem): void;
  (event: "click-image", payload: { url: string; message: VIMMessage }): void;
  (event: "update:draft", value: string): void;
  (event: "update:replying-to", value: VIMMessage | null): void;
}>();

const sidebarItems = computed(() => props.config?.sidebarMenuItems ?? []);
const sidebarBottomItems = computed(() => props.config?.sidebarMenuBottomItems ?? []);

const allSidebarKeys = computed(() => [
  ...sidebarItems.value.map((i: VIMSidebarMenuItem) => i.key),
  ...sidebarBottomItems.value.map((i: VIMSidebarMenuItem) => i.key)
]);

const activeSidebarKey = computed({
  get: () => {
    const fromProp = props.activeSidebarKey;
    if (fromProp && allSidebarKeys.value.includes(fromProp)) return fromProp;
    return sidebarItems.value[0]?.key ?? sidebarBottomItems.value[0]?.key ?? "";
  },
  set: (v: string) => emit("update:activeSidebarKey", v)
});

function onSidebarSelect(key: string): void {
  emit("update:activeSidebarKey", key);
}

const rootRef = ref<HTMLElement | null>(null);
const headerDialogVisible = ref(false);

const activeSession = computed(() =>
  props.list.find((item) => item.id === props.activeSessionId) ?? null
);

const dialogSize = computed(() => {
  const el = rootRef.value;
  const w = el?.clientWidth ?? (typeof window !== "undefined" ? window.innerWidth : 600);
  const h = el?.clientHeight ?? (typeof window !== "undefined" ? window.innerHeight : 400);
  return {
    width: Math.round(w * (2 / 3)),
    height: Math.round(h * (2 / 3))
  };
});

function onHeaderClick(): void {
  if (!showMainPaneSlot.value && activeSession.value) {
    headerDialogVisible.value = true;
    emit("click-header", activeSession.value);
  }
}

const messageListRef = ref<{
  scrollToMessage: (id: string) => void;
  scrollToBottom: () => void;
} | null>(null);

const resolvedConfig = computed(() => ({
  mode: props.config.mode ?? "pc",
  mainPaneKeys: props.config.mainPaneKeys ?? [],
  sessionMenuItems: props.config.sessionMenuItems,
  showImageButton: props.config.showImageButton ?? true,
  showAvatar: props.config.showAvatar ?? true,
  enableRecall: props.config.enableRecall ?? true,
  mobileBreakpoint: props.config.mobileBreakpoint ?? 768,
  enableMessageMenu: props.config.enableMessageMenu ?? true,
  menuItems: props.config.menuItems,
  sortSessionByLatest: props.config.sortSessionByLatest ?? true,
  virtualScrollThreshold: props.config.virtualScrollThreshold ?? 100,
  virtualRowHeight: props.config.virtualRowHeight ?? 88,
  inputPlaceholder: props.config.inputPlaceholder ?? "输入消息，Ctrl+Enter 发送；可粘贴图片或拖拽文件"
}));

const internalDraft = ref("");
const draftValue = computed(() =>
  props.draft !== undefined ? props.draft : internalDraft.value
);
function onDraftInput(v: string): void {
  if (props.draft !== undefined) {
    emit("update:draft", v);
  } else {
    internalDraft.value = v;
  }
}

const replyingQuote = computed((): VIMQuoteRef | null => {
  const msg = props.replyingTo;
  if (!msg) return null;
  const preview =
    msg.type === "text" && typeof msg.content === "string"
      ? msg.content
      : msg.type === "image"
        ? "[图片]"
        : "[消息]";
  return { id: msg.id, preview, sender: msg.sender };
});

const mode = computed(() => resolvedConfig.value.mode);

const viewport = reactive({
  width: typeof window === "undefined" ? 1200 : window.innerWidth
});

const isMobile = computed(() => viewport.width <= resolvedConfig.value.mobileBreakpoint);
const showSessionList = computed(() => mode.value === "pc" && !isMobile.value);

const activeSessionTitle = computed(() => {
  return props.list.find((item) => item.id === props.activeSessionId)?.title ?? "";
});

const slots = useSlots();
const showMainPaneSlot = computed(() => {
  if (!slots["main-pane"]) return false;
  const keys = resolvedConfig.value.mainPaneKeys;
  return keys.length > 0 && keys.includes(activeSidebarKey.value);
});

const sessionListSlotProps = computed(() => ({
  list: props.list,
  activeId: props.activeSessionId,
  sortByLatest: resolvedConfig.value.sortSessionByLatest,
  searchPlaceholder: sessionSearchPlaceholder.value,
  searchQuery: props.sessionSearchQuery,
  menuItems: resolvedConfig.value.sessionMenuItems,
  onSelect: (id: string) => emit("select-session", id),
  onUpdateSearchQuery: (v: string) => emit("update:session-search-query", v),
  onSessionMenuClick: (payload: { action: string; session: VIMSessionItem }) =>
    emit("session-menu-click", payload)
}));

const cssVarMap = computed<Record<string, string | undefined>>(() => ({
  "--vim-primary-color": props.theme.primaryColor,
  "--vim-bg-color": props.theme.bgColor,
  "--vim-bubble-left-bg": props.theme.bubbleLeftBg,
  "--vim-bubble-right-bg": props.theme.bubbleRightBg,
  "--vim-font-size": props.theme.fontSize,
  "--vim-border-radius": props.theme.borderRadius
}));

function applyThemeVars(): void {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  Object.entries(cssVarMap.value).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(key, value);
    }
  });
}

function onResize(): void {
  viewport.width = window.innerWidth;
}

onMounted(() => {
  applyThemeVars();
  window.addEventListener("resize", onResize);
});

watch(
  () => props.theme,
  () => {
    applyThemeVars();
  },
  { deep: true }
);

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

defineExpose({
  scrollToMessage: (id: string) => messageListRef.value?.scrollToMessage(id),
  scrollToBottom: () => messageListRef.value?.scrollToBottom()
});
</script>

<style scoped>
.vim-root {
  width: 100%;
  height: 100%;
  min-height: 420px;
  display: flex;
  background: #fff;
  border: 1px solid var(--vim-border-color);
  font-size: var(--vim-font-size);
}

.vim-left-panel {
  display: flex;
  flex-shrink: 0;
}

.vim-session-area {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--vim-border-color);
}

.chat-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 52px;
  border-bottom: 1px solid var(--vim-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font-size: 15px;
  font-weight: 600;
  background: #fff;
  user-select: none;
}

.chat-header-left {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.chat-header-left:hover {
  color: var(--vim-primary-color);
}

.chat-header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.vim-typing-indicator {
  padding: 6px 14px;
  font-size: 12px;
  color: var(--vim-muted-text-color);
  background: #fafafa;
  border-top: 1px solid var(--vim-border-color);
}

.vim-dialog-default {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.vim-dialog-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.vim-dialog-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--vim-muted-text-color);
}

.vim-message-empty-text {
  font-size: 14px;
  color: var(--vim-muted-text-color);
}

.vim-root.mode-service .chat-header {
  background: var(--vim-bg-color);
}

.vim-root.mobile {
  border-radius: 0;
}
</style>
