# IMInput

Input component. Supports Ctrl+Enter send, paste image, drag & drop files. Extend toolbar via `input-tools` slot.

输入框组件。支持 Ctrl+Enter 发送、粘贴图片、拖拽文件。可通过 input-tools 插槽扩展工具栏。

## Props

No props.

## Events

| Event | Payload | Description | 说明 |
|-------|---------|--------------|------|
| `send` | `text: string` | Send text | 发送文本 |
| `input-files` | `{ files, source }` | Paste or drop files | 粘贴/拖拽文件 |

## Slots

| Slot | Description | 说明 |
|------|--------------|------|
| `input-tools` | Toolbar above textarea | 输入框上方工具栏 |
