# SessionList

Session/contact list component. Shows title, subtitle, unread count. Supports selection highlight.

会话/联系人列表组件。展示标题、副标题、未读数，支持选中高亮。

## Props

| Prop | Type | Default | Description | 说明 |
|------|------|---------|--------------|------|
| `list` | `VIMSessionItem[]` | required | Session list | 会话列表 |
| `activeId` | `string` | - | Active session ID | 当前选中 ID |

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `select` | `id: string` | Session selected | 选中会话 |
