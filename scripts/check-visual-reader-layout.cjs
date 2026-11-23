// Usage: node scripts/check-visual-reader-layout.cjs <article-preview-URL>
// Runs in local Chromium; changes only the browser DOM, never saved article data.
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const WebSocket = require("ws");

const articleUrl = process.argv[2];
if (!articleUrl || !/^https?:\/\//.test(articleUrl)) {
  console.error("Provide a full preview article URL with at least one image or YouTube embed.");
  process.exit(1);
}

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "visual-reader-layout-"));
  const browser = spawn("chromium", [
    "--headless", "--no-sandbox", "--disable-dev-shm-usage",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let socket;
  let closeBrowser;
  try {
    const endpoint = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Chromium did not start")), 15000);
      let log = "";
      browser.stderr.on("data", chunk => {
        log += chunk;
        const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
      browser.once("error", error => { clearTimeout(timeout); reject(error); });
    });
    const port = new URL(endpoint).port;
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    socket = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.once("open", resolve); socket.once("error", reject); });
    let sequence = 0;
    const pending = new Map();
    socket.on("message", raw => {
      const response = JSON.parse(raw);
      const job = pending.get(response.id);
      if (!job) return;
      pending.delete(response.id);
      response.error ? job.reject(new Error(JSON.stringify(response.error))) : job.resolve(response.result);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
    closeBrowser = () => send("Browser.close").catch(() => {});
    const evaluate = async expression => {
      const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
      return response.result.value;
    };
    const waitFor = async expression => {
      for (let attempt = 0; attempt < 150; attempt++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error(`Timed out waiting for ${expression}`);
    };
    await send("Page.enable");
    await send("Network.enable");
    // Test our layout/player lifecycle independently of YouTube availability.
    await send("Network.setBlockedURLs", { urls: [
      "*youtube.com/*", "*youtube-nocookie.com/*", "*googletagmanager.com/*", "*google-analytics.com/*",
    ] });

    for (const [width, height] of [[320, 740], [390, 844], [430, 932], [844, 390], [1440, 900]]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: 1, mobile: width < 900,
      });
      await send("Page.navigate", { url: articleUrl });
      await waitFor(`!!document.querySelector('button[aria-haspopup="dialog"]')`);
      await evaluate(`(() => {
        window.scrollTo(0, 100);
        window.__readerOpeningY = scrollY;
        document.querySelector('button[aria-haspopup="dialog"]').click();
      })()`);
      await waitFor(`!!document.querySelector('[data-visual-overlay]')`);
      // Force layout after focus runs, the point that previously moved Safari sideways.
      await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
      const result = await evaluate(`(() => {
        const overlay = document.querySelector('[data-visual-overlay]');
        const pane = overlay.querySelector('[data-visual-reader-pane]');
        const stage = overlay.querySelector('[data-visual-media-stage]');
        const article = pane.querySelector('.blog-article-body');
        overlay.querySelector('[aria-label="Selected article media"] p').textContent = 'LongUnbrokenArticleTitle'.repeat(40);
        const stress = document.createElement('div');
        stress.innerHTML = '<p>' + 'https://example.com/long-unbroken-url/'.repeat(35) + '</p><table style="width:2000px"><tbody><tr><td>' + 'TableText'.repeat(50) + '</td></tr></tbody></table><pre style="width:2000px">' + 'code_line_'.repeat(100) + '</pre>';
        article.append(stress);
        const rect = element => {
          const r = element.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, height: r.height, width: r.width };
        };
        window.__readerFrame = stage.querySelector('iframe');
        window.__readerStageY = stage.getBoundingClientRect().top;
        pane.scrollTop = 300;
        return {
          viewport: innerWidth, scrollX, overlay: rect(overlay), pane: rect(pane), stage: rect(stage),
          video: window.__readerFrame ? rect(window.__readerFrame) : null,
          overlayScroll: overlay.scrollWidth - overlay.clientWidth,
          paneScroll: pane.scrollWidth - pane.clientWidth, scrolled: pane.scrollTop,
          rounded: parseFloat(getComputedStyle(pane).borderRadius) > 0,
          gap: pane.getBoundingClientRect().top - stage.parentElement.getBoundingClientRect().bottom,
        };
      })()`);
      for (const name of ["overlay", "pane", "stage"]) {
        assert(result[name].left >= -1 && result[name].right <= result.viewport + 1, `${width}: ${name} exceeded viewport`);
      }
      assert(Math.abs(result.viewport - width) <= 1, `${width}: browser is not using the requested mobile viewport`);
      assert(result.overlayScroll <= 1 && result.paneScroll <= 1, `${width}: horizontal content overflow`);
      if (result.video) {
        assert(result.video.left >= result.stage.left - 1 && result.video.right <= result.stage.right + 1, `${width}: video escaped the media panel`);
        assert(Math.abs(result.video.left + result.video.width / 2 - result.stage.left - result.stage.width / 2) <= 2, `${width}: video is off-center`);
      }
      assert(Math.abs(result.scrollX) <= 1, `${width}: focusing close button scrolled page horizontally`);
      assert(result.pane.height > (height < 500 ? 90 : 180), `${width}: article pane is too short`);
      assert(result.scrolled > 0 && result.rounded && result.gap >= 6, `${width}: separated scrollable panel missing`);
      assert(await evaluate(`window.__readerStageY === document.querySelector('[data-visual-media-stage]').getBoundingClientRect().top`), "Article scrolling moved viewer");
      assert(await evaluate(`window.__readerFrame === document.querySelector('[data-visual-media-stage] iframe')`), "Article scrolling remounted player");

      const hasImage = await evaluate(`!!document.querySelector('[data-visual-reader-pane] img[data-visual-media-id]')`);
      if (hasImage) {
        await evaluate(`document.querySelector('[data-visual-reader-pane] img[data-visual-media-id]').click()`);
        await waitFor(`!document.querySelector('[data-visual-media-stage] iframe')`);
        await evaluate("new Promise(resolve => requestAnimationFrame(resolve))");
        assert.equal(await evaluate("location.pathname"), new URL(articleUrl).pathname, "Selecting linked image navigated away");
        const centered = await evaluate(`(() => {
          const stage = document.querySelector('[data-visual-media-stage]');
          const image = stage.querySelector('img');
          if (!image) return true; // Explicit unavailable-image state is supported.
          const a = stage.getBoundingClientRect(), b = image.getBoundingClientRect();
          return Math.abs((a.left + a.right - b.left - b.right) / 2) <= 2 && b.width <= a.width + 1 && b.height <= a.height + 1;
        })()`);
        assert(centered, "Selected portrait image is not centered/contained");
      }
      if (width === 390) {
        const screenshot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(path.join(os.tmpdir(), "visual-reader-layout-mobile.png"), Buffer.from(screenshot.data, "base64"));
      }
      await evaluate(`document.querySelector('[data-visual-overlay]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
      await waitFor(`!document.querySelector('[data-visual-overlay]')`);
      await evaluate("new Promise(resolve => requestAnimationFrame(resolve))");
      assert(await evaluate("document.body.style.position !== 'fixed' && Math.abs(scrollY - window.__readerOpeningY) <= 2"), "Closing reader lost page position");
      console.log(`PASS ${width}x${height}: contained panels, wrapped content, stationary viewer, ${hasImage ? "image selection, " : ""}scroll restoration`);
    }
  } finally {
    if (socket?.readyState === WebSocket.OPEN && closeBrowser) {
      await Promise.race([closeBrowser(), new Promise(resolve => setTimeout(resolve, 1000))]);
    }
    socket?.close();
    browser.kill("SIGTERM");
    await new Promise(resolve => browser.exitCode !== null ? resolve() : browser.once("exit", resolve));
    try {
      await fs.promises.rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    } catch {
      console.warn("Chromium is still releasing its temporary profile; the OS will reclaim it.");
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
