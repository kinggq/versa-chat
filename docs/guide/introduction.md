# Introduction

A lightweight, zero-dependency, highly customizable Vue 3 IM UI component library. Supports **PC mode** (dual-panel, like WeChat Desktop) and **Service mode** (single-panel, like web chat widget).

## Features

- **Zero dependencies**: No Element Plus, Ant Design, or other third-party UI libraries
- **Theme customization**: Control colors, radius, and spacing via CSS Variables
- **Extensible message types**: Built-in text, image, file; supports custom types (vote, red packet, voice, etc.)
- **Slot mechanism**: `message-item`, `input-tools`, `header` slots for deep customization
- **TypeScript**: Full type definitions with inference support

## Quick Start

```bash
npm install vue-versatile-im
```

```ts
import { VersatileIM } from "vue-versatile-im";
import "vue-versatile-im/style.css";
```

```vue
<template>
  <VersatileIM
    :list="sessions"
    :messages="messages"
    :active-session-id="activeId"
    :config="{ mode: 'pc' }"
    @send="onSend"
    @pull-history="onPullHistory"
    @select-session="activeId = $event"
  />
</template>
```

## Documentation Structure

- **VersatileIM**: Main container, integrates session list, message list, and input
- **MessageList**: Message list (timeline, bubbles, quote, context menu)
- **IMInput**: Input area (Ctrl+Enter, paste, drag & drop)
- **SessionList**: Session/contact list

---

## 中文

# 介绍

轻量级、零依赖、高度可定制的 Vue3 IM UI 组件库。支持 **PC 双栏模式**（类似微信 PC）与 **Service 单栏模式**（网页客服窗口）。

### 特性

- **零依赖**：不依赖 Element Plus、Ant Design 等第三方 UI 库
- **主题定制**：通过 CSS Variables 控制颜色、圆角、间距
- **消息类型扩展**：内置文本、图片、文件；支持自定义类型（投票、红包、语音等）
- **插槽机制**：`message-item`、`input-tools`、`header` 等插槽支持深度定制
- **TypeScript**：完整类型定义，支持类型推导

### 文档结构

- **VersatileIM**：主容器组件，整合会话列表、消息列表、输入框
- **MessageList**：消息列表（时间线、气泡、引用、右键菜单）
- **IMInput**：输入框（Ctrl+Enter、粘贴、拖拽）
- **SessionList**：会话/联系人列表
