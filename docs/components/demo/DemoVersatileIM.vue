<script setup lang="ts">
import { ref } from "vue";
import { VersatileIM } from "../../../src";
import type { VIMMessage, VIMSessionItem } from "../../../src";

const activeId = ref("s1");
const sessions = ref<VIMSessionItem[]>([
  { id: "s1", title: "Product Group", subtitle: "Beta today", unread: 2 },
  { id: "s2", title: "Support", subtitle: "How can we help?" },
]);
const messages = ref<VIMMessage[]>([
  {
    id: "m1",
    sender: "other",
    type: "text",
    content: "Welcome to VersaChat",
    timestamp: Date.now() - 600000,
  },
  {
    id: "m2",
    sender: "self",
    type: "text",
    content: "Hello!",
    timestamp: Date.now() - 300000,
  },
]);

function onSend(text: string) {
  messages.value.push({
    id: `m-${Date.now()}`,
    sender: "self",
    type: "text",
    content: text,
    timestamp: Date.now(),
  });
}
</script>

<template>
  <div class="demo-wrap">
    <VersatileIM
      :list="sessions"
      :messages="messages"
      :active-session-id="activeId"
      :config="{ mode: 'pc' }"
      @send="onSend"
      @select-session="activeId = $event"
    />
  </div>
</template>

<style scoped>
.demo-wrap {
  width: 100%;
  height: 480px;
  border: 1px solid var(--vim-border-color);
  border-radius: 8px;
}
</style>
