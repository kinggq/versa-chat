import type { Component } from "vue";

export type VIMMode = "pc" | "service";

export interface VIMSessionItem {
  id: string;
  title: string;
  avatar?: string;
  subtitle?: string;
  unread?: number;
}

/** 引用回复：指向被引用的消息 id，可选预览文案 */
export interface VIMQuoteRef {
  id: string;
  preview?: string;
  sender?: "self" | "other";
}

export interface VIMMessage {
  id: string;
  type: string;
  content: unknown;
  sender: "self" | "other";
  timestamp: number;
  avatar?: string;
  sending?: boolean;
  failed?: boolean;
  /** 引用某条消息（点击引用条可触发定位） */
  quote?: VIMQuoteRef;
}

export interface VIMTheme {
  primaryColor?: string;
  bgColor?: string;
  bubbleLeftBg?: string;
  bubbleRightBg?: string;
  fontSize?: string;
  borderRadius?: string;
}

export interface VIMConfig {
  mode?: VIMMode;
  showAvatar?: boolean;
  enableRecall?: boolean;
  mobileBreakpoint?: number;
  /** 是否启用消息右键菜单（复制/撤回/删除等） */
  enableMessageMenu?: boolean;
  /**
   * 自定义右键菜单项；不传则使用内置默认项（仍受 enableRecall 等影响）
   * 返回 false 的项不展示
   */
  menuItems?: VIMMenuItem[];
}

/** 右键菜单项：key 会随 menu-click 事件回传 */
export interface VIMMenuItem {
  key: string;
  label: string;
  visible?: (message: VIMMessage) => boolean;
}

export type VIMMessageTypeMap = Record<string, Component>;

/** 输入区粘贴/拖拽得到的文件 */
export interface VIMInputFilesPayload {
  files: File[];
  source: "paste" | "drop";
}
