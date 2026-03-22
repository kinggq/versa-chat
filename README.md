# VersaChat (Vue Versatile IM)

A lightweight, zero-dependency, highly customizable Vue 3 IM UI component library. Supports PC dual-panel mode and Service single-panel mode.

轻量级、零依赖、高度可定制的 Vue3 IM UI 组件库。支持 PC 双栏模式与 Service 单栏客服模式。

## Installation | 安装

```bash
npm install vue-versatile-im
```

## Usage | 使用

```ts
import { VersatileIM } from "vue-versatile-im";
import "vue-versatile-im/style.css";
```

```vue
<VersatileIM
  :list="sessions"
  :messages="messages"
  :active-session-id="activeId"
  :config="config"
  :theme="theme"
  :draft="draftBySession[activeId] ?? ''"
  @update:draft="(v) => (draftBySession[activeId] = v)"
  v-model:replying-to="replyingTo"
  @send="onSend"
  @pull-history="onPullHistory"
  @menu-click="onMenuClick"
  @quote-locate="onQuoteLocate"
  @input-files="onInputFiles"
  @select-session="onSelectSession"
>
  <template #header-actions>
    <button @click="startVoice">📞</button>
    <button @click="startVideo">📹</button>
  </template>
</VersatileIM>
```

## Props

| Prop | Type | Default | Description | 说明 |
|------|------|---------|--------------|------|
| `list` | `VIMSessionItem[]` | `[]` | Session/contact list | 会话/联系人列表 |
| `messages` | `VIMMessage[]` | required | Current session messages（随 activeSessionId 切换） | 当前会话消息 |
| `activeSessionId` | `string` | `""` | Active session ID | 当前选中会话 ID |
| `typing` | `boolean` | `false` | Show typing indicator (text from `config.typingText`) | 对方输入中 |
| `theme` | `VIMTheme` | `{}` | Theme overrides | 主题覆盖 |
| `config` | `VIMConfig` | `{}` | mode, showAvatar, sortSessionByLatest, sidebarMenuItems, sidebarMenuBottomItems, inputPlaceholder, etc. | 配置项 |
| `messageTypeMap` | `VIMMessageTypeMap` | `{}` | Custom message type components | 自定义消息类型映射 |
| `draft` | `string` | - | Input draft (use `v-model:draft` for per-session draft) | 输入草稿，可配合 v-model:draft 实现按会话保存 |
| `replyingTo` | `VIMMessage \| null` | - | Reply target (use `v-model:replying-to`) | 引用回复目标消息 |

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `send` | `VIMSendPayload` | Send text message (payload: `{ text, quote? }`) | 发送文本，支持引用回复 |
| `pull-history` | - | Load history on scroll top | 加载历史 |
| `click-avatar` | `message` | Avatar clicked | 点击头像 |
| `menu-click` | `{ action, message }` | Context menu: `copy`, `quote`, `forward`, `recall`, `retry`, `delete` | 右键菜单 |
| `quote-locate` | `{ quotedId, message? }` | Quote bar clicked | 引用定位 |
| `input-files` | `{ files, source }` | Paste or drop files | 粘贴/拖拽文件 |
| `select-session` | `id: string` | Switch session | 切换会话 |
| `click-image` | `{ url, message }` | Image message clicked | 点击图片 |
| `session-menu-click` | `{ action, session }` | Session menu: `pin`, `mute`, `delete` (default keys) | 好友列表菜单 |
| `click-header` | `session` | Chat header clicked | 点击头部好友名 |

## Slots

| Slot | Scope | Description | 说明 |
|------|-------|--------------|------|
| `header` | - | Chat area title | 聊天区域标题 |
| `header-actions` | `{ session }` | Right-side buttons (video/voice, etc.) | 头部右侧操作按钮（视频、语音等） |
| `message-item` | `{ message }` | Custom message render | 自定义消息渲染 |
| `input-tools` | - | Toolbar above input | 输入框上方工具栏 |
| `empty` | - | Empty state when no messages | 无消息时占位 |
| `header-dialog` | `{ session }` | Dialog when clicking header | 点击头部弹窗内容 |
| `main-pane` | `{ activeSidebarKey }` | Right pane when sidebar in mainPaneKeys (e.g. "me") | 选中「我」等菜单时右侧自定义内容 |

## 会话切换 | Session Switching

点击好友列表时，父组件需根据 `activeSessionId` 切换 `messages`：

```ts
const messagesBySession = ref<Record<string, VIMMessage[]>>({});
const currentMessages = computed(() => messagesBySession.value[activeSessionId.value] ?? []);

<VersatileIM :messages="currentMessages" :active-session-id="activeSessionId" @select-session="onSelectSession />
```

## 消息发送失败 | Failed Messages

- 消息的 `failed: true` 时显示失败状态
- 右键菜单出现「重新发送」，`@menu-click` 收到 `action: "retry"` 时由业务侧重发

## 配置项 | Config

| Field | Type | Description | 说明 |
|-------|------|--------------|------|
| `sidebarMenuItems` | `VIMSidebarMenuItem[]` | 顶部菜单（最近、联系人、我） | 左侧边栏顶部菜单 |
| `sidebarMenuBottomItems` | `VIMSidebarMenuItem[]` | 底部菜单（设置等） | 左侧边栏底部菜单 |
| `mainPaneKeys` | `string[]` | 如 `["me"]`，选中时显示 main-pane 插槽 | 使用右侧自定义内容的菜单 |
| `inputPlaceholder` | `string` | 输入框 placeholder | 输入框占位文案 |
| `typingText` | `string` | Custom typing indicator text (when `typing` is true) | 「对方正在输入」提示文案 |

## `VIMMessage` / `VIMSessionItem`

| Field | Type | Description | 说明 |
|-------|------|-------------|------|
| `deliveryStatus` | `'sent' \| 'delivered' \| 'read'` | Self messages only; shown under bubble when send succeeded | 己方消息送达/已读（业务层在发送成功后更新） |
| `pinned` | `boolean` | Session pinned to top (still sorted by `lastMessageTime` within pinned group) | 会话置顶，列表最前 |

## Theme Variables (vars.css)

Override in `:root` to customize:

```css
:root {
  --vim-primary-color: #07c160;
  --vim-bg-color: #f5f5f5;
  --vim-bubble-left-bg: #ffffff;
  --vim-bubble-right-bg: #95ec69;
  --vim-font-size: 14px;
  --vim-border-radius: 4px;
  --vim-delivery-sent: #8b8b8b;
  --vim-delivery-read: #34b7f1;
}
```

## Development | 开发

```bash
npm run dev          # Dev preview (playground) | 开发预览
npm run docs:dev     # Docs (VitePress) | 文档
npm run docs:build   # Build docs | 构建文档
npm run build        # Build library | 构建库
npm run test         # Unit tests | 单元测试
```

## Documentation | 文档

Run `npm run docs:dev` to start VitePress docs at http://localhost:5173.

运行 `npm run docs:dev` 启动 VitePress 文档。

## NPM publish | 发布

**0.x**：API 可能调整，建议在业务中锁定 minor 版本。

发布前请：

1. 将 `package.json` 中的 `repository` / `homepage` / `bugs` 里的 `versa-chat` 换成真实 Git 仓库，并同步修改 `CHANGELOG.md` 底部链接。
2. 执行 `npm run build && npm test`，再用 `npm pack --dry-run` 检查打包包内容。
3. 登录 NPM：`npm login`，然后 `npm publish`（非 scope 包默认 public）。

样式也可写为 `import "vue-versatile-im/dist/style.css"`（与 `style.css` 子路径等价）。

### Exports

- 主入口：`import { VersatileIM, VimDialog, sortSessionItems, … } from "vue-versatile-im"`
- 样式：`import "vue-versatile-im/style.css"`
