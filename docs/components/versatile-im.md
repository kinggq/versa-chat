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
| `config` | `VIMConfig` | `{}` | mode, showAvatar, enableRecall, etc. | 配置项 |
| `messageTypeMap` | `VIMMessageTypeMap` | `{}` | Custom message type components | 自定义消息类型映射 |

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `send` | `text: string` | Send text message | 发送文本 |
| `pull-history` | - | Load history on scroll top | 加载历史 |
| `click-avatar` | `message` | Avatar clicked | 点击头像 |
| `menu-click` | `{ action, message }` | Context menu | 右键菜单 |
| `quote-locate` | `{ quotedId, message? }` | Quote bar clicked | 引用定位 |
| `input-files` | `{ files, source }` | Paste or drop files | 粘贴/拖拽文件 |
| `select-session` | `id: string` | Switch session | 切换会话 |

## Slots

| Slot | Scope | Description | 说明 |
|------|-------|--------------|------|
| `header` | - | Chat area title | 聊天区域标题 |
| `message-item` | `{ message }` | Custom message render | 自定义消息渲染 |
| `input-tools` | - | Toolbar above input | 输入框上方工具栏 |
