/* eslint-disable no-console */
/**
 * Content script: observes Gmail DOM, injects buttons, and copies deep links.
 * Uses robust selectors Gmail has kept stable for years: [data-legacy-message-id] for bubbles and [data-legacy-thread-id] for rows.
 */

let settings = { conv: true, list: true };

/**
 * Insert a button next to a target element if not already inserted.
 * @param {Element} host Where to place the button.
 * @param {() => Promise<string>} getUrlFn Async function returning the deep link URL.
 */
function ensureButton(host, getUrlFn) {
  if (!host || host.querySelector(".gdlc-btn")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "gdlc-btn";
  btn.title = "Copy deep link";
  btn.setAttribute("aria-label", "Copy deep link");
  btn.textContent = "⧉ Copy link";
  btn.addEventListener("click", async e => {
    e.stopPropagation();
    try {
      const url = await getUrlFn();
      await navigator.clipboard.writeText(url);
      showToast("Deep link copied");
    } catch (err) {
      console.error(err);
      showToast("Failed to copy deep link");
    }
  });
  host.appendChild(btn);
}

/**
 * Show a transient toast message in Gmail UI.
 * @param {string} text Message text.
 */
function showToast(text) {
  let toast = document.createElement("div");
  toast.className = "gdlc-toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 1400);
}

/**
 * For conversation view, find message header bars and inject buttons.
 * Each message bubble usually has a container with [data-legacy-message-id] and a header bar with class ".gH".
 */
function scanConversationView(root = document) {
  if (!settings.conv) return;
  const bubbles = root.querySelectorAll('[data-legacy-message-id]');
  bubbles.forEach(bubble => {
    const gmailMessageId = bubble.getAttribute('data-legacy-message-id');
    if (!gmailMessageId) return;
    const headerBar = bubble.querySelector('.gH') || bubble;
    ensureButton(headerBar, async () => {
      const res = await chrome.runtime.sendMessage({ type: "getDeepLinkForMessage", gmailMessageId });
      if (!res?.ok) throw new Error(res?.error || "Unknown error");
      return res.url;
    });
  });
}

/**
 * For thread list view, place a button within each row (anchor container) that has [data-legacy-thread-id].
 * Clicking copies the deep link for the last message in the thread.
 */
function scanThreadListView(root = document) {
  if (!settings.list) return;
  const rows = root.querySelectorAll('[data-legacy-thread-id]');
  rows.forEach(row => {
    const threadId = row.getAttribute('data-legacy-thread-id');
    if (!threadId) return;
    const subject = row.querySelector('span.bog') || row;
    ensureButton(subject.parentElement || row, async () => {
      const res = await chrome.runtime.sendMessage({ type: "getDeepLinkForThreadLast", threadId });
      if (!res?.ok) throw new Error(res?.error || "Unknown error");
      return res.url;
    });
  });
}

/**
 * Master observer that re-scans on Gmail's SPA mutations.
 */
function startObserver() {
  const observer = new MutationObserver(muts => {
    let needScan = false;
    for (const m of muts) {
      if (m.addedNodes && m.addedNodes.length) { needScan = true; break; }
    }
    if (needScan) {
      scanConversationView();
      scanThreadListView();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  scanConversationView();
  scanThreadListView();
}

function removeAllButtons() {
  document.querySelectorAll('.gdlc-btn').forEach(btn => btn.remove());
}

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.type === 'settingsChanged') {
    settings = msg.settings;
    removeAllButtons();
    scanConversationView();
    scanThreadListView();
  }
});

chrome.storage.sync.get({ conv: true, list: true }).then(v => {
  settings = v;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
});
