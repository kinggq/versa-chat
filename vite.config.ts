import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const isLib = process.env.BUILD_LIB === "true";

  if (!isLib) {
    return {
      plugins: [vue()],
      test: {
        environment: "jsdom",
        include: ["tests/**/*.spec.ts"],
        setupFiles: [resolve(__dirname, "vitest.setup.ts")]
      }
    };
  }

  return {
    plugins: [vue()],
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "VueVersatileIM",
        fileName: "vue-versatile-im",
        formats: ["es", "umd"]
      },
      rollupOptions: {
        external: ["vue"],
        output: {
          globals: {
            vue: "Vue"
          }
        }
      }
    },
    test: {
      environment: "jsdom",
      include: ["tests/**/*.spec.ts"],
      setupFiles: [resolve(__dirname, "vitest.setup.ts")]
    }
  };
});
