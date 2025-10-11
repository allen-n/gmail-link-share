/* eslint-disable no-console */
/**
 * Content script: observes Gmail DOM, injects buttons, and copies deep links.
 * Uses robust selectors Gmail has kept stable for years: [data-legacy-message-id] for bubbles and [data-legacy-thread-id] for rows.
 */

let settings = { conv: true, list: true };

/**
 * Create a button element for copying deep links.
 * @param {() => Promise<string>} getUrlFn Async function returning the deep link URL.
 * @param {boolean} isListView Whether this is for the thread list view (use icon-only style).
 * @returns {HTMLButtonElement} The button element.
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
 * @param {string} text Message text.
 * @param {boolean} isSuccess Whether this is a success message.
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
