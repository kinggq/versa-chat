# SessionList

Session/contact list component. Shows avatar, title, subtitle, unread count. Supports sort by latest message, selection highlight.

会话/联系人列表组件。展示头像、标题、副标题、未读数，支持按最新消息排序、选中高亮。

## Props

| Prop | Type | Default | Description | 说明 |
|------|------|---------|--------------|------|
| `list` | `VIMSessionItem[]` | required | Session list | 会话列表 |
| `activeId` | `string` | - | Active session ID | 当前选中 ID |
| `sortByLatest` | `boolean` | `true` | Sort by lastMessageTime desc | 按最新消息排序 |
| `searchPlaceholder` | `string` | `"搜索"` | Placeholder for search input | 搜索框占位符 |
| `searchQuery` | `string` | `""` | Search query (use `v-model:search-query` for two-way) | 搜索关键词，支持 v-model |
| `border` | `boolean` | `true` | Show right border. Set `false` when inside a container that already has border | 是否显示右边框 |
| `menuItems` | `VIMSessionMenuItem[]` | 置顶/免打扰/删除 | 会话项菜单，空数组可隐藏菜单 | 会话项菜单 |

## 时间显示 | Time Display

右侧显示 `lastMessageTime`：当天显示时分（如 14:30），本周显示周几（周一～周日），更早显示日期（3/15 或 2024/3/15）。

## 交互 | Interaction

- 鼠标悬停：背景高亮，时间右侧显示向下箭头菜单按钮
- 点击箭头或右键好友：打开菜单列表
- 默认菜单：置顶聊天、免打扰、删除聊天

## Slots

| Slot | Props | Description | 说明 |
|------|-------|-------------|------|
| `search` | `{ searchQuery, placeholder, onUpdate }` | Custom search UI. Default: built-in input | 自定义搜索栏，不传则使用内置输入框 |

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `select` | `id: string` | Session selected | 选中会话 |
| `update:searchQuery` | `value: string` | Search query changed (for v-model) | 搜索关键词变化 |
| `session-menu-click` | `{ action, session }` | Menu item clicked | 菜单项点击 |

## VIMSessionItem

| Field | Type | Description | 说明 |
|-------|------|--------------|------|
| `lastMessageTime` | `number` | Timestamp for sorting (latest on top) | 最后消息时间，用于排序 |
| `unread` | `number` | Unread count. **Clear on select** in parent | 未读数，选中后由使用者清零 |
| `pinned` | `boolean` | Pin to top of list (within pinned group, still sorted by `lastMessageTime`) | 置顶，列表最前并显示 📌 |

## 使用者需自行实现 | Implement in Your App

- **未读清零**：在 `@select-session` 中，将对应会话的 `unread` 设为 0
- **最新在顶**：收到新消息时更新该会话的 `lastMessageTime` 和 `subtitle`，组件会按 `lastMessageTime` 自动排序
