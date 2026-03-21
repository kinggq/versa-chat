# MessageList

Message list component. Supports timeline (timestamp every 5+ min), quote reply, send status, context menu (copy/recall/delete).

消息列表组件。支持时间线、引用回复、发送状态、右键菜单（复制/撤回/删除）。

## Props

| Prop | Type | Default | Description | 说明 |
|------|------|---------|--------------|------|
| `messages` | `VIMMessage[]` | required | Message list | 消息列表 |
| `showAvatar` | `boolean` | `true` | Show avatar | 显示头像 |
| `enableRecall` | `boolean` | `true` | Enable recall in menu | 启用撤回 |
| `enableMessageMenu` | `boolean` | `true` | Enable context menu | 启用右键菜单 |
| `customMessageTypes` | `VIMMessageTypeMap` | `{}` | Custom type components | 自定义消息类型 |
| `virtualScrollThreshold` | `number` | `100` | Enable virtual scroll when messages >= this. 0 to disable | 消息数超过此值启用虚拟滚动 |
| `virtualRowHeight` | `number` | `88` | Estimated row height for virtual scroll (px) | 虚拟滚动预估行高 |

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `pull-history` | - | Scroll to top | 加载历史 |
| `click-avatar` | `message` | Avatar clicked | 点击头像 |
| `menu-click` | `{ action, message }` | Menu item clicked | 菜单项点击 |
| `quote-locate` | `{ quotedId, message? }` | Quote bar clicked | 引用定位 |
