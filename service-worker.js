/* eslint-disable no-console */
/**
 * Background service worker: token management, Gmail API calls, deep link building.
 * All functions are documented with JSDoc for clarity and future maintenance.
 */

/**
 * Gmail API Message resource structure (metadata format)
 * @typedef {Object} GmailMessageResource
 * @property {string} id - Gmail message ID
 * @property {string} threadId - Gmail thread ID
 * @property {Object} payload - Message payload
 * @property {Array<{name: string, value: string}>} payload.headers - Message headers
 */

/**
 * Gmail API Thread resource structure (metadata format)
 * @typedef {Object} GmailThreadResource
 * @property {string} id - Gmail thread ID
 * @property {GmailMessageResource[]} messages - Array of messages in thread
 */

/**
 * Cache entry for storing Message-ID headers
 * @typedef {Object} HeaderCacheEntry
 * @property {string} header - Normalized Message-ID (without angle brackets)
 * @property {number} ts - Timestamp when cached (milliseconds since epoch)
 */

/**
 * Request message from content script to service worker
 * @typedef {Object} MessageRequest
 * @property {string} type - Message type: "getDeepLinkForMessage" or "getDeepLinkForThreadLast"
 * @property {string} [gmailMessageId] - Gmail message ID (for getDeepLinkForMessage)
 * @property {string} [threadId] - Gmail thread ID (for getDeepLinkForThreadLast)
 */

/**
 * Response message from service worker to content script
 * @typedef {Object} MessageResponse
 * @property {boolean} ok - Whether operation succeeded
 * @property {string} [url] - Deep link URL (on success)
 * @property {string} [error] - Error message (on failure)
 */

/**
 * Cache for Message-ID headers with timestamp-based expiration
 * Key format: "msg:{gmailMessageId}" or "thread-last:{threadId}"
 * @type {Map<string, HeaderCacheEntry>}
 */
const headerCache = new Map();

/**
 * Cache TTL in milliseconds (2 minutes)
 * @type {number}
 * @constant
 */
const CACHE_TTL_MS = 2 * 60 * 1000;

/**
 * Get an OAuth token for the requested scopes using chrome.identity.
 * Always requests non-interactively first; falls back to interactive on demand.
 * @param {boolean} [interactive=false] - Whether to show the account chooser/consent if needed
 * @returns {Promise<string>} Bearer token for Gmail API authentication
 * @throws {Error} If token retrieval fails or user denies consent
 */
async function getToken(interactive = false) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message || "No token"));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Fetch JSON with automatic token injection and 401 retry (token invalidation).
 * First attempts non-interactive auth, falls back to interactive if needed.
 * On 401, invalidates cached token and retries once.
 * @param {string} url - Gmail API REST endpoint URL
 * @returns {Promise<GmailMessageResource|GmailThreadResource>} Parsed JSON response
 * @throws {Error} If API returns non-OK status or network error occurs
 */
async function authedGetJson(url) {
  let token = await getToken(false).catch(() => null);
  if (!token) token = await getToken(true);
  let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    // Invalidate and retry once interactively.
    await new Promise((r) =>
      chrome.identity.getAuthToken(
        { interactive: false },
        (t) => t && chrome.identity.removeCachedAuthToken({ token: t }, r)
      )
    );
    token = await getToken(true);
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  }
  if (!res.ok) throw new Error(`Gmail API ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Extract a single header value by name from a Gmail API Message resource.
 * Search is case-insensitive.
 * @param {GmailMessageResource} message - Gmail API message JSON (format=metadata)
 * @param {string} name - Header name, e.g., "Message-ID"
 * @returns {string|null} Header value or null if header not found
 */
function getHeader(message, name) {
  const headers = message?.payload?.headers || [];
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : null;
}

/**
 * Normalize RFC822 Message-ID by stripping angle brackets if present.
 * RFC 5322 Message-IDs are typically wrapped in angle brackets: <id@domain>
 * @param {string} raw - Raw header value, e.g., "<abc@x.com>"
 * @returns {string} Normalized value without angle brackets, e.g., "abc@x.com"
 */
function normalizeMessageId(raw) {
  return raw.replace(/^<|>$/g, "");
}

/**
 * Build a Gmail rfc822msgid deep link for a given Message-ID (without angle brackets).
 * No user index (/u/0) is included for universality across multi-account setups.
 * @param {string} normalizedMessageId - Message-ID without angle brackets
 * @returns {string} Fully URL-escaped Gmail deep link using rfc822msgid search operator
 * @example
 * buildDeepLink("abc@mail.gmail.com")
 * // returns "https://mail.google.com/mail/#search/rfc822msgid%3Aabc%40mail.gmail.com"
 */
function buildDeepLink(normalizedMessageId) {
  return `https://mail.google.com/mail/#search/rfc822msgid%3A${encodeURIComponent(
    normalizedMessageId
  )}`;
}

/**
 * Get RFC822 Message-ID for a Gmail message by its Gmail messageId.
 * Uses metadata format to keep payload small. Results are cached for 2 minutes.
 * @param {string} gmailMessageId - Gmail message resource ID
 * @returns {Promise<string>} Normalized Message-ID without angle brackets
 * @throws {Error} If Message-ID header is not found or API call fails
 */
async function getMessageIdHeaderByMessage(gmailMessageId) {
  const cacheKey = `msg:${gmailMessageId}`;
  const now = Date.now();
  const cached = headerCache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return { normalized: cached.header, message: cached.message };
  }
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(gmailMessageId)}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=From&metadataHeaders=To&metadataHeaders=CC&metadataHeaders=Subject`;
  const message = await authedGetJson(url);
  const raw = getHeader(message, "Message-ID");
  if (!raw) throw new Error("Message-ID header not found");
  const normalized = normalizeMessageId(raw);
  headerCache.set(cacheKey, { header: normalized, message: message, ts: now });
  return { normalized, message };
}

/**
 * Get RFC822 Message-ID for the last message in a thread.
 * Fetches entire thread and extracts Message-ID from the last message.
 * Results are cached for 2 minutes.
 * @param {string} threadId - Gmail thread ID
 * @returns {Promise<string>} Normalized Message-ID of last message in thread
 * @throws {Error} If thread has no messages, Message-ID not found, or API call fails
 */
async function getMessageIdHeaderForLastInThread(threadId) {
  const cacheKey = `thread-last:${threadId}`;
  const now = Date.now();
  const cached = headerCache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return { normalized: cached.header, message: cached.message };
  }
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads/${encodeURIComponent(threadId)}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=From&metadataHeaders=To&metadataHeaders=CC&metadataHeaders=Subject`;
  const thread = await authedGetJson(url);
  const last = thread.messages?.[thread.messages.length - 1];
  if (!last) throw new Error("Thread has no messages");
  const raw = getHeader(last, "Message-ID");
  if (!raw) throw new Error("Message-ID header not found");
  const normalized = normalizeMessageId(raw);
  headerCache.set(cacheKey, { header: normalized, message: last, ts: now });
  return { normalized, message: last };
}

/**
 * Parse email addresses from a header value.
 * Handles formats like "Name <email@example.com>, Other <other@example.com>"
 * @param {string|null} headerValue - Header value containing email addresses
 * @returns {string[]} Array of email addresses
 */
function parseEmailAddresses(headerValue) {
  if (!headerValue) return [];
  const matches = headerValue.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  );
  return matches || [];
}

/**
 * Save email history entry to chrome.storage.local.
 * Checks if history saving is enabled before saving.
 * @param {string} url - Deep link URL
 * @param {GmailMessageResource} message - Gmail message with headers
 * @returns {Promise<void>}
 */
async function saveToHistory(url, message) {
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get({ saveHistory: true }, resolve);
  });

  if (!settings.saveHistory) return;

  const subject = getHeader(message, "Subject") || "(No subject)";
  const from = parseEmailAddresses(getHeader(message, "From"));
  const to = parseEmailAddresses(getHeader(message, "To"));
  const cc = parseEmailAddresses(getHeader(message, "CC"));
  const messageId = getHeader(message, "Message-ID");

  const entry = {
    id: `${Date.now()}-${message.id}`,
    timestamp: Date.now(),
    url,
    subject,
    from,
    to,
    cc,
    messageId: messageId ? normalizeMessageId(messageId) : null,
  };

  const { emailHistory = [] } = await new Promise((resolve) => {
    chrome.storage.local.get({ emailHistory: [] }, resolve);
  });

  emailHistory.unshift(entry);

  const maxEntries = 1000;
  if (emailHistory.length > maxEntries) {
    emailHistory.splice(maxEntries);
  }

  await new Promise((resolve) => {
    chrome.storage.local.set({ emailHistory }, resolve);
  });
}

/**
 * Message router for content script requests.
 * Handles deep link generation requests from content script.
 * @param {MessageRequest} msg - Request message from content script
 * @param {chrome.runtime.MessageSender} _sender - Message sender info (unused)
 * @param {function(MessageResponse): void} sendResponse - Response callback
 * @returns {boolean} True to keep message channel open for async response
 */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "getDeepLinkForMessage") {
        const { normalized, message } = await getMessageIdHeaderByMessage(
          msg.gmailMessageId
        );
        const url = buildDeepLink(normalized);
        await saveToHistory(url, message);
        sendResponse({ ok: true, url });
      } else if (msg?.type === "getDeepLinkForThreadLast") {
        const { normalized, message } = await getMessageIdHeaderForLastInThread(
          msg.threadId
        );
        const url = buildDeepLink(normalized);
        await saveToHistory(url, message);
        sendResponse({ ok: true, url });
      } else {
        sendResponse({ ok: false, error: "Unknown message type" });
      }
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
  })();
  return true;
});
