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
import "vue-versatile-im/dist/style.css";
```

```vue
<VersatileIM
  :list="sessions"
  :messages="messages"
  :active-session-id="activeId"
  :config="config"
  :theme="theme"
  @send="onSend"
  @pull-history="onPullHistory"
  @menu-click="onMenuClick"
  @quote-locate="onQuoteLocate"
  @input-files="onInputFiles"
  @select-session="onSelectSession"
/>
```

## Props

| Prop | Type | Default | Description | 说明 |
|------|------|---------|--------------|------|
| `list` | `VIMSessionItem[]` | `[]` | Session/contact list | 会话/联系人列表 |
| `messages` | `VIMMessage[]` | required | Current session messages | 当前会话消息列表 |
| `activeSessionId` | `string` | `""` | Active session ID | 当前选中会话 ID |
| `theme` | `VIMTheme` | `{}` | Theme overrides | 主题覆盖 |
| `config` | `VIMConfig` | `{}` | mode, showAvatar, enableRecall, etc. | 配置项 |
| `messageTypeMap` | `VIMMessageTypeMap` | `{}` | Custom message type components | 自定义消息类型映射 |

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `send` | `text: string` | Send text message | 发送文本 |
| `pull-history` | - | Load history on scroll top | 加载历史 |
| `click-avatar` | `message` | Avatar clicked | 点击头像 |
| `menu-click` | `{ action, message }` | Context menu (copy/recall/delete) | 右键菜单 |
| `quote-locate` | `{ quotedId, message? }` | Quote bar clicked | 引用定位 |
| `input-files` | `{ files, source }` | Paste or drop files | 粘贴/拖拽文件 |
| `select-session` | `id: string` | Switch session | 切换会话 |

## Slots

| Slot | Scope | Description | 说明 |
|------|-------|--------------|------|
| `header` | - | Chat area title | 聊天区域标题 |
| `message-item` | `{ message }` | Custom message render | 自定义消息渲染 |
| `input-tools` | - | Toolbar above input | 输入框上方工具栏 |

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
