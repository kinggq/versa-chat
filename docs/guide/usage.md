# Usage Guide | 使用指南

## 会话切换

点击好友列表时，右侧应显示该会话的聊天内容。父组件需维护「各会话的消息列表」，并根据 `activeSessionId` 切换 `messages`：

```ts
const activeSessionId = ref("s-1");
const messagesBySession = ref<Record<string, VIMMessage[]>>({
  "s-1": [/* 产品群消息 */],
  "s-2": [/* 客服小助手消息 */],
  "s-3": [/* 技术讨论组消息 */]
});

const currentMessages = computed(() => messagesBySession.value[activeSessionId.value] ?? []);

function onSelectSession(id: string) {
  activeSessionId.value = id;
  // 清零未读等
}

function onSend(payload: VIMSendPayload) {
  const list = messagesBySession.value[activeSessionId.value] ?? [];
  messagesBySession.value[activeSessionId.value] = list;
  list.push({
    id: `m-${Date.now()}`,
    sender: "self",
    type: "text",
    content: payload.text,
    quote: payload.quote,
    ...
  });
}
```

## 消息发送失败

- 发送失败时设置 `message.failed = true`
- 右键菜单出现「重新发送」
- `@menu-click` 收到 `action: "retry"` 时由业务侧重发

```ts
function onMenuClick({ action, message }) {
  if (action === "retry") {
    message.failed = false;
    message.sending = true;
    // 调用业务接口重发，成功后设置 sending: false
  }
}
```

## 图片预览

点击图片消息触发 `@click-image`，父组件可展示预览弹窗：

```vue
<VimDialog v-model="previewVisible" title="图片预览">
  <img :src="previewUrl" />
</VimDialog>
```

## 对方正在输入

通过 WebSocket 等收到对方输入状态时，设置 `typing` 为 `true`：

```vue
<VersatileIM :typing="typing" ... />
```

## 草稿与引用回复

按会话保存草稿，使用 `draft` 与 `@update:draft`：

```ts
const draftBySession = reactive<Record<string, string>>({});

<VersatileIM
  :draft="draftBySession[activeSessionId] ?? ''"
  @update:draft="(v) => (draftBySession[activeSessionId] = v)"
  v-model:replying-to="replyingTo"
  @send="onSend"
  @menu-click="onMenuClick"
/>
```

引用回复：右键消息选择「引用回复」，`@menu-click` 收到 `action: "quote"` 时设置 `replyingTo = message`；发送时 `payload.quote` 含引用信息。

## 送达状态与置顶

```ts
// 发送成功后由服务端回执更新 deliveryStatus
updateMessageInList(list, id, { sending: false, deliveryStatus: "sent" });
// 可选：再更新为 delivered / read

// 会话置顶
session.pinned = true;
```

转发：右键消息「转发」→ `@menu-click` 中 `action === "forward"`。
