# Gmail Deep Link Copier - Claude Configuration

## Project Overview

A Chrome Extension (Manifest V3) that adds "Copy link" buttons in Gmail to create deep links to specific messages using RFC822 Message-ID. The extension integrates seamlessly into Gmail's UI with buttons in both conversation view and thread list view.

**Key Technology:** Chrome Extension Manifest V3, Vanilla JavaScript, Gmail API, OAuth 2.0

## Design Language & Visual Style

### Target Design System: Mindful Healthcare Template

The extension should adopt the clean, calming, professional aesthetic from the Mindful healthcare website template (https://mindful-template.webflow.io/):

#### Color Palette
- **Primary Background**: White (#FFFFFF) and soft off-white (#F8F9FA)
- **Text Primary**: Dark charcoal (#202124, #3C4043)
- **Text Secondary**: Medium gray (#5F6368, #666666)
- **Borders**: Light gray with transparency (rgba(60,64,67,0.3), #E0E0E0)
- **Accent/Primary**: Soft teal/blue (#34A853 for success states)
- **Error/Warning**: Soft red (#EA4335)
- **Hover States**: Very light gray overlay (rgba(60,64,67,0.08))

#### Typography
- **Font Family**: System fonts prioritizing readability
  - Primary: `system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`
  - Fallback chain ensures cross-platform consistency
- **Font Sizes**:
  - Body text: 14px
  - Small text: 12px
  - Headings: 16px (popup/options)
  - Line height: 1.4 for body text
- **Font Weights**: Regular (400) for body, no bold in UI elements currently

#### Spacing & Layout
- **Padding/Margins**: Consistent 8px, 12px, 16px increments
  - Small spacing: 4px (icon gaps)
  - Medium spacing: 8px (button padding)
  - Large spacing: 16px (page margins)
- **Border Radius**:
  - Buttons: 4px (subtle rounding)
  - Toast notifications: 8px (more pronounced)
  - Icon buttons: 50% (perfect circles)

#### Component Styles

**Buttons:**
- Soft, approachable style with subtle borders
- Light background with gentle hover transitions
- Icon-first design with optional text labels
- Rounded corners (4px) for modern feel
- Elevation: Minimal, flat design with border definition

**Toast Notifications:**
- Card-style with shadow for elevation
- Clean white background
- Colored circular icons (success: green, error: red)
- Smooth slide-up animation (translateY)
- Bottom-right positioning (fixed)

**Icons:**
- 16px standard size (14px in compact buttons)
- Opacity: 0.7 default, 1.0 on hover
- Smooth transitions (0.2s ease)
- Logo-based (currently custom icon, should be simple and recognizable)

#### Animation & Interaction
- **Timing**: Fast and responsive (0.2s for most transitions)
- **Easing**: `ease` for natural feel, `ease-out` for exit animations
- **Hover Effects**:
  - Background color change (subtle gray overlay)
  - Scale transform (1.1x for icons)
  - Opacity increase on icons
- **Click Feedback**:
  - Flash-pulse animation (0.6s) on button click
  - Scale up then settle animation (1 → 1.3 → 1.1 → 1.3 → 1)
- **Toast Entrance**: Opacity 0→1 with translateY(8px→0)

#### Accessibility Considerations
- ARIA labels on all interactive elements
- Role attributes for semantic meaning
- Keyboard navigation support (native button elements)
- High contrast text (meets WCAG standards)
- Tooltips on icon-only buttons (title attribute)

#### Mindful-Inspired Design Principles
1. **Calm & Professional**: Soft colors, ample whitespace, no harsh contrasts
2. **Trust & Reliability**: Consistent styling, clear feedback, predictable interactions
3. **Simplicity**: Minimal UI, focus on core functionality, avoid clutter
4. **Modern**: Rounded corners, smooth animations, system fonts
5. **Healthcare-Grade Polish**: Attention to detail, refined micro-interactions

### Current Implementation Gap Analysis

**What matches the Mindful aesthetic:**
- ✅ Soft color palette (grays, whites)
- ✅ Rounded corners (4px buttons, 8px toasts)
- ✅ System font stack
- ✅ Gentle hover states
- ✅ Clean, minimal design

**What could be improved:**
- ⚠️ Icon design (currently generic logo, could be more distinctive)
- ⚠️ Options page styling (very basic, could use Mindful card-based layout)
- ⚠️ Popup styling (functional but could have more visual polish)
- ⚠️ No color theming beyond success/error (could add subtle brand color)
- ⚠️ Typography could use hierarchy (varying weights, sizes)

## Architecture

### File Structure
```
gmail-deeplinker/
├── manifest.json           # Extension configuration (Manifest V3)
├── service-worker.js       # Background script: OAuth, Gmail API, caching
├── content.js             # Content script: DOM observation, button injection
├── content.css            # Styles for injected UI elements
├── popup.html             # Extension popup (toolbar icon click)
├── popup.js               # Popup functionality
├── options.html           # Settings page (right-click → Options)
├── options.js             # Options page functionality
├── logo/                  # Extension icons (16, 32, 48, 128, 512)
│   ├── logo-16.png
│   ├── logo-32.png
│   ├── logo-48.png
│   ├── logo-128.png
│   ├── logo-512.png
│   └── logo.svg
├── README.md              # User-facing documentation
├── ARCHITECTURE.md        # Technical architecture details
└── CLAUDE.md             # This file: AI agent configuration
```

### Key Components

#### 1. Content Script (`content.js`)
**Purpose:** Observes Gmail DOM and injects "Copy link" buttons

**Key Functions:**
- `startObserver()` - MutationObserver for Gmail's SPA
- `scanConversationView()` - Finds `[data-legacy-message-id]` bubbles
- `scanThreadListView()` - Finds `[data-legacy-thread-id]` rows
- `createButton()` - Creates button element with click handler
- `showToast()` - Displays success/error notifications

**DOM Selectors (Stable):**
- `[data-legacy-message-id]` - Gmail message bubble identifier
- `[data-legacy-thread-id]` - Gmail thread row identifier
- `[role="checkbox"][aria-label*="tarred"]` - Star button (conversation view)
- `div[role="checkbox"]` - Checkbox elements

**Integration Strategy:**
- Uses MutationObserver to detect Gmail's dynamic DOM updates
- Injects buttons near existing Gmail controls (star button, checkbox)
- Gracefully handles DOM changes without breaking Gmail

#### 2. Service Worker (`service-worker.js`)
**Purpose:** OAuth token management, Gmail API calls, link generation

**Key Functions:**
- `getToken(interactive)` - OAuth via Chrome Identity API
- `authedGetJson(url)` - Authenticated fetch with 401 retry
- `getMessageIdHeaderByMessage(gmailMessageId)` - Fetch Message-ID for message
- `getMessageIdHeaderForLastInThread(threadId)` - Fetch Message-ID for thread
- `normalizeMessageId(raw)` - Strip angle brackets from Message-ID
- `buildDeepLink(messageId)` - Construct Gmail search URL

**Caching:**
- In-memory Map with 2-minute TTL
- Keys: `msg:{gmailMessageId}` or `thread-last:{threadId}`
- Reduces API calls for repeated requests

**Error Handling:**
- Non-interactive token request first → fallback to interactive
- 401 errors trigger token invalidation and retry
- All errors returned as `{ ok: false, error: string }`

#### 3. Options/Settings (`options.html`, `popup.html`)
**Purpose:** User configuration for button visibility

**Settings:**
- `conv` - Enable buttons in conversation view (default: true)
- `list` - Enable buttons in thread list view (default: true)
- Stored in `chrome.storage.sync` (synced across devices)

**Current State:** Settings are saved but content.js checks them on load. Changes trigger button removal/re-injection.

### Data Flow

```
User clicks "Copy link" button
  ↓
content.js: Button click handler
  ↓
chrome.runtime.sendMessage({ type: "getDeepLinkForMessage", gmailMessageId })
  ↓
service-worker.js: onMessage listener
  ↓
Check cache for Message-ID header
  ↓ (cache miss)
Gmail API: GET /gmail/v1/users/me/messages/{id}?format=metadata&metadataHeaders=Message-ID
  ↓
Extract "Message-ID" header
  ↓
Normalize: "<abc@gmail.com>" → "abc@gmail.com"
  ↓
Build deep link: https://mail.google.com/mail/#search/rfc822msgid%3A{encoded}
  ↓
Cache result (2 min)
  ↓
sendResponse({ ok: true, url })
  ↓
content.js: Copy to clipboard
  ↓
navigator.clipboard.writeText(url)
  ↓
showToast("Link copied!", true)
```

### Deep Link Format

**URL Structure:**
```
https://mail.google.com/mail/#search/rfc822msgid%3A<URL-encoded-Message-ID>
```

**Example:**
```
https://mail.google.com/mail/#search/rfc822msgid%3ACABCdefGHI...%40mail.gmail.com
```

**Why RFC822 Message-ID?**
- Universal (RFC 5322 standard across all email systems)
- Stable (doesn't change when forwarding, archiving, switching accounts)
- Unique (guaranteed unique identifier per message)
- Portable (works for any user with message access)

**Why no `/u/0`?**
- Gmail uses `/u/N` for account index in multi-account setups
- Omitting it makes links work regardless of account order
- More universal for sharing across teams

## Permissions & Security

### Chrome Permissions
- `identity` - OAuth 2.0 authentication with Google
- `storage` - Save user preferences (synced)
- `scripting` - Inject content script into Gmail
- `activeTab` - Access active tab for injection
- `https://mail.google.com/*` - Gmail DOM access
- `https://gmail.googleapis.com/*` - Gmail API calls

### OAuth Scopes
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only Gmail access

### Security Measures
1. **Content Security Policy (CSP):**
   ```json
   "script-src 'self'; object-src 'none'; base-uri 'none';"
   ```
2. **No external scripts** - All code bundled locally
3. **Minimal permissions** - Read-only, no send/delete/modify
4. **No data collection** - Headers cached briefly in memory only
5. **No tracking** - Zero analytics or telemetry

### Privacy Guarantees
- Message-IDs fetched only on user action (button click)
- Data never sent to external servers (only Gmail API)
- No persistent storage of email content
- Cache cleared automatically (2-minute TTL)

## Development Guidelines

### Code Style
- **Language:** Vanilla JavaScript (ES6+)
- **Async:** Use `async/await` over Promise chains
- **Functions:** Arrow functions for callbacks, named functions for exports
- **Naming:** Descriptive, camelCase for functions/variables
- **Documentation:** JSDoc comments on all functions
- **No frameworks:** Pure JavaScript, no React/Vue/etc.
- **No build step:** Source files run directly (no Webpack/Rollup)

### Code Conventions
```javascript
// ✅ Good: JSDoc + async/await + descriptive naming
/**
 * Fetch Message-ID header for a Gmail message.
 * @param {string} gmailMessageId Gmail message resource ID.
 * @returns {Promise<string>} Normalized Message-ID without angle brackets.
 */
async function getMessageIdHeaderByMessage(gmailMessageId) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${gmailMessageId}`;
  const message = await authedGetJson(url);
  const raw = getHeader(message, "Message-ID");
  return normalizeMessageId(raw);
}

// ❌ Bad: No docs, callback hell, short names
function getHdr(id, cb) {
  fetch(url).then(r => r.json()).then(j => {
    cb(j.headers.find(h => h.name === "Message-ID").value);
  });
}
```

### CSS Conventions
```css
/* ✅ Good: Scoped class names, BEM-style, consistent spacing */
.gdlc-btn {
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.gdlc-btn:hover {
  background: rgba(60,64,67,0.08);
}

/* ❌ Bad: Generic names, no prefixes, magic numbers */
.btn {
  padding: 5px 9px;
}
```

### Testing
**Current State:** No automated tests (manual testing only)

**Manual Test Checklist:**
- [ ] Load extension in Chrome (`chrome://extensions` → Load unpacked)
- [ ] Authorize OAuth (first-time flow)
- [ ] Verify conversation view buttons appear
- [ ] Verify thread list view buttons appear
- [ ] Click button → verify clipboard contains URL
- [ ] Paste URL in new tab → verify correct message opens
- [ ] Test with multiple Gmail accounts
- [ ] Test in different views (inbox, sent, search, labels)
- [ ] Test error cases (revoke OAuth, disable API in Cloud Console)
- [ ] Test settings (disable conv/list, verify buttons removed)

**Future:** Consider Playwright for automated DOM testing

### Debugging

**Service Worker Console:**
```
chrome://extensions → "service worker" link under extension card
```
- View OAuth token flow
- Check Gmail API responses
- Monitor cache behavior

**Content Script Console:**
```
Open Gmail → F12 DevTools → Console tab
```
- View DOM mutations
- Check button injection
- Monitor clipboard operations

**Common Issues:**
- **401 Unauthorized:** Client ID mismatch or Gmail API not enabled
- **Buttons not appearing:** DOM selectors changed or page not loaded
- **"Unknown error":** Check service worker console for details
- **Clipboard fails:** Page must have focus (security restriction)

## Gmail API Reference

### Endpoint: Get Message
```
GET https://gmail.googleapis.com/gmail/v1/users/me/messages/{id}
  ?format=metadata
  &metadataHeaders=Message-ID
```

**Response:**
```json
{
  "id": "18bc123...",
  "threadId": "18bc123...",
  "payload": {
    "headers": [
      { "name": "Message-ID", "value": "<abc@mail.gmail.com>" }
    ]
  }
}
```

### Endpoint: Get Thread
```
GET https://gmail.googleapis.com/gmail/v1/users/me/threads/{id}
  ?format=metadata
  &metadataHeaders=Message-ID
```

**Response:**
```json
{
  "id": "18bc123...",
  "messages": [
    {
      "id": "18bc456...",
      "payload": {
        "headers": [
          { "name": "Message-ID", "value": "<xyz@mail.gmail.com>" }
        ]
      }
    }
  ]
}
```

## OAuth Setup (Google Cloud Console)

### Required Configuration
1. **Project:** Any Google Cloud project
2. **API:** Enable "Gmail API"
3. **Credentials Type:** OAuth 2.0 Client ID
4. **Application Type:** Chrome Extension
5. **Authorized Redirect URI:**
   ```
   https://<EXTENSION_ID>.chromiumapp.org/
   ```
   (Get extension ID from `chrome://extensions` after loading unpacked)

### manifest.json Configuration
```json
{
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/gmail.readonly"
    ]
  }
}
```

### First-Time Authorization Flow
1. User clicks button
2. `chrome.identity.getAuthToken({ interactive: false })` → fails (no cached token)
3. `chrome.identity.getAuthToken({ interactive: true })` → shows consent screen
4. User approves → token cached by Chrome
5. Subsequent requests use cached token (non-interactive)

## Common Development Tasks

### Add a New Button Location
1. **Identify Gmail DOM selector** (use DevTools to inspect)
2. **Add scan function** in `content.js`:
   ```javascript
   function scanNewLocation(root = document) {
     const elements = root.querySelectorAll('[data-some-id]');
     elements.forEach(el => {
       const id = el.getAttribute('data-some-id');
       if (!id || el.querySelector('.gdlc-btn')) return;
       
       const btn = createButton(async () => {
         const res = await chrome.runtime.sendMessage({ 
           type: "getDeepLinkForMessage", 
           gmailMessageId: id 
         });
         if (!res?.ok) throw new Error(res?.error);
         return res.url;
       });
       
       el.appendChild(btn);
     });
   }
   ```
3. **Call from observer:**
   ```javascript
   function startObserver() {
     // ... existing code ...
     scanNewLocation(); // Add this
   }
   ```

### Change Button Style
1. **Edit `content.css`** (all button styles centralized)
2. **Follow design language** (colors, spacing, transitions)
3. **Test hover/active states**
4. **Verify accessibility** (contrast, focus indicators)

Example:
```css
.gdlc-btn {
  /* Update colors to match Mindful palette */
  background: #F8F9FA;
  border: 1px solid rgba(60,64,67,0.3);
  color: #202124;
}

.gdlc-btn:hover {
  background: #FFFFFF;
  border-color: rgba(60,64,67,0.5);
}
```

### Add Settings Option
1. **Add checkbox** in `options.html` and `popup.html`:
   ```html
   <label>
     <input id="newSetting" type="checkbox" />
     Enable new feature
   </label>
   ```
2. **Update JavaScript** in `options.js` and `popup.js`:
   ```javascript
   const newSetting = document.getElementById('newSetting');
   
   chrome.storage.sync.get({ newSetting: true }).then(v => {
     newSetting.checked = v.newSetting;
   });
   
   function saveSettings() {
     const settings = { 
       conv: conv.checked, 
       list: list.checked,
       newSetting: newSetting.checked  // Add this
     };
     chrome.storage.sync.set(settings);
   }
   
   newSetting.addEventListener('change', saveSettings);
   ```
3. **Check setting** in `content.js`:
   ```javascript
   let settings = { conv: true, list: true, newSetting: true };
   
   chrome.storage.sync.get({ 
     conv: true, 
     list: true, 
     newSetting: true 
   }).then(v => {
     settings = v;
     if (settings.newSetting) {
       // Enable feature
     }
   });
   ```

### Modify Deep Link Format
If you need a different URL format:

1. **Edit `buildDeepLink()`** in `service-worker.js`:
   ```javascript
   function buildDeepLink(normalizedMessageId) {
     // Current: rfc822msgid search
     // return `https://mail.google.com/mail/#search/rfc822msgid%3A${encodeURIComponent(normalizedMessageId)}`;
     
     // Alternative: Direct message link (requires thread + message ID)
     // return `https://mail.google.com/mail/#inbox/${encodeURIComponent(messageId)}`;
     
     // Alternative: Label-specific view
     // return `https://mail.google.com/mail/#label/Important/${encodeURIComponent(messageId)}`;
   }
   ```

2. **Update tests** to verify new format works
3. **Update documentation** (README.md, ARCHITECTURE.md)

## Known Limitations

1. **Gmail Web Only:** Desktop web interface only (not mobile apps, Outlook, etc.)
2. **Message-ID Required:** Rare messages without Message-ID will fail
3. **DOM Dependency:** Gmail UI changes may break selectors (monitored annually)
4. **Chrome/Chromium Only:** Uses Manifest V3 and Chrome Identity API
5. **Read Permission Required:** Respects Gmail's permission model
6. **Settings Not Enforced:** Options page saves settings but content script checks on load (not live-updated during session)

## Future Enhancements

### High Priority
- [ ] **Live settings enforcement** - Detect settings changes and hide/show buttons immediately
- [ ] **Better error messages** - Specific guidance per error type (OAuth, API quota, network)
- [ ] **Keyboard shortcut** - Hotkey to copy link for current message (e.g., `Ctrl+Shift+L`)

### Medium Priority
- [ ] **Batch operations** - Select multiple emails, copy all links at once
- [ ] **Link preview** - Hover tooltip showing Message-ID before copying
- [ ] **Alternative formats** - Option to copy as Markdown link, HTML, etc.
- [ ] **Omnibox command** - `gmail copy` in address bar to copy current message link

### Low Priority
- [ ] **Fallback selectors** - Secondary DOM selectors if primary fails
- [ ] **Analytics (optional)** - Privacy-preserving usage stats (opt-in only)
- [ ] **Dark mode** - Detect Gmail's dark theme and adapt button styles
- [ ] **Custom icon** - Replace generic logo with purpose-built icon

### Design Improvements (Mindful Aesthetic)
- [ ] **Options page redesign** - Card-based layout, headers, visual polish
- [ ] **Popup redesign** - Mini dashboard with usage stats, quick settings
- [ ] **Enhanced toast** - Animated icon (checkmark draw animation), richer feedback
- [ ] **Button variants** - Different styles for conversation vs. list view
- [ ] **Onboarding flow** - First-time setup wizard with Mindful-style walkthrough

## Extension Store Listing (Future)

When publishing to Chrome Web Store:

**Name:** Gmail Deep Link Copier

**Short Description:**
Copy stable deep links to Gmail messages using RFC822 Message-ID. Links work across accounts and recipients.

**Long Description:**
Gmail Deep Link Copier adds convenient "Copy link" buttons throughout Gmail's interface, allowing you to create stable, shareable deep links to specific email messages.

**Key Features:**
- 🔗 Stable links using RFC822 Message-ID (work across accounts)
- 🎯 Buttons in conversation view and thread list view
- 🔒 Read-only access (secure and privacy-focused)
- ⚙️ Configurable button visibility
- 🚀 Fast and lightweight (no external dependencies)

**Privacy:**
- Read-only Gmail access (cannot send, delete, or modify)
- No data collection or tracking
- Message headers cached briefly in memory only
- No external servers (Gmail API only)

**Category:** Productivity
**Language:** English
**Screenshots:** (4-5 images showing button locations, toast, options page)

## Design Assets Needed

To fully implement the Mindful aesthetic:

### Icons
- [ ] **Extension icon** (16, 32, 48, 128, 512px)
  - Style: Minimal, line-based, teal/blue accent
  - Concept: Link chain icon or envelope with link overlay
  - Format: PNG with transparency, SVG source
- [ ] **Button icon** (16px, 24px for options)
  - Match extension icon style
  - Clear at small sizes
- [ ] **Success/error icons** (toast notifications)
  - Animated SVG for success (checkmark draw-in)
  - Friendly error icon (not harsh)

### Colors (Mindful Palette)
```css
:root {
  /* Primary */
  --primary: #34A853;          /* Teal/green (success, accents) */
  --primary-light: #81C995;
  --primary-dark: #2D8E4A;
  
  /* Neutrals */
  --neutral-50: #F8F9FA;       /* Backgrounds */
  --neutral-100: #F1F3F4;
  --neutral-200: #E8EAED;
  --neutral-300: #DADCE0;      /* Borders */
  --neutral-400: #BDC1C6;
  --neutral-500: #9AA0A6;      /* Placeholder text */
  --neutral-600: #80868B;
  --neutral-700: #5F6368;      /* Secondary text */
  --neutral-800: #3C4043;      /* Primary text */
  --neutral-900: #202124;      /* Headings */
  
  /* Semantic */
  --success: #34A853;
  --error: #EA4335;
  --warning: #FBBC04;
  --info: #4285F4;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(60,64,67,0.3);
  --shadow-md: 0 4px 16px rgba(60,64,67,0.2);
  --shadow-lg: 0 8px 24px rgba(60,64,67,0.15);
}
```

### Typography
```css
:root {
  /* Sizes */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 24px;
  
  /* Weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  
  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.4;
  --leading-relaxed: 1.6;
  
  /* Font families */
  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
}
```

## AI Agent Instructions

When working on this project:

1. **Always check existing code** before adding libraries or frameworks
2. **Follow the design language** - Match Mindful aesthetic (colors, spacing, typography)
3. **Test in Gmail** - Load unpacked extension, verify buttons appear, click and test
4. **Document changes** - Update README.md, ARCHITECTURE.md, and this file
5. **Maintain security** - Never add external scripts, respect CSP, minimal permissions
6. **Keep it simple** - Vanilla JS, no build tools, no unnecessary complexity
7. **Graceful degradation** - Extension should fail silently if Gmail DOM changes
8. **Accessibility first** - ARIA labels, keyboard navigation, contrast ratios

### Before Making Changes
- [ ] Read relevant sections of ARCHITECTURE.md
- [ ] Check current implementation in source files
- [ ] Understand Gmail DOM structure (use DevTools)
- [ ] Consider design language constraints

### After Making Changes
- [ ] Test manually in Gmail (all views: inbox, sent, conversation, list)
- [ ] Verify console has no errors (service worker + content script)
- [ ] Check that design matches Mindful aesthetic
- [ ] Update documentation if behavior changed
- [ ] Test OAuth flow (revoke token, re-authorize)

### Code Review Checklist
- [ ] JSDoc comments on all functions
- [ ] Error handling for all async operations
- [ ] CSS uses scoped class names (`.gdlc-*`)
- [ ] No magic numbers (use variables or comments)
- [ ] Follows existing code style
- [ ] No external dependencies added
- [ ] Security: No eval, no inline scripts, CSP compliant
- [ ] Accessibility: ARIA labels, keyboard support

## References

### Official Documentation
- [Gmail API](https://developers.google.com/gmail/api)
- [Chrome Extensions (Manifest V3)](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [RFC 5322 (Message-ID)](https://tools.ietf.org/html/rfc5322#section-3.6.4)
- [Gmail Search Operators](https://support.google.com/mail/answer/7190)

### Design Inspiration
- [Mindful Template](https://mindful-template.webflow.io/) - Primary design reference
- [Material Design](https://material.io/design) - Google's design system (Gmail uses this)
- [Webflow Healthcare Templates](https://webflow.com/templates/industry/healthcare) - Similar aesthetics

### Tools
- [Chrome Extensions DevTools](chrome://extensions)
- [Gmail API Explorer](https://developers.google.com/gmail/api/reference/rest)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

## Contact & Support

- **Issues:** Report bugs and feature requests in project repository
- **OAuth Setup:** See Google Cloud Console setup guide in ARCHITECTURE.md
- **Gmail API Quota:** Default quota is 1 billion API calls per day (sufficient for typical use)
- **Extension ID:** Get from `chrome://extensions` after loading unpacked

---

**Last Updated:** 2025-01-11
**Version:** 1.0.0
**Manifest Version:** 3
**Minimum Chrome Version:** 88 (Manifest V3 support)
