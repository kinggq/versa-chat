import VersatileIM from "./components/VersatileIM.vue";
import VimDialog from "./components/VimDialog.vue";
import "./styles/vars.css";

export type {
  VIMConfig,
  VIMInputFilesPayload,
  VIMMenuItem,
  VIMMessage,
  VIMMessageDeliveryStatus,
  VIMMessageTypeMap,
  VIMMode,
  VIMQuoteRef,
  VIMSendPayload,
  VIMSessionItem,
  VIMSessionMenuItem,
  VIMSidebarMenuItem,
  VIMTheme
} from "./types";

export { sortSessionItems } from "./utils/sessionListModel";

export { VersatileIM, VimDialog };
