<template>
  <aside class="vim-session-list" :class="{ 'vim-session-list--no-border': !border }">
    <div class="vim-session-search">
      <slot name="search" :search-query="searchQuery" :placeholder="searchPlaceholder" :on-update="onSearchUpdate">
        <input
          v-model="searchQueryModel"
          type="text"
          class="vim-search-input"
          :placeholder="searchPlaceholder"
          aria-label="搜索会话"
        />
      </slot>
    </div>
    <div class="vim-session-list-scroll">
      <div
        v-for="item in sortedList"
        :key="item.id"
        class="session-item"
        :class="{ active: item.id === activeId }"
        role="button"
        tabindex="0"
        @click="onItemClick(item)"
        @contextmenu.prevent="openMenu($event, item)"
        @keydown.enter="onItemClick(item)"
      >
        <div class="session-item-avatar">
          <VimAvatar
            :src="item.avatar"
            :size="36"
            :show-placeholder="!item.avatar"
            alt="avatar"
          />
          <span v-if="item.unread && item.unread > 0" class="vim-unread">{{ formatUnread(item.unread) }}</span>
        </div>
        <div class="meta">
          <div class="title">
            <span v-if="item.pinned" class="vim-session-pin" title="置顶" aria-label="置顶">📌</span>
            {{ item.title }}
          </div>
          <div class="subtitle">{{ item.subtitle }}</div>
        </div>
        <div class="session-item-right">
          <span class="session-time">{{ formatLastMessageTime(item.lastMessageTime) }}</span>
          <button
            v-if="hasMenuItems"
            type="button"
            class="vim-session-menu-btn"
            aria-label="更多"
            @click.stop="openMenu($event, item)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="menuOpen && menuPosition"
        class="vim-context-menu-backdrop"
        @click="closeMenu"
        @contextmenu.prevent="closeMenu"
      />
      <ul
        v-if="menuOpen && menuPosition && activeMenuItem"
        class="vim-context-menu vim-session-context-menu"
        :style="{ left: `${menuPosition.left}px`, top: `${menuPosition.top}px` }"
        @click.stop
      >
        <li v-for="item in menuItems" :key="item.key">
          <button type="button" class="menu-item" @click="onMenuSelect(item.key)">
            {{ item.label }}
          </button>
        </li>
      </ul>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { Teleport, computed, ref } from "vue";
import VimAvatar from "./VimAvatar.vue";
import type { VIMSessionItem, VIMSessionMenuItem } from "../types";
import { sortSessionItems } from "../utils/sessionListModel";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const props = withDefaults(
  defineProps<{
    list: VIMSessionItem[];
    activeId?: string;
    /** Sort by lastMessageTime desc (latest on top). Default true. */
    sortByLatest?: boolean;
    /** Placeholder for default search input */
    searchPlaceholder?: string;
    /** Search query for filtering (controlled). Use v-model:search-query for two-way binding. */
    searchQuery?: string;
    /** Show right border. Set false when inside a container that already has border. Default true. */
    border?: boolean;
    /** Session item menu items (e.g. pin, mute, delete). Empty = no menu. */
    menuItems?: VIMSessionMenuItem[];
  }>(),
  { sortByLatest: true, searchPlaceholder: "搜索", searchQuery: "", border: true }
);

const defaultMenuItems: VIMSessionMenuItem[] = [
  { key: "pin", label: "置顶聊天" },
  { key: "mute", label: "免打扰" },
  { key: "delete", label: "删除聊天" }
];

const emit = defineEmits<{
  (event: "select", id: string): void;
  (event: "update:searchQuery", value: string): void;
  (event: "session-menu-click", payload: { action: string; session: VIMSessionItem }): void;
}>();

const menuItems = computed(() => props.menuItems ?? defaultMenuItems);
const hasMenuItems = computed(() => menuItems.value.length > 0);

const menuOpen = ref(false);
const menuPosition = ref<{ left: number; top: number } | null>(null);
const activeMenuItem = ref<VIMSessionItem | null>(null);

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (v: string) => emit("update:searchQuery", v)
});

function onSearchUpdate(value: string): void {
  emit("update:searchQuery", value);
}

function formatLastMessageTime(ts?: number): string {
  if (!ts || ts <= 0) return "";
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  if (diffDays >= 1 && diffDays < 7) {
    return WEEKDAYS[d.getDay()];
  }
  if (diffDays >= 7 && diffDays < 365) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function onItemClick(item: VIMSessionItem): void {
  emit("select", item.id);
}

function openMenu(event: MouseEvent, item: VIMSessionItem): void {
  if (!hasMenuItems.value) return;
  menuPosition.value = { left: event.clientX, top: event.clientY };
  activeMenuItem.value = item;
  menuOpen.value = true;
}

function closeMenu(): void {
  menuOpen.value = false;
  menuPosition.value = null;
  activeMenuItem.value = null;
}

function onMenuSelect(action: string): void {
  const item = activeMenuItem.value;
  if (item) emit("session-menu-click", { action, session: item });
  closeMenu();
}

const sortedList = computed(() =>
  sortSessionItems(props.list, props.sortByLatest, props.searchQuery ?? "")
);

function formatUnread(n: number): string {
  return n > 99 ? "99+" : String(n);
}
</script>

<style scoped>
.vim-session-list {
  width: 260px;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vim-session-list:not(.vim-session-list--no-border) {
  border-right: 1px solid var(--vim-border-color);
}

.vim-session-search {
  flex-shrink: 0;
  padding: 10px 12px;
  border-bottom: 1px solid var(--vim-border-color);
  background: #fff;
}

.vim-search-input {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 10px 0 32px;
  border: 1px solid var(--vim-border-color);
  border-radius: 6px;
  font-size: 13px;
  background: #f5f5f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 10px center;
  outline: none;
  transition: border-color 0.2s, background-color 0.2s;
}

.vim-search-input::placeholder {
  color: var(--vim-muted-text-color);
}

.vim-search-input:focus {
  border-color: var(--vim-primary-color, #6b5cff);
  background-color: #fff;
}

.vim-session-list-scroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.session-item {
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  gap: 10px;
  padding: 12px;
  border: none;
  border-bottom: 1px solid #f3f3f3;
  text-align: left;
  background: #fff;
  cursor: pointer;
  transition: background-color 0.15s;
}

.session-item:hover {
  background: #f5f5f5;
}

.session-item.active {
  background: #f0f0f0;
}

.session-item.active:hover {
  background: #ebebeb;
}

.session-item-avatar {
  position: relative;
  flex-shrink: 0;
}

.vim-unread {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  padding: 0 4px;
  border-radius: 9px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  color: #fff;
  background: #ff4d4f;
}

.session-item-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.session-time {
  font-size: 11px;
  color: var(--vim-muted-text-color);
}

.vim-session-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vim-muted-text-color);
  cursor: pointer;
  border-radius: 4px;
}

.vim-session-menu-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--vim-text-color);
}

.session-item:hover .vim-session-menu-btn {
  display: flex;
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

:global(.vim-context-menu-backdrop) {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: transparent;
}

:global(.vim-context-menu) {
  position: fixed;
  z-index: 9999;
  min-width: 120px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--vim-menu-bg);
  border: 1px solid var(--vim-border-color);
  border-radius: var(--vim-border-radius);
  box-shadow: var(--vim-menu-shadow);
}

:global(.vim-context-menu .menu-item) {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 13px;
  cursor: pointer;
}

:global(.vim-context-menu .menu-item:hover) {
  background: var(--vim-bg-color);
}
</style>
