import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { VersatileIM } from "../src";

describe("VersatileIM", () => {
  it("mounts with empty messages and renders root", () => {
    const wrapper = mount(VersatileIM, {
      props: {
        messages: [],
        list: [],
        activeSessionId: "",
        config: { mode: "service" }
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    });
    expect(wrapper.classes()).toContain("vim-root");
    expect(wrapper.find(".vim-message-empty-text, .vim-message-empty").exists()).toBe(true);
  });

  it("exports sortSessionItems from package entry", async () => {
    const mod = await import("../src/index");
    expect(typeof mod.sortSessionItems).toBe("function");
  });
});
