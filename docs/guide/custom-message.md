# Custom Message Types

Pass a `messageTypeMap` mapping `type` to component to extend message types (vote, red packet, voice, etc.).

## How It Works

MessageList uses `mergedTypeMap = builtInTypes + customMessageTypes`, looks up the component by `msg.type`, and renders it. Built-in types are `text`, `image`, `file`. Unmatched types fall back to `TextMessage`.

## Example

```vue
<script setup>
import { defineComponent, h } from 'vue';
import { VersatileIM } from 'vue-versatile-im';

const VoteMessage = defineComponent({
  props: ['content'],
  setup(props) {
    const data = props.content || { title: '', options: [] };
    return () => h('div', { class: 'vote-card' }, [
      h('strong', data.title),
      h('ul', data.options.map(o => h('li', o)))
    ]);
  }
});

const messageTypeMap = {
  vote: VoteMessage
};
</script>

<template>
  <VersatileIM
    :message-type-map="messageTypeMap"
    :messages="messages"
    ...
  />
</template>
```

## Slot Priority

If both `message-item` slot and `messageTypeMap` are provided, the slot content takes precedence. Use this for per-message custom rendering.

---

## 中文

# 自定义消息类型

通过 `messageTypeMap` 传入 type 与组件的映射，可扩展如投票、红包、语音等消息类型。

### 实现思路

消息列表使用 `mergedTypeMap = builtInTypes + customMessageTypes`，按 `msg.type` 查找对应组件并渲染。内置类型为 `text`、`image`、`file`，未匹配时回退到 `TextMessage`。

### 插槽优先

若同时提供 `message-item` 插槽，插槽内容优先于 `messageTypeMap` 渲染。可用于对单条消息做特殊处理。
