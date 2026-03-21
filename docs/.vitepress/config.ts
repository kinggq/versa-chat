import { defineConfig } from "vitepress";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  title: "VersaChat",
  description: "A lightweight, zero-dependency Vue 3 IM UI component library",
  base: "/",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Components", link: "/components/versatile-im" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Usage", link: "/guide/usage" },
          { text: "Theme", link: "/guide/theme" },
          { text: "Custom Message Types", link: "/guide/custom-message" },
        ],
      },
      {
        text: "Components",
        items: [
          { text: "VersatileIM", link: "/components/versatile-im" },
          { text: "MessageList", link: "/components/message-list" },
          { text: "IMInput", link: "/components/im-input" },
          { text: "SessionList", link: "/components/session-list" },
          { text: "VimDialog", link: "/components/vim-dialog" },
        ],
      },
    ],
  },
  vite: {
    resolve: {
      alias: {
        "vue-versatile-im": resolve(__dirname, "../../src/index.ts"),
      },
    },
  },
});
