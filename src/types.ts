import type { Component } from "vue";

export type VIMMode = "pc" | "service";

/** 左侧边栏菜单项（如微信的 聊天/联系人/我） */
export interface VIMSidebarMenuItem {
  key: string;
  label: string;
  /** 图标 HTML 或 SVG 字符串，不传则使用内置默认图标 */
  icon?: string;
  /** 角标数字，0 或不传则不显示 */
  badge?: number;
}

export interface VIMSessionItem {
  id: string;
  title: string;
  avatar?: string;
  subtitle?: string;
  /** 未读数，选中会话后由使用者清零 */
  unread?: number;
  /** 最后一条消息时间戳，用于排序（最新在顶） */
  lastMessageTime?: number;
  /** 置顶：置顶会话在列表最前（仍按 lastMessageTime 在置顶组内排序） */
  pinned?: boolean;
}

/** 己方消息送达状态（仅对 sender === "self" 且已发送成功时展示） */
export type VIMMessageDeliveryStatus = "sent" | "delivered" | "read";

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
  /** 己方消息送达/已读（业务层在发送成功后更新） */
  deliveryStatus?: VIMMessageDeliveryStatus;
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
  /** 会话列表按最新消息排序（最新在顶）。默认 true */
  sortSessionByLatest?: boolean;
  /** 会话列表顶部搜索框 placeholder */
  sessionSearchPlaceholder?: string;
  /** 会话/好友列表项菜单（置顶、免打扰、删除等），不传则使用默认项 */
  sessionMenuItems?: VIMSessionMenuItem[];
  /** 左侧边栏顶部菜单项（聊天/联系人/我） */
  sidebarMenuItems?: VIMSidebarMenuItem[];
  /** 左侧边栏底部菜单项（如 设置） */
  sidebarMenuBottomItems?: VIMSidebarMenuItem[];
  /** 使用 main-pane 插槽的菜单 key（如 ["me"]），选中时右侧显示插槽内容而非聊天 */
  mainPaneKeys?: string[];
  /** 消息列表为空时显示的文案 */
  emptyText?: string;
  /** 输入框是否显示图片上传按钮。默认 true */
  showImageButton?: boolean;
  /** 输入框 placeholder */
  inputPlaceholder?: string;
  /** 「对方正在输入」提示文案 */
  typingText?: string;
  /** 消息数超过此值时启用虚拟滚动，0 表示禁用。默认 100 */
  virtualScrollThreshold?: number;
  /** 虚拟滚动时预估行高 (px)。默认 88 */
  virtualRowHeight?: number;
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

/** 会话/好友列表项菜单：key 会随 session-menu-click 事件回传 */
export interface VIMSessionMenuItem {
  key: string;
  label: string;
}

export type VIMMessageTypeMap = Record<string, Component>;

/** 输入区粘贴/拖拽得到的文件 */
export interface VIMInputFilesPayload {
  files: File[];
  source: "paste" | "drop";
}

/** 发送消息载荷：支持引用回复 */
export interface VIMSendPayload {
  text: string;
  quote?: VIMQuoteRef;
}
