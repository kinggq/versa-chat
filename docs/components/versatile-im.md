# VersatileIM

Main container component. Integrates session list, message list, and input. Supports `pc` (dual-panel) and `service` (single-panel) modes.

主容器组件，整合会话列表、消息列表、输入框。支持 pc（双栏）和 service（单栏）两种模式。

## Demo

<script setup>
import DemoVersatileIM from './demo/DemoVersatileIM.vue'
</script>

<div class="vp-raw">
  <DemoVersatileIM />
</div>

## Props

| Prop | Type | Default | Description | 说明 |
|------|------|---------|--------------|------|
| `list` | `VIMSessionItem[]` | `[]` | Session/contact list | 会话/联系人列表 |
| `messages` | `VIMMessage[]` | required | Current session messages | 当前会话消息列表 |
| `activeSessionId` | `string` | `""` | Active session ID | 当前选中会话 ID |
| `theme` | `VIMTheme` | `{}` | Theme overrides | 主题覆盖 |
| `config` | `VIMConfig` | `{}` | mode, showAvatar, enableRecall, sidebarMenuItems, sidebarMenuBottomItems, inputPlaceholder, etc. | 配置项 |
| `messageTypeMap` | `VIMMessageTypeMap` | `{}` | Custom message type components | 自定义消息类型映射 |
| `sessionSearchPlaceholder` | `string` | `"搜索"` | Session list search placeholder | 会话列表搜索框占位符 |
| `sessionSearchQuery` | `string` | `""` | Session list search query (use `v-model:session-search-query`) | 会话列表搜索关键词 |
| `activeSidebarKey` | `string` | `""` | Active sidebar menu key (use `v-model:active-sidebar-key`) | 当前选中的侧边栏菜单 |
| `typing` | `boolean` | `false` | Show "对方正在输入..." above input | 对方输入中 |
| `draft` | `string` | - | Input draft (use `v-model:draft` for per-session draft) | 输入草稿，可配合 v-model:draft 按会话保存 |
| `replyingTo` | `VIMMessage \| null` | - | Reply target (use `v-model:replying-to`) | 引用回复目标消息 |

## Config (Sidebar & Input)

| Field | Type | Description | 说明 |
|-------|------|--------------|------|
| `sidebarMenuItems` | `VIMSidebarMenuItem[]` | Top menu (chats/contacts/me) | 左侧边栏顶部菜单 |
| `sidebarMenuBottomItems` | `VIMSidebarMenuItem[]` | Bottom menu (e.g. settings) | 左侧边栏底部菜单（设置等） |
| `mainPaneKeys` | `string[]` | `[]` | Menu keys that show main-pane slot (e.g. `["me"]`) | 使用 main-pane 插槽的菜单 |
| `inputPlaceholder` | `string` | - | Input placeholder | 输入框占位文案 |

`VIMSidebarMenuItem`: `{ key, label, icon?, badge? }`

## 左侧菜单与内容对应 | Sidebar → Content

| 菜单 | 左侧列表 | 右侧 |
|-----|----------|------|
| 最近 | `list`（会话，按 lastMessageTime 排序） | 聊天 |
| 联系人 | `list`（通讯录，由父组件传入不同数据） | 聊天 |
| 我 | 隐藏 | main-pane 插槽 |

父组件可通过 `activeSidebarKey` 动态切换 `list` 数据，实现「最近」与「联系人」展示不同列表。

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `send` | `VIMSendPayload` | Send text (`{ text, quote? }`). `quote` for reply | 发送文本，支持引用回复 |
| `pull-history` | - | Load history on scroll top | 加载历史 |
| `click-avatar` | `message` | Avatar clicked | 点击头像 |
| `menu-click` | `{ action, message }` | Context menu | 右键菜单 |
| `quote-locate` | `{ quotedId, message? }` | Quote bar clicked | 引用定位 |
| `input-files` | `{ files, source }` | Paste or drop files | 粘贴/拖拽文件 |
| `select-session` | `id: string` | Switch session | 切换会话 |
| `update:session-search-query` | `value: string` | Search query changed | 搜索关键词变化 |
| `update:active-sidebar-key` | `value: string` | Sidebar menu selected | 侧边栏菜单切换 |
| `session-menu-click` | `{ action, session }` | Session list menu clicked | 好友列表菜单点击 |
| `click-header` | `session: VIMSessionItem` | Chat header (friend name) clicked | 点击聊天头部好友名称 |
| `click-image` | `{ url, message }` | Image message clicked (for preview) | 点击图片 |
| `update:draft` | `value: string` | Draft changed (when using v-model:draft) | 草稿变化 |
| `update:replying-to` | `value: VIMMessage \| null` | Reply target cleared | 取消引用回复 |

## Config (sessionMenuItems)

| Field | Type | Description | 说明 |
|-------|------|--------------|------|
| `sessionMenuItems` | `VIMSessionMenuItem[]` | 置顶/免打扰/删除等，不传则用默认 | 好友列表项菜单 |

## Slots

| Slot | Scope | Description | 说明 |
|------|-------|--------------|------|
| `header` | - | Chat area title | 聊天区域标题 |
| `header-actions` | `{ session }` | Right-side buttons (video/voice, etc.) | 头部右侧操作按钮（视频、语音等） |
| `message-item` | `{ message }` | Custom message render | 自定义消息渲染 |
| `input-tools` | - | Toolbar above input | 输入框上方工具栏 |
| `session-list-search` | `{ searchQuery, placeholder, onUpdate }` | Custom session list search UI | 自定义会话列表顶部搜索栏 |
| `sidebar-item-icon` | `{ item, active }` | Custom sidebar menu icon | 自定义侧边栏菜单图标 |
| `sidebar-pane` | `{ activeSidebarKey, sessionListProps }` | Custom left pane (e.g. contact list) | 自定义左侧内容区 |
| `main-pane` | `{ activeSidebarKey }` | Custom right pane when `activeSidebarKey` in `mainPaneKeys` (e.g. profile for "me") | 右侧自定义内容（如「我」页面），需配置 `mainPaneKeys` |
| `header-dialog` | `{ session }` | Dialog content when clicking header. Default: avatar + name + subtitle | 点击头部后弹出的 Dialog 内容 |
| `empty` | - | Empty state when no messages | 无消息时占位 |

## 会话切换 | Session Switching

点击好友列表时，父组件需根据 `activeSessionId` 切换 `messages`，保证右侧显示对应会话的聊天内容：

```ts
const messagesBySession = ref<Record<string, VIMMessage[]>>({});
const currentMessages = computed(() => messagesBySession.value[activeSessionId.value] ?? []);
```

## 消息发送失败 | Failed Messages

- 消息 `failed: true` 时显示失败状态
- 右键菜单出现「重新发送」，`@menu-click` 收到 `action: "retry"` 时由业务侧重发

## 引用回复 | Reply / Quote

- 右键消息菜单有「引用回复」
- 选中后输入区上方出现引用预览栏，可点击 × 取消
- `send` 事件 payload 为 `{ text, quote? }`，创建消息时传入 `quote: { id, preview, sender }`

## 草稿 | Draft

- 使用 `v-model:draft` 可实现按会话保存草稿
- 父组件维护 `draftBySession: Record<string, string>`，切换会话时自动切换草稿
