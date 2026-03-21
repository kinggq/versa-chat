<template>
  <section class="vim-root" :class="[{ mobile: isMobile }, `mode-${mode}`]">
    <SessionList
      v-if="showSessionList"
      :list="list"
      :active-id="activeSessionId"
      @select="$emit('select-session', $event)"
    />

    <main class="chat-panel">
      <header class="chat-header">
        <slot name="header">{{ activeSessionTitle || "会话" }}</slot>
      </header>

      <MessageList
        ref="messageListRef"
        :messages="messages"
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
      </MessageList>

      <IMInput @send="$emit('send', $event)" @input-files="$emit('input-files', $event)">
        <template #input-tools>
          <slot name="input-tools" />
        </template>
      </IMInput>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import SessionList from "./SessionList.vue";
import MessageList from "./MessageList.vue";
import IMInput from "./IMInput.vue";
import type {
  VIMConfig,
  VIMInputFilesPayload,
  VIMMessage,
  VIMMessageTypeMap,
  VIMSessionItem,
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
  }>(),
  {
    list: () => [],
    activeSessionId: "",
    theme: () => ({}),
    config: () => ({}),
    messageTypeMap: () => ({})
  }
);

defineEmits<{
  (event: "send", text: string): void;
  (event: "pull-history"): void;
  (event: "click-avatar", message: VIMMessage): void;
  (event: "menu-click", payload: { action: string; message: VIMMessage }): void;
  (event: "quote-locate", payload: { quotedId: string; message?: VIMMessage }): void;
  (event: "input-files", payload: VIMInputFilesPayload): void;
  (event: "select-session", id: string): void;
}>();

const messageListRef = ref<{
  scrollToMessage: (id: string) => void;
} | null>(null);

const resolvedConfig = computed(() => ({
  mode: props.config.mode ?? "pc",
  showAvatar: props.config.showAvatar ?? true,
  enableRecall: props.config.enableRecall ?? true,
  mobileBreakpoint: props.config.mobileBreakpoint ?? 768,
  enableMessageMenu: props.config.enableMessageMenu ?? true,
  menuItems: props.config.menuItems,
  virtualScrollThreshold: props.config.virtualScrollThreshold ?? 100,
  virtualRowHeight: props.config.virtualRowHeight ?? 88
}));

const mode = computed(() => resolvedConfig.value.mode);

const viewport = reactive({
  width: typeof window === "undefined" ? 1200 : window.innerWidth
});

const isMobile = computed(() => viewport.width <= resolvedConfig.value.mobileBreakpoint);
const showSessionList = computed(() => mode.value === "pc" && !isMobile.value);

const activeSessionTitle = computed(() => {
  return props.list.find((item) => item.id === props.activeSessionId)?.title ?? "";
});

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
  scrollToMessage: (id: string) => messageListRef.value?.scrollToMessage(id)
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
  padding: 0 14px;
  font-size: 15px;
  font-weight: 600;
  background: #fff;
}

.vim-root.mode-service .chat-header {
  background: var(--vim-bg-color);
}

.vim-root.mobile {
  border-radius: 0;
}
</style>
