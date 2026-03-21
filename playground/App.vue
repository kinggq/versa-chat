<template>
  <div class="page">
    <div class="toolbar">
      <button type="button" @click="toggleMode">
        切换模式（当前：{{ config.mode }}）
      </button>
      <button type="button" @click="scrollToFirst">定位到首条消息</button>
    </div>
    <p class="hint">
      右键消息可打开菜单；带「引用」的气泡可点击跳转；输入区支持粘贴图片 / 拖拽文件。
    </p>
    <div class="panel">
      <VersatileIM
        ref="imRef"
        :list="sessions"
        :active-session-id="activeSessionId"
        :messages="messages"
        :config="config"
        :theme="theme"
        :message-type-map="customTypeMap"
        @send="onSend"
        @input-files="onInputFiles"
        @pull-history="onPullHistory"
        @menu-click="onMenuClick"
        @quote-locate="onQuoteLocate"
        @select-session="activeSessionId = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, reactive, ref } from "vue";
import {
  VersatileIM,
  type VIMConfig,
  type VIMInputFilesPayload,
  type VIMMessage,
  type VIMSessionItem
} from "../src";

const activeSessionId = ref("s-1");
const imRef = ref<InstanceType<typeof VersatileIM> | null>(null);

const sessions = ref<VIMSessionItem[]>([
  { id: "s-1", title: "产品群", subtitle: "今天发布 beta", unread: 2 },
  { id: "s-2", title: "客服小助手", subtitle: "您好，有什么可以帮您？" }
]);

const messages = ref<VIMMessage[]>([
  {
    id: "m-0",
    sender: "other",
    type: "text",
    content: "这是第一条，可被引用定位",
    timestamp: Date.now() - 900000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
  },
  {
    id: "m-1",
    sender: "other",
    type: "text",
    content: "欢迎使用 Vue Versatile IM",
    timestamp: Date.now() - 600000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
  },
  {
    id: "m-2",
    sender: "self",
    type: "text",
    content: "支持自定义消息类型吗？",
    timestamp: Date.now() - 500000,
    sending: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
  },
  {
    id: "m-3",
    sender: "other",
    type: "text",
    content: "这是一条带引用的回复",
    timestamp: Date.now() - 400000,
    quote: { id: "m-2", preview: "支持自定义消息类型吗？", sender: "self" },
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
  },
  {
    id: "m-4",
    sender: "other",
    type: "vote",
    content: { title: "今晚吃什么", options: ["火锅", "烧烤"] },
    timestamp: Date.now() - 100000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
  }
]);

const config = reactive<VIMConfig>({
  mode: "pc",
  showAvatar: true,
  enableRecall: true,
  enableMessageMenu: true
});

const theme = reactive({
  primaryColor: "#6b5cff",
  bubbleRightBg: "#e7e2ff",
  borderRadius: "8px"
});

const customTypeMap = {
  vote: defineComponent({
    props: ["content"],
    setup(props: { content: { title: string; options: string[] } }) {
      return () =>
        h("div", { class: "vote-card" }, [
          h("strong", props.content.title),
          h("ul", props.content.options.map((item) => h("li", item)))
        ]);
    }
  })
};

function onSend(text: string): void {
  messages.value.push({
    id: `m-${Date.now()}`,
    sender: "self",
    type: "text",
    content: text,
    timestamp: Date.now(),
    sending: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
  });
  const last = messages.value.at(-1);
  if (!last) {
    return;
  }
  window.setTimeout(() => {
    last.sending = false;
  }, 600);
}

function onInputFiles(payload: VIMInputFilesPayload): void {
  const imageFiles = payload.files.filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length) {
    const url = URL.createObjectURL(imageFiles[0]);
    messages.value.push({
      id: `img-${Date.now()}`,
      sender: "self",
      type: "image",
      content: url,
      timestamp: Date.now(),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
    });
    return;
  }
  const names = payload.files.map((f) => f.name).join(", ");
  messages.value.push({
    id: `file-${Date.now()}`,
    sender: "self",
    type: "text",
    content: `[${payload.source}] 收到文件：${names}`,
    timestamp: Date.now(),
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
  });
}

function onPullHistory(): void {
  messages.value.unshift({
    id: `h-${Date.now()}`,
    sender: "other",
    type: "text",
    content: "历史消息已加载（示例）",
    timestamp: Date.now() - 3600 * 1000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
  });
}

function onMenuClick(payload: { action: string; message: VIMMessage }): void {
  if (payload.action === "delete") {
    messages.value = messages.value.filter((m) => m.id !== payload.message.id);
  }
}

function onQuoteLocate(payload: { quotedId: string }): void {
  console.info("[quote-locate]", payload.quotedId);
}

function scrollToFirst(): void {
  imRef.value?.scrollToMessage("m-0");
}

function toggleMode(): void {
  config.mode = config.mode === "pc" ? "service" : "pc";
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f2f4f8;
  padding: 16px;
  box-sizing: border-box;
}

.toolbar {
  margin-bottom: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: #666;
}

.panel {
  width: min(980px, 100%);
  height: 640px;
}
</style>
