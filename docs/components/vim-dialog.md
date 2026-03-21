# VimDialog

Modal dialog component. Centered, with mask. Used by VersatileIM for header-dialog; also exported for standalone use.

弹窗组件，居中显示，带遮罩。VersatileIM 头部点击好友名称时使用；也可单独引入用于自定义弹窗。

## Props

| Prop | Type | Default | Description | 说明 |
|------|------|---------|--------------|------|
| `modelValue` | `boolean` | required | Visibility (v-model) | 是否显示 |
| `title` | `string` | `""` | Dialog title | 标题 |
| `width` | `string \| number` | - | Width (px or CSS value) | 宽度 |
| `height` | `string \| number` | - | Height (px or CSS value) | 高度 |
| `showClose` | `boolean` | `true` | Show close button | 是否显示关闭按钮 |
| `closeOnMaskClick` | `boolean` | `true` | Close when clicking mask | 点击遮罩是否关闭 |

## Slots

| Slot | Description | 说明 |
|------|--------------|------|
| `default` | Dialog body content | 弹窗内容 |
| `title` | Custom title (replaces title prop) | 自定义标题 |

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { VimDialog } from 'vue-versatile-im';

const visible = ref(false);
</script>

<template>
  <button @click="visible = true">打开</button>
  <VimDialog v-model="visible" title="标题" :width="400" :height="300">
    <p>弹窗内容</p>
  </VimDialog>
</template>
```
