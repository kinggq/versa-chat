import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, markRaw } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import MessageList from "../src/components/MessageList.vue";
import type { VIMMessage } from "../src/types";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
  });
  if (typeof ResizeObserver === "undefined") {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn()
    }));
  }
});


function createMessages(): VIMMessage[] {
  return [
    {
      id: "m-1",
      type: "text",
      content: "hello",
      sender: "other",
      timestamp: Date.now() - 10000
    },
    {
      id: "m-2",
      type: "vote",
      content: { title: "投票测试" },
      sender: "self",
      timestamp: Date.now()
    }
  ];
}

describe("MessageList", () => {
  it("renders custom message type from map", () => {
    const VoteComponent = defineComponent({
      props: {
        content: {
          type: Object,
          required: true
        }
      },
      setup(props) {
        return () => h("div", { class: "vote-message" }, (props.content as { title: string }).title);
      }
    });

    const wrapper = mount(MessageList, {
      props: {
        messages: createMessages(),
        customMessageTypes: {
          vote: markRaw(VoteComponent)
        }
      }
    });

    expect(wrapper.text()).toContain("投票测试");
    expect(wrapper.find(".vote-message").exists()).toBe(true);
  });

  it("emits pull-history when list scrolls to top", async () => {
    const wrapper = mount(MessageList, {
      props: {
        messages: createMessages()
      }
    });

    const list = wrapper.find(".vim-message-list");
    Object.defineProperty(list.element, "scrollTop", {
      value: 0,
      writable: true
    });

    await list.trigger("scroll");

    expect(wrapper.emitted("pull-history")).toBeTruthy();
  });

  it("emits quote-locate when quote bar is clicked", async () => {
    const messages: VIMMessage[] = [
      {
        id: "m-0",
        type: "text",
        content: "quoted",
        sender: "other",
        timestamp: Date.now() - 1000
      },
      {
        id: "m-1",
        type: "text",
        content: "reply",
        sender: "other",
        timestamp: Date.now(),
        quote: { id: "m-0", preview: "quoted" }
      }
    ];

    const wrapper = mount(MessageList, {
      props: { messages }
    });

    await wrapper.find(".vim-quote-bar").trigger("click");

    expect(wrapper.emitted("quote-locate")?.[0]?.[0]).toEqual({
      quotedId: "m-0",
      message: messages[0]
    });
  });

  it("shows sending and failed status for self messages", () => {
    const messages: VIMMessage[] = [
      {
        id: "s1",
        type: "text",
        content: "a",
        sender: "self",
        timestamp: Date.now(),
        sending: true
      },
      {
        id: "s2",
        type: "text",
        content: "b",
        sender: "self",
        timestamp: Date.now(),
        failed: true
      }
    ];

    const wrapper = mount(MessageList, {
      props: { messages, showAvatar: false }
    });

    expect(wrapper.text()).toContain("发送中");
    expect(wrapper.text()).toContain("发送失败");
  });

  it("emits menu-click when choosing an item from context menu", async () => {
    const messages: VIMMessage[] = [
      {
        id: "t1",
        type: "text",
        content: "copy-me",
        sender: "other",
        timestamp: Date.now()
      }
    ];

    const wrapper = mount(MessageList, {
      props: { messages, enableMessageMenu: true },
      attachTo: document.body
    });

    await wrapper.find(".vim-bubble").trigger("contextmenu", {
      clientX: 40,
      clientY: 40
    });

    const copyBtn = document.querySelector(
      ".vim-context-menu .menu-item"
    ) as HTMLButtonElement | null;
    expect(copyBtn?.textContent?.trim()).toBe("复制");

    await copyBtn?.click();
    await flushPromises();

    expect(wrapper.emitted("menu-click")?.[0]?.[0]).toMatchObject({
      action: "copy",
      message: messages[0]
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("copy-me");

    wrapper.unmount();
  });
});
