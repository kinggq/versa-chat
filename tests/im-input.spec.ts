import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import IMInput from "../src/components/IMInput.vue";

describe("IMInput", () => {
  it("emits input-files with source paste when pasting a file", async () => {
    const wrapper = mount(IMInput);
    const textarea = wrapper.find("textarea");
    const file = new File(["x"], "paste.png", { type: "image/png" });

    const event = new Event("paste", { bubbles: true });
    Object.defineProperty(event, "clipboardData", {
      value: {
        items: [
          {
            kind: "file",
            getAsFile: () => file
          }
        ]
      }
    });

    await textarea.element.dispatchEvent(event);

    const emitted = wrapper.emitted("input-files");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0]).toEqual({
      files: [file],
      source: "paste"
    });
  });

  it("emits input-files with source drop when dropping files", async () => {
    const wrapper = mount(IMInput);
    const wrap = wrapper.find(".vim-input-wrap");
    const file = new File(["hello"], "drop.txt", { type: "text/plain" });

    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [file]
      }
    });

    await wrap.element.dispatchEvent(dropEvent);

    const emitted = wrapper.emitted("input-files");
    expect(emitted?.[0]?.[0]).toEqual({
      files: [file],
      source: "drop"
    });
  });

  it("sets drag-over styling on dragover and clears on dragleave", async () => {
    const wrapper = mount(IMInput);
    const wrap = wrapper.find(".vim-input-wrap");

    await wrap.trigger("dragover");
    expect(wrap.classes()).toContain("is-drag-over");

    await wrap.trigger("dragleave");
    expect(wrap.classes()).not.toContain("is-drag-over");
  });

  it("emits send on Ctrl+Enter", async () => {
    const wrapper = mount(IMInput, {
      props: { modelValue: "  hello  " }
    });
    const textarea = wrapper.find("textarea");

    await textarea.trigger("keydown", {
      key: "Enter",
      ctrlKey: true
    });

    expect(wrapper.emitted("send")?.[0]).toEqual([{ text: "hello" }]);
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe("");
  });
});
