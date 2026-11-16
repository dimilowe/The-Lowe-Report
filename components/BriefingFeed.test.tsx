import { beforeEach, describe, expect, it, vi } from "vitest";

// Exercise the feed's observer and request lifecycle without a browser DOM.
const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  effects: [] as (() => void | (() => void))[],
  stateIndex: 0,
  refIndex: 0,
}));

vi.mock("react", () => ({
  useState: (initial: unknown) => {
    const index = harness.stateIndex++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (value: unknown) => {
      harness.states[index] = typeof value === "function" ? value(harness.states[index]) : value;
    }];
  },
  useRef: (initial: unknown) => {
    const index = harness.refIndex++;
    return harness.refs[index] ||= { current: index === 0 ? {} : initial };
  },
  useCallback: (callback: unknown) => callback,
  useEffect: (callback: () => void | (() => void)) => { harness.effects.push(callback); },
}));
vi.mock("next/link", () => ({ default: "a" }));

import BriefingFeed from "./BriefingFeed";

const article = (id: number) => ({
  id, title: `Story ${id}`, excerpt: "", featured_image_url: null,
  eyebrow: "Business", href: `/newsletter/story-${id}`,
});

describe("Briefing infinite scrolling", () => {
  let intersect: (entries: { isIntersecting: boolean }[]) => void;
  let disconnect: ReturnType<typeof vi.fn>;

  function render(nextPage: number | null = 2) {
    harness.stateIndex = 0;
    harness.refIndex = 0;
    harness.effects = [];
    BriefingFeed({ initialPosts: [article(1)], initialNextPage: nextPage, category: "business" });
    return harness.effects.map(effect => effect());
  }

  beforeEach(() => {
    harness.states = [];
    harness.refs = [];
    harness.effects = [];
    disconnect = vi.fn();
    vi.stubGlobal("window", { IntersectionObserver: true });
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: typeof intersect) { intersect = callback; }
      observe = vi.fn();
      disconnect = disconnect;
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("automatically appends older articles, retains category, and removes duplicates", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: async () => ({ posts: [article(1), article(2)], nextPage: null }),
    } as Response);
    render();
    intersect([{ isIntersecting: true }]);
    intersect([{ isIntersecting: true }]);
    await vi.waitFor(() => expect(harness.states[1]).toBeNull());
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/newsletter/briefing?page=2&category=business");
    expect((harness.states[0] as { id: number }[]).map(post => post.id)).toEqual([1, 2]);
    expect(harness.states[2]).toBe(false);
  });

  it("keeps the failed page available for retry without discarding articles", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    render();
    intersect([{ isIntersecting: true }]);
    await vi.waitFor(() => expect(harness.states[3]).toBe(true));
    expect(harness.states[1]).toBe(2);
    expect(harness.states[0]).toEqual([article(1)]);
    expect(harness.states[2]).toBe(false);
  });

  it("aborts pending requests and disconnects the observer on unmount", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    const cleanups = render();
    intersect([{ isIntersecting: true }]);
    const signal = vi.mocked(fetch).mock.calls[0][1]?.signal;
    cleanups.forEach(cleanup => cleanup?.());
    expect(signal?.aborted).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it("makes no request after the final page", () => {
    render(null);
    expect(fetch).not.toHaveBeenCalled();
    expect(harness.effects).toHaveLength(2);
  });
});
