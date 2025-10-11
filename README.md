# Gmail Deep Link Copier

A Chrome extension that adds "Copy link" buttons throughout Gmail to create stable, shareable deep links to specific messages using RFC822 Message-ID.

## ✨ Features

- 🔗 **Stable Deep Links** - Uses RFC822 Message-ID for permanent, cross-account links
- 🎯 **Multiple Locations** - Buttons in both conversation view and thread list view
- 📋 **One-Click Copying** - Links automatically copied to clipboard with visual feedback
- ⚙️ **Customizable** - Enable/disable buttons in different Gmail views via settings
- 🔒 **Privacy-First** - Read-only access, no data collection, local processing only
- 🎨 **Polished UI** - Beautiful design inspired by Mindful healthcare aesthetic

## 📸 Screenshots

*Coming soon: Screenshots of buttons in Gmail, popup, and options page*

## 🚀 Installation

### Prerequisites
- Google Chrome or Chromium-based browser
- Google Cloud Console account (for OAuth setup)
- Gmail account

### 1. Set up OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Gmail API** for your project
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Chrome Extension** as application type
6. Set **Authorized redirect URI** to:
   ```
   https://<YOUR_EXTENSION_ID>.chromiumapp.org/
   ```
   *(You'll get the extension ID after step 2.5)*
7. Copy the **Client ID**

### 2. Install the Extension

1. **Clone this repository:**
   ```bash
   git clone <repository-url>
   cd gmail-deeplinker
   ```

2. **Configure OAuth Client ID:**
   - Open `manifest.json`
   - Replace the `client_id` value with your OAuth Client ID from step 1.7

3. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked** and select this folder
   - Copy the **Extension ID** from the extension card

4. **Update OAuth Redirect URI:**
   - Go back to Google Cloud Console → Credentials
   - Edit your OAuth Client ID
   - Update the redirect URI with your actual extension ID from step 2.3
   - Save changes

5. **Reload the Extension:**
   - Go back to `chrome://extensions`
   - Click the reload icon on your extension card

### 3. First Use

1. Open [Gmail](https://mail.google.com)
2. You should see "Copy link" buttons next to messages and threads
3. Click a button - you'll be prompted to authorize the extension (first time only)
4. After authorization, the link will be copied to your clipboard
5. Paste the link in a new tab to verify it opens the correct message

## 💡 How It Works

### Deep Link Format

This extension creates links using Gmail's RFC822 Message-ID search:

```
https://mail.google.com/mail/#search/rfc822msgid%3A<message-id>
```

**Example:**
```
https://mail.google.com/mail/#search/rfc822msgid%3ACAH%3Dj8u4kZ...%40mail.gmail.com
```

### Why RFC822 Message-ID?

- **Universal** - RFC 5322 standard across all email systems
- **Stable** - Never changes when forwarding, archiving, or switching accounts
- **Unique** - Guaranteed unique identifier for each message
- **Portable** - Works for anyone with access to the message
- **No `/u/0`** - Links work regardless of Gmail account index

### Architecture

```
User clicks "Copy link"
  ↓
Content script (content.js) sends message to service worker
  ↓
Service worker (service-worker.js) fetches Message-ID via Gmail API
  ↓
Deep link generated and cached (2-minute TTL)
  ↓
Link copied to clipboard
  ↓
Toast notification shows success
```

## ⚙️ Configuration

### Access Settings

- **Quick Settings**: Click the extension icon in the Chrome toolbar
- **Full Options**: Right-click the extension icon → **Options**

### Available Settings

- **Conversation View** - Show/hide buttons next to messages in conversation threads
- **Thread List View** - Show/hide buttons in the inbox thread list

Settings are synced across all your Chrome devices via `chrome.storage.sync`.

## 🛠 Development

### File Structure

```
gmail-deeplinker/
├── manifest.json           # Extension configuration (Manifest V3)
├── service-worker.js       # OAuth, Gmail API calls, caching
├── content.js             # Gmail DOM observation, button injection
├── content.css            # Injected button styles
├── popup.html/js          # Extension popup (quick settings)
├── options.html/js        # Full options page
├── shared.css/js          # Reusable design system & components
├── logo/                  # Extension icons (16-512px)
├── agents_context/        # AI agent documentation
│   ├── ARCHITECTURE.md
│   ├── CLAUDE.md
│   ├── DESIGN_SYSTEM_REFERENCE.md
│   └── UI_OVERHAUL_SUMMARY.md
└── README.md             # This file
```

### Tech Stack

- **Vanilla JavaScript** (ES6+) - No frameworks or build tools
- **Chrome Extension Manifest V3** - Latest extension platform
- **Gmail API** - OAuth 2.0 for Message-ID retrieval
- **Mindful Design System** - Healthcare-inspired aesthetic

### Local Development

1. **Make changes** to source files
2. **Reload extension** at `chrome://extensions` (click reload icon)
3. **Test in Gmail** - Refresh Gmail to see changes
4. **Check console logs**:
   - Service worker: Click "service worker" link in `chrome://extensions`
   - Content script: Open DevTools (F12) in Gmail

### Debugging

**Service Worker Console:**
- `chrome://extensions` → Find extension → Click "service worker"
- View OAuth token flow, API responses, cache behavior

**Content Script Console:**
- Open Gmail → Press F12 → Console tab
- View DOM mutations, button injection, clipboard operations

**Common Issues:**
- **401 Unauthorized**: Client ID mismatch or Gmail API not enabled
- **Buttons not appearing**: DOM selectors changed or page not fully loaded
- **Clipboard fails**: Page must have focus (click Gmail first)

### Contributing

See [ARCHITECTURE.md](agents_context/ARCHITECTURE.md) for detailed technical documentation.

## 🔒 Privacy & Security

### What We Access
- ✅ Message-ID headers only (via Gmail API)
- ✅ Gmail DOM for button injection
- ❌ No email content or bodies
- ❌ No personal information

### What We Store
- ✅ User settings (conversation/list view toggles) in `chrome.storage.sync`
- ✅ Message-IDs cached in memory for 2 minutes
- ❌ No email content
- ❌ No persistent message data

### Security Measures
- **Read-only OAuth scope** - Cannot send, delete, or modify emails
- **Content Security Policy** - Prevents code injection attacks
- **No external servers** - All processing happens locally
- **No tracking** - Zero analytics or telemetry
- **Minimal permissions** - Only what's required for core functionality

### Permissions Explained

| Permission | Why We Need It |
|------------|----------------|
| `identity` | OAuth 2.0 authentication with Google |
| `storage` | Save your preference settings |
| `scripting` | Inject buttons into Gmail |
| `activeTab` | Access Gmail's DOM when you're viewing it |
| `mail.google.com` | Inject our buttons into Gmail's interface |
| `gmail.googleapis.com` | Fetch Message-ID headers via Gmail API |

## 📝 Known Limitations

- **Gmail Web Only** - Does not work in Gmail mobile apps or other email clients
- **Message-ID Required** - Rare messages without Message-ID headers will fail
- **DOM Dependency** - Gmail UI changes may break button injection (we use stable selectors)
- **Chrome/Chromium Only** - Uses Manifest V3 and Chrome Identity API
- **Read Permission** - Can only create links for messages you have access to

## 🗺 Roadmap

### High Priority
- [ ] Keyboard shortcut for copying link (e.g., `Ctrl+Shift+L`)
- [ ] Better error messages with specific troubleshooting steps
- [ ] Live settings updates without page refresh

### Medium Priority
- [ ] Batch operations (copy multiple links at once)
- [ ] Link format options (Markdown, HTML, plain text)
- [ ] Hover preview showing Message-ID before copying

### Low Priority
- [ ] Dark mode support
- [ ] Usage statistics dashboard
- [ ] Alternative link formats (direct message URL, etc.)

See [CLAUDE.md](agents_context/CLAUDE.md) for complete enhancement list.

## 📚 Documentation

- **[ARCHITECTURE.md](agents_context/ARCHITECTURE.md)** - Technical architecture and data flow
- **[CLAUDE.md](agents_context/CLAUDE.md)** - AI agent development guide
- **[DESIGN_SYSTEM_REFERENCE.md](agents_context/DESIGN_SYSTEM_REFERENCE.md)** - UI component library
- **[UI_OVERHAUL_SUMMARY.md](agents_context/UI_OVERHAUL_SUMMARY.md)** - Design system implementation

## 🙏 Credits

- Design inspired by [Mindful Healthcare Template](https://mindful-template.webflow.io/)
- Built on [Chrome Extension v3 Starter](https://github.com/SimGus/chrome-extension-v3-starter) by SimGus

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- **Report bugs**: Open an issue in the GitHub repository
- **OAuth setup help**: See [ARCHITECTURE.md](agents_context/ARCHITECTURE.md) OAuth section
- **API quota**: Default Gmail API quota is 1 billion calls/day (more than sufficient)

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-11  
**Manifest Version:** 3  
**Minimum Chrome:** 88+
