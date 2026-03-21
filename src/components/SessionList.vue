<template>
  <aside class="vim-session-list">
    <button
      v-for="item in list"
      :key="item.id"
      class="session-item"
      :class="{ active: item.id === activeId }"
      type="button"
      @click="$emit('select', item.id)"
    >
      <img v-if="item.avatar" :src="item.avatar" class="avatar" alt="avatar" />
      <div class="meta">
        <div class="title">{{ item.title }}</div>
        <div class="subtitle">{{ item.subtitle }}</div>
      </div>
      <span v-if="item.unread" class="unread">{{ item.unread }}</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { VIMSessionItem } from "../types";

defineProps<{
  list: VIMSessionItem[];
  activeId?: string;
}>();

defineEmits<{
  (event: "select", id: string): void;
}>();
</script>

<style scoped>
.vim-session-list {
  width: 260px;
  border-right: 1px solid var(--vim-border-color);
  background: #fff;
  overflow-y: auto;
}

.session-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: none;
  border-bottom: 1px solid #f3f3f3;
  text-align: left;
  background: #fff;
  cursor: pointer;
}

.session-item.active {
  background: #f7f7f7;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.meta {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 14px;
  color: var(--vim-text-color);
}

.subtitle {
  font-size: 12px;
  color: var(--vim-muted-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread {
  min-width: 18px;
  padding: 0 4px;
  border-radius: 9px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: #fff;
  background: #ff4d4f;
}
</style>
