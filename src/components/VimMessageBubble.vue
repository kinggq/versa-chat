<template>
  <div class="vim-bubble-column" :class="isSelf ? 'is-self' : 'is-other'">
    <button
      v-if="quote"
      type="button"
      class="vim-quote-bar"
      @click="$emit('quote-click', quote)"
    >
      <span class="vim-quote-label">引用</span>
      <span class="vim-quote-preview">{{ quote.preview || "消息" }}</span>
    </button>

    <div
      class="vim-bubble"
      :class="{ 'is-self': isSelf }"
      @contextmenu.prevent="$emit('contextmenu', $event)"
    >
      <slot />
    </div>

    <div v-if="isSelf && (sending || failed)" class="vim-send-status">
      <span v-if="sending" class="vim-status vim-status-sending">发送中…</span>
      <span v-if="failed" class="vim-status vim-status-failed">发送失败</span>
    </div>
    <div
      v-else-if="isSelf && deliveryStatus"
      class="vim-delivery-status"
      :title="deliveryTitle"
      aria-hidden="true"
    >
      <span v-if="deliveryStatus === 'sent'" class="vim-delivery-icon">✓</span>
      <span v-else-if="deliveryStatus === 'delivered'" class="vim-delivery-icon">✓✓</span>
      <span v-else class="vim-delivery-icon vim-delivery-read">✓✓</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VIMMessageDeliveryStatus, VIMQuoteRef } from "../types";

const props = defineProps<{
  isSelf?: boolean;
  quote?: VIMQuoteRef;
  sending?: boolean;
  failed?: boolean;
  deliveryStatus?: VIMMessageDeliveryStatus;
}>();

const deliveryTitle = computed(() => {
  const map: Record<VIMMessageDeliveryStatus, string> = {
    sent: "已发送",
    delivered: "已送达",
    read: "已读"
  };
  return props.deliveryStatus ? map[props.deliveryStatus] : "";
});

defineEmits<{
  (event: "quote-click", quote: VIMQuoteRef): void;
  (event: "contextmenu", e: MouseEvent): void;
}>();
</script>

<style scoped>
.vim-bubble-column {
  display: flex;
  flex-direction: column;
  align-items: inherit;
  max-width: min(60%, 500px);
}

.vim-bubble-column.is-self {
  align-items: flex-end;
}

.vim-bubble-column.is-other {
  align-items: flex-start;
}

.vim-quote-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  margin-bottom: 4px;
  padding: 4px 8px;
  border: 1px solid var(--vim-quote-border);
  border-radius: 4px;
  background: var(--vim-quote-bg);
  font-size: 12px;
  color: var(--vim-muted-text-color);
  cursor: pointer;
  text-align: left;
}

.vim-quote-label {
  flex-shrink: 0;
  color: var(--vim-primary-color);
}

.vim-quote-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vim-bubble {
  padding: 8px 10px;
  border-radius: var(--vim-border-radius);
  background: var(--vim-bubble-left-bg);
  color: var(--vim-text-color);
  word-break: break-word;
}

.vim-bubble.is-self {
  background: var(--vim-bubble-right-bg);
}

.vim-send-status {
  margin-top: 4px;
  font-size: 12px;
}

.vim-status-sending {
  color: var(--vim-status-sending);
}

.vim-status-failed {
  color: var(--vim-status-failed);
}

.vim-delivery-status {
  margin-top: 2px;
  font-size: 11px;
  line-height: 1;
  letter-spacing: -0.05em;
}

.vim-delivery-icon {
  color: var(--vim-delivery-sent, #8b8b8b);
}

.vim-delivery-read {
  color: var(--vim-delivery-read, #34b7f1);
}
</style>
