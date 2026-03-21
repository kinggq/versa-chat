<template>
  <div class="page">
    <div class="toolbar">
      <button type="button" @click="toggleMode">
        切换模式（当前：{{ config.mode }}）
      </button>
      <button type="button" @click="scrollToFirst">定位到首条消息</button>
      <button type="button" @click="simulateIncoming">模拟 s-2 收到新消息</button>
      <button type="button" @click="typing = !typing">
        {{ typing ? "取消输入中" : "模拟对方输入中" }}
      </button>
      <button type="button" @click="simulateFailNext = !simulateFailNext">
        {{ simulateFailNext ? "取消模拟失败" : "下次发送模拟失败" }}
      </button>
    </div>
    <p class="hint">
      点击好友切换会话；右键消息可打开菜单（含引用回复、重新发送）；带「引用」的气泡可点击跳转；输入区支持粘贴图片 / 拖拽文件；草稿按会话保存；点击图片可预览；头部右侧可添加视频/语音按钮。
    </p>
    <div class="panel">
      <VersatileIM
        ref="imRef"
        :list="displayList"
        :typing="typing"
        v-model:session-search-query="sessionSearchQuery"
        v-model:active-sidebar-key="activeSidebarKey"
        :active-session-id="activeSessionId"
        :messages="currentMessages"
        :config="config"
        :theme="theme"
        :message-type-map="customTypeMap"
        @send="onSend"
        @input-files="onInputFiles"
        @pull-history="onPullHistory"
        @menu-click="onMenuClick"
        @quote-locate="onQuoteLocate"
        @select-session="onSelectSession"
        @session-menu-click="onSessionMenuClick"
        @click-image="onClickImage"
        :draft="draftBySession[activeSessionId] ?? ''"
        @update:draft="(v) => (draftBySession[activeSessionId] = v)"
        v-model:replying-to="replyingTo"
      >
        <template #header-actions="{ session }">
          <button type="button" class="header-action-btn" title="语音通话" @click="() => alert('语音')">
            📞
          </button>
          <button type="button" class="header-action-btn" title="视频通话" @click="() => alert('视频')">
            📹
          </button>
        </template>
        <template #main-pane>
          <div class="profile-pane">
            <h3>我</h3>
            <p>个人资料页（点击「最近」或「联系人」返回）</p>
          </div>
        </template>
      </VersatileIM>
      <VimDialog v-model="imagePreviewVisible" title="图片预览" :width="600" :height="400" :show-close="true">
        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="预览" class="preview-img" />
      </VimDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, reactive, ref } from "vue";
import {
  VersatileIM,
  VimDialog,
  type VIMConfig,
  type VIMInputFilesPayload,
  type VIMSendPayload,
  type VIMMessage,
  type VIMSessionItem
} from "../src";

const activeSessionId = ref("s-1");
const sessionSearchQuery = ref("");
const activeSidebarKey = ref("chats");
const draftBySession = reactive<Record<string, string>>({});
const replyingTo = ref<VIMMessage | null>(null);
const typing = ref(false);
const simulateFailNext = ref(false);
const imagePreviewUrl = ref("");
const imagePreviewVisible = ref(false);

function onClickImage(payload: { url: string }): void {
  imagePreviewUrl.value = payload.url;
  imagePreviewVisible.value = true;
}
const imRef = ref<InstanceType<typeof VersatileIM> | null>(null);

const sessions = ref<VIMSessionItem[]>([
  {
    id: "s-1",
    title: "产品群",
    subtitle: "今天发布 beta",
    unread: 2,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    lastMessageTime: Date.now() - 100000
  },
  {
    id: "s-2",
    title: "客服小助手",
    subtitle: "您好，有什么可以帮您？",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    lastMessageTime: Date.now() - 200000
  },
  {
    id: "s-3",
    title: "技术讨论组",
    subtitle: "关于虚拟滚动的实现",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    lastMessageTime: Date.now() - 300000
  }
]);

/** 联系人列表（通讯录），可与会话列表不同 */
const contacts = ref<VIMSessionItem[]>([
  { id: "c-1", title: "新的朋友", subtitle: "添加新联系人", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=new", lastMessageTime: Date.now() - 3600000 },
  { id: "c-2", title: "群聊", subtitle: "群组列表", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=group", lastMessageTime: Date.now() - 86400000 * 2 },
  { id: "c-3", title: "标签", subtitle: "联系人分组", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tag", lastMessageTime: Date.now() - 86400000 * 5 },
  { id: "s-1", title: "产品群", subtitle: "今天发布 beta", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", lastMessageTime: Date.now() - 100000 },
  { id: "s-2", title: "客服小助手", subtitle: "在线", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2", lastMessageTime: Date.now() - 200000 },
  { id: "s-3", title: "技术讨论组", subtitle: "关于虚拟滚动的实现", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3", lastMessageTime: Date.now() - 300000 }
]);

/** 根据当前菜单显示不同列表：最近=会话，联系人=通讯录 */
const displayList = computed(() =>
  activeSidebarKey.value === "contacts" ? contacts.value : sessions.value
);

/** 各会话的消息列表，key 为 sessionId */
const messagesBySession = ref<Record<string, VIMMessage[]>>({
  "s-1": [
    { id: "m-0", sender: "other", type: "text", content: "这是第一条，可被引用定位", timestamp: Date.now() - 900000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
    { id: "m-1", sender: "other", type: "text", content: "欢迎使用 Vue Versatile IM", timestamp: Date.now() - 600000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
    { id: "m-2", sender: "self", type: "text", content: "支持自定义消息类型吗？", timestamp: Date.now() - 500000, sending: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
    { id: "m-3", sender: "other", type: "text", content: "这是一条带引用的回复", timestamp: Date.now() - 400000, quote: { id: "m-2", preview: "支持自定义消息类型吗？", sender: "self" }, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
    { id: "m-4", sender: "other", type: "vote", content: { title: "今晚吃什么", options: ["火锅", "烧烤"] }, timestamp: Date.now() - 100000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" }
  ],
  "s-2": [
    { id: "s2-1", sender: "other", type: "text", content: "您好，有什么可以帮您？", timestamp: Date.now() - 300000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
    { id: "s2-2", sender: "self", type: "text", content: "我想咨询一下", timestamp: Date.now() - 200000, sending: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" }
  ],
  "s-3": [
    { id: "s3-1", sender: "other", type: "text", content: "关于虚拟滚动的实现，大家有什么建议？", timestamp: Date.now() - 400000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" }
  ]
});

const currentMessages = computed(() => messagesBySession.value[activeSessionId.value] ?? []);

const config = reactive<VIMConfig>({
  mode: "pc",
  showAvatar: true,
  enableRecall: true,
  enableMessageMenu: true,
  sidebarMenuItems: [
    { key: "chats", label: "最近", badge: 2 },
    { key: "contacts", label: "联系人" },
    { key: "me", label: "我" }
  ],
  sidebarMenuBottomItems: [{ key: "settings", label: "设置" }],
  mainPaneKeys: ["me"]
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

function getMessages(): VIMMessage[] {
  let list = messagesBySession.value[activeSessionId.value];
  if (!list) {
    list = [];
    messagesBySession.value[activeSessionId.value] = list;
  }
  return list;
}

function updateActiveSessionPreview(text: string): void {
  const s = sessions.value.find((x) => x.id === activeSessionId.value);
  if (s) {
    s.subtitle = text;
    s.lastMessageTime = Date.now();
  }
}

function onSelectSession(id: string): void {
  activeSessionId.value = id;
  const s = sessions.value.find((x) => x.id === id);
  if (s) s.unread = 0;
  nextTick(() => imRef.value?.scrollToBottom());
}

function updateMessageInList(list: VIMMessage[], id: string, updates: Partial<VIMMessage>): void {
  const idx = list.findIndex((m) => m.id === id);
  if (idx >= 0) {
    list.splice(idx, 1, { ...list[idx], ...updates });
  }
}

function onSend(payload: VIMSendPayload): void {
  const list = getMessages();
  const id = `m-${Date.now()}`;
  const msg: VIMMessage = {
    id,
    sender: "self",
    type: "text",
    content: payload.text,
    timestamp: Date.now(),
    sending: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    quote: payload.quote
  };
  list.push(msg);
  const preview = typeof msg.content === "string" ? msg.content : "[消息]";
  updateActiveSessionPreview(preview);
  replyingTo.value = null;
  window.setTimeout(() => {
    updateMessageInList(list, id, {
      sending: false,
      failed: simulateFailNext.value ? true : undefined
    });
    if (simulateFailNext.value) simulateFailNext.value = false;
  }, 600);
}

function onInputFiles(payload: VIMInputFilesPayload): void {
  const list = getMessages();
  const imageFiles = payload.files.filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length) {
    const url = URL.createObjectURL(imageFiles[0]);
    const id = `img-${Date.now()}`;
    const msg: VIMMessage = {
      id,
      sender: "self",
      type: "image",
      content: url,
      timestamp: Date.now(),
      sending: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
    };
    list.push(msg);
    updateActiveSessionPreview("[图片]");
    window.setTimeout(() => {
      updateMessageInList(list, id, {
        sending: false,
        failed: simulateFailNext.value ? true : undefined
      });
      if (simulateFailNext.value) simulateFailNext.value = false;
    }, 600);
    return;
  }
  const names = payload.files.map((f) => f.name).join(", ");
  list.push({
    id: `file-${Date.now()}`,
    sender: "self",
    type: "text",
    content: `[${payload.source}] 收到文件：${names}`,
    timestamp: Date.now(),
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
  });
  updateActiveSessionPreview(`[文件] ${names}`);
}

function onPullHistory(): void {
  const list = getMessages();
  list.unshift({
    id: `h-${Date.now()}`,
    sender: "other",
    type: "text",
    content: "历史消息已加载（示例）",
    timestamp: Date.now() - 3600 * 1000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
  });
}

function onMenuClick(payload: { action: string; message: VIMMessage }): void {
  const list = getMessages();
  if (payload.action === "quote") {
    replyingTo.value = payload.message;
    return;
  }
  if (payload.action === "delete") {
    const idx = list.findIndex((m) => m.id === payload.message.id);
    if (idx >= 0) list.splice(idx, 1);
  } else if (payload.action === "retry") {
    updateMessageInList(list, payload.message.id, { failed: false, sending: true });
    window.setTimeout(() => {
      updateMessageInList(list, payload.message.id, { sending: false });
    }, 600);
  }
}

function onQuoteLocate(payload: { quotedId: string }): void {
  console.info("[quote-locate]", payload.quotedId);
}

function onSessionMenuClick(payload: { action: string; session: VIMSessionItem }): void {
  console.info("[session-menu-click]", payload);
  if (payload.action === "delete") {
    sessions.value = sessions.value.filter((s) => s.id !== payload.session.id);
    if (activeSessionId.value === payload.session.id) {
      activeSessionId.value = sessions.value[0]?.id ?? "";
    }
  }
}

function scrollToFirst(): void {
  const first = currentMessages.value[0];
  if (first) imRef.value?.scrollToMessage(first.id);
}

function toggleMode(): void {
  config.mode = config.mode === "pc" ? "service" : "pc";
}

function simulateIncoming(): void {
  const s = sessions.value.find((x) => x.id === "s-2");
  if (s) {
    const list = messagesBySession.value["s-2"] ?? [];
    messagesBySession.value["s-2"] = list;
    list.push({
      id: `inc-${Date.now()}`,
      sender: "other",
      type: "text",
      content: "刚收到的新消息（示例）",
      timestamp: Date.now(),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
    });
    s.subtitle = "刚收到的新消息（示例）";
    s.lastMessageTime = Date.now();
    s.unread = (s.unread ?? 0) + 1;
  }
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

.profile-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #fafafa;
}

.profile-pane h3 {
  margin: 0 0 12px;
  font-size: 20px;
}

.profile-pane p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.preview-img {
  max-width: 100%;
  max-height: 360px;
  display: block;
  margin: 0 auto;
}

.header-action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
}

.header-action-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}
</style>
