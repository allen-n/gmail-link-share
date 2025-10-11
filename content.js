/* eslint-disable no-console */
/**
 * Content script: observes Gmail DOM, injects buttons, and copies deep links.
 * Uses robust selectors Gmail has kept stable for years: [data-legacy-message-id] for bubbles and [data-legacy-thread-id] for rows.
 */

/**
 * Extension settings object structure
 * @typedef {Object} ExtensionSettings
 * @property {boolean} conv - Show copy buttons in conversation view (message bubbles)
 * @property {boolean} list - Show copy buttons in thread list view (inbox rows)
 */

/**
 * Request message sent to service worker
 * @typedef {Object} ServiceWorkerRequest
 * @property {string} type - Message type: "getDeepLinkForMessage" or "getDeepLinkForThreadLast"
 * @property {string} [gmailMessageId] - Gmail message ID (for getDeepLinkForMessage)
 * @property {string} [threadId] - Gmail thread ID (for getDeepLinkForThreadLast)
 */

/**
 * Response message from service worker
 * @typedef {Object} ServiceWorkerResponse
 * @property {boolean} ok - Whether operation succeeded
 * @property {string} [url] - Deep link URL (on success)
 * @property {string} [error] - Error message (on failure)
 */

/**
 * Settings change message from popup/options pages
 * @typedef {Object} SettingsChangeMessage
 * @property {string} type - Message type: "settingsChanged"
 * @property {ExtensionSettings} settings - Updated settings object
 */

/**
 * Current extension settings
 * @type {ExtensionSettings}
 */
let settings = { conv: true, list: true };

/**
 * Create a button element for copying deep links.
 * Button includes icon and optional text label. Handles click event to copy URL to clipboard.
 * @param {function(): Promise<string>} getUrlFn - Async function returning the deep link URL
 * @param {boolean} [isListView=false] - Whether this is for the thread list view (use icon-only style)
 * @returns {HTMLButtonElement} The button element with click handler attached
 */
function createButton(getUrlFn, isListView = false) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = isListView ? "gdlc-btn gdlc-btn-icon" : "gdlc-btn";
  btn.title = "Copy conversation link";
  btn.setAttribute("aria-label", "Copy conversation link");
  
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("logo/logo-16.png");
  img.alt = "";
  img.className = "gdlc-icon";
  
  if (isListView) {
    btn.appendChild(img);
  } else {
    btn.appendChild(img);
    const text = document.createElement("span");
    text.textContent = " Copy link";
    text.style.marginLeft = "4px";
    btn.appendChild(text);
  }
  
  btn.addEventListener("click", async e => {
    e.stopPropagation();
    btn.classList.add("gdlc-btn-clicked");
    setTimeout(() => btn.classList.remove("gdlc-btn-clicked"), 600);
    
    try {
      const url = await getUrlFn();
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", true);
    } catch (err) {
      console.error(err);
      showToast("Failed to copy link. Please try again.", false);
    }
  });
  
  return btn;
}

/**
 * Show a toast notification with a message.
 * Toast appears at bottom-right, auto-dismisses after 2.5 seconds.
 * @param {string} text - Message text to display
 * @param {boolean} isSuccess - Whether this is a success message (green checkmark) or error (red X)
 * @returns {void}
 */
function showToast(text, isSuccess) {
  const existingToast = document.querySelector(".gdlc-toast");
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement("div");
  toast.className = "gdlc-toast";
  
  const icon = document.createElement("span");
  icon.className = isSuccess ? "gdlc-toast-icon gdlc-toast-icon-success" : "gdlc-toast-icon gdlc-toast-icon-error";
  icon.textContent = isSuccess ? "✓" : "✗";
  
  const message = document.createElement("span");
  message.className = "gdlc-toast-message";
  message.textContent = text;
  
  toast.appendChild(icon);
  toast.appendChild(message);
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add("show"));
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * For conversation view, find message header bars and inject buttons.
 * Each message bubble has [data-legacy-message-id]. Button is placed before the star button.
 * Strategy: Look for structural patterns (role="checkbox", aria-label with "starred") rather than class names.
 * @param {Document|HTMLElement} [root=document] - Root element to scan (defaults to entire document)
 * @returns {void}
 */
function scanConversationView(root = document) {
  if (!settings.conv) return;
  const bubbles = root.querySelectorAll('[data-legacy-message-id]');
  bubbles.forEach(bubble => {
    const gmailMessageId = bubble.getAttribute('data-legacy-message-id');
    if (!gmailMessageId) return;
    
    if (bubble.querySelector('.gdlc-btn')) return;
    
    let starButton = bubble.querySelector('[role="checkbox"][aria-label*="tarred"]');
    if (!starButton) {
      starButton = bubble.querySelector('div[role="checkbox"][aria-checked]');
    }
    
    if (!starButton || !starButton.parentElement) return;
    
    const container = starButton.parentElement;
    
    const btn = createButton(async () => {
      const res = await chrome.runtime.sendMessage({ type: "getDeepLinkForMessage", gmailMessageId });
      if (!res?.ok) throw new Error(res?.error || "Unknown error");
      return res.url;
    }, false);
    
    container.insertBefore(btn, starButton);
  });
}

/**
 * For thread list view, place a button just after the checkbox cell.
 * Clicking copies the deep link for the last message in the thread.
 * Strategy: Find thread ID from nested span, traverse to row, find checkbox cell, insert new cell after it.
 * @param {Document|HTMLElement} [root=document] - Root element to scan (defaults to entire document)
 * @returns {void}
 */
function scanThreadListView(root = document) {
  if (!settings.list) return;
  
  const threadSpans = root.querySelectorAll('span[data-legacy-thread-id]');
  
  threadSpans.forEach(threadSpan => {
    const threadId = threadSpan.getAttribute('data-legacy-thread-id');
    if (!threadId) return;
    
    const row = threadSpan.closest('tr');
    if (!row || row.querySelector('.gdlc-btn')) return;
    
    const checkboxDiv = row.querySelector('div[role="checkbox"]');
    if (!checkboxDiv) return;
    
    const checkboxCell = checkboxDiv.closest('td');
    if (!checkboxCell) return;
    
    const newCell = document.createElement('td');
    newCell.className = 'xY';
    newCell.classList.add('gdlc-cell');
    newCell.style.paddingLeft = '4px';
    newCell.style.verticalAlign = 'middle';
    
    const btn = createButton(async () => {
      const res = await chrome.runtime.sendMessage({ type: "getDeepLinkForThreadLast", threadId });
      if (!res?.ok) throw new Error(res?.error || "Unknown error");
      return res.url;
    }, true);
    
    newCell.appendChild(btn);
    
    checkboxCell.parentNode.insertBefore(newCell, checkboxCell.nextSibling);
  });
}

/**
 * Master observer that re-scans on Gmail's SPA mutations.
 * Sets up MutationObserver to detect DOM changes and inject buttons as needed.
 * Runs initial scan immediately after setup.
 * @returns {void}
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

/**
 * Remove all injected copy link buttons and their container cells from the page.
 * Used when settings change to refresh button visibility.
 * Removes both .gdlc-btn elements (conversation view) and .gdlc-cell elements (thread list view).
 * @returns {void}
 */
function removeAllButtons() {
  document.querySelectorAll('.gdlc-btn').forEach(btn => btn.remove());
  document.querySelectorAll('.gdlc-cell').forEach(cell => cell.remove());
}

/**
 * Listen for settings changes from popup/options pages.
 * When settings change, removes all buttons and re-scans based on new settings.
 * @param {SettingsChangeMessage} msg - Message from popup/options
 * @param {chrome.runtime.MessageSender} _sender - Sender info (unused)
 * @param {function(*): void} _sendResponse - Response callback (unused)
 * @returns {void}
 */
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.type === 'settingsChanged') {
    settings = msg.settings;
    removeAllButtons();
    scanConversationView();
    scanThreadListView();
  }
});

/**
 * Initialize content script on page load.
 * Loads settings from chrome.storage.sync and starts DOM observer.
 * @returns {Promise<void>}
 */
chrome.storage.sync.get({ conv: true, list: true }).then(v => {
  settings = v;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
});
