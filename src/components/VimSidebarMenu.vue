<template>
  <nav class="vim-sidebar-menu" aria-label="主导航">
    <div class="vim-sidebar-top">
      <button
        v-for="item in topItems"
        :key="item.key"
        type="button"
        class="vim-sidebar-item"
        :class="{ active: item.key === activeKey }"
        :title="item.label"
        :aria-label="item.label"
        @click="$emit('select', item.key)"
      >
        <slot name="item-icon" :item="item" :active="item.key === activeKey">
          <span v-if="item.icon" class="vim-sidebar-icon" v-html="item.icon" />
          <span v-else class="vim-sidebar-icon vim-sidebar-icon-default">{{ defaultIcon(item.key) }}</span>
        </slot>
        <span class="vim-sidebar-label">{{ item.label }}</span>
        <span v-if="item.badge != null && item.badge > 0" class="vim-sidebar-badge">{{ formatBadge(item.badge) }}</span>
      </button>
    </div>
    <div class="vim-sidebar-bottom">
      <button
        v-for="item in bottomItems"
        :key="item.key"
        type="button"
        class="vim-sidebar-item"
        :class="{ active: item.key === activeKey }"
        :title="item.label"
        :aria-label="item.label"
        @click="$emit('select', item.key)"
      >
        <slot name="item-icon" :item="item" :active="item.key === activeKey">
          <span v-if="item.icon" class="vim-sidebar-icon" v-html="item.icon" />
          <span v-else class="vim-sidebar-icon vim-sidebar-icon-default">{{ defaultIcon(item.key) }}</span>
        </slot>
        <span class="vim-sidebar-label">{{ item.label }}</span>
        <span v-if="item.badge != null && item.badge > 0" class="vim-sidebar-badge">{{ formatBadge(item.badge) }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VIMSidebarMenuItem } from "../types";

const props = withDefaults(
  defineProps<{
    items: VIMSidebarMenuItem[];
    bottomItems?: VIMSidebarMenuItem[];
    activeKey?: string;
  }>(),
  { bottomItems: () => [], activeKey: "" }
);

defineEmits<{
  (event: "select", key: string): void;
}>();

const topItems = computed(() => props.items);
const bottomItems = computed(() => props.bottomItems ?? []);

function defaultIcon(key: string): string {
  const map: Record<string, string> = {
    chats: "💬",
    contacts: "👥",
    me: "👤",
    settings: "⚙"
  };
  return map[key] ?? "•";
}

function formatBadge(n: number): string {
  return n > 99 ? "99+" : String(n);
}
</script>

<style scoped>
.vim-sidebar-menu {
  width: 64px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  background: var(--vim-bg-color);
  border-right: 1px solid var(--vim-border-color);
}

.vim-sidebar-top {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.vim-sidebar-bottom {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  border-top: 1px solid var(--vim-border-color);
}

.vim-sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 56px;
  padding: 8px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--vim-muted-text-color);
  transition: color 0.2s, background 0.2s;
}

.vim-sidebar-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--vim-text-color);
}

.vim-sidebar-item.active {
  color: var(--vim-primary-color, #07c160);
  background: rgba(7, 193, 96, 0.08);
}

.vim-sidebar-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.vim-sidebar-icon-default {
  font-size: 22px;
}

.vim-sidebar-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.vim-sidebar-label {
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
}

.vim-sidebar-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: #fff;
  background: #ff4d4f;
}

.vim-sidebar-item {
  position: relative;
}
</style>
