# Gmail Link Share

A Chrome extension that creates Gmail links anyone can use. Unlike regular Gmail URLs, these links work for anyone who received the email - not just you.

## ✨ Features

- 🔗 **Links That Work For Everyone** - Unlike copying Gmail's URL, these links open the email for anyone who received it
- 🎯 **Multiple Locations** - Buttons appear throughout Gmail for easy access
- 📋 **One-Click Copying** - Click the button and share the link with your team
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
2. You should see "Copy shareable link" buttons next to messages and threads
3. Click a button - you'll be prompted to authorize the extension (first time only)
4. After authorization, the shareable link will be copied to your clipboard
5. Share the link with anyone who received the email - it will work for them too!

## 💡 How It Works

### The Problem with Regular Gmail URLs

When you copy a Gmail URL from your browser, it only works for you. If you send it to someone else who received the same email, it won't work - Gmail shows them a different URL.

### The Solution

This extension creates special links using the email's unique Message-ID. These links work for anyone who has access to the email, whether they were in the To, CC, or BCC fields.

### Link Format

The extension creates links using Gmail's RFC822 Message-ID search:

```
https://mail.google.com/mail/#search/rfc822msgid%3A<message-id>
```

**Example:**
```
https://mail.google.com/mail/#search/rfc822msgid%3ACAH%3Dj8u4kZ...%40mail.gmail.com
```

### Why This Works

- **Universal Access** - Works for anyone who received the email (To, CC, or BCC)
- **Stable** - Links never break, even when emails are archived or forwarded
- **No Account Issues** - Unlike regular Gmail URLs, these work regardless of which Gmail account someone is using
- **Easy Sharing** - Share links with your team, and they'll actually work

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

- **Conversation View** - Show/hide "Copy shareable link" buttons next to individual messages
- **Thread List View** - Show/hide "Copy shareable link" buttons in your inbox list

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
├── build.js               # Build script for minification & optimization
├── package.json           # NPM dependencies and build scripts
├── agents_context/        # AI agent documentation
│   ├── ARCHITECTURE.md
│   ├── CLAUDE.md
│   ├── DESIGN_SYSTEM_REFERENCE.md
│   └── UI_OVERHAUL_SUMMARY.md
└── README.md             # This file
```

### Tech Stack

- **Vanilla JavaScript** (ES6+) - No frameworks, minimal dependencies
- **Chrome Extension Manifest V3** - Latest extension platform
- **Gmail API** - OAuth 2.0 for Message-ID retrieval
- **Mindful Design System** - Healthcare-inspired aesthetic
- **esbuild** - Fast JavaScript/CSS minification
- **SVGO** - SVG optimization

### Building for Distribution

To create an optimized, production-ready ZIP file for the Chrome Web Store:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build and package:**
   ```bash
   npm run pack
   ```
   
   This will:
   - Minify all JavaScript files (removes comments, whitespace)
   - Minify all CSS files
   - Optimize SVG files (typically 60-70% size reduction)
   - Copy all necessary assets
   - Remove the unused `scripting` permission from manifest
   - Create `gmail-link-share.zip` in the project root
   
   **Expected output:**
   - Source size: ~520 KB
   - Optimized size: ~170 KB (67% reduction)
   - Final ZIP: ~108 KB

3. **Upload to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload `gmail-link-share.zip`

**Available NPM scripts:**
- `npm run build` - Build optimized files to `dist/` directory
- `npm run pack` - Build + create ZIP file for distribution
- `npm run clean` - Remove `dist/` and ZIP file

### Local Development

1. **Make changes** to source files
2. **Reload extension** at `chrome://extensions` (click reload icon)
3. **Test in Gmail** - Refresh Gmail to see changes
4. **Check console logs**:
   - Service worker: Click "service worker" link in `chrome://extensions`
   - Content script: Open DevTools (F12) in Gmail

**Note:** For development, you can load the extension directly from the project root (unpacked). Only use the build process when preparing for distribution.

### Debugging

**Service Worker Console:**
- `chrome://extensions` → Find extension → Click "service worker"
- View OAuth token flow, API responses, cache behavior

**Content Script Console:**
- Open Gmail → Press F12 → Console tab
- View DOM mutations, button injection, clipboard operations

**Common Issues:**
- **"Failed to copy link"**: Make sure you've authorized the extension and the Gmail API is enabled
- **Buttons not appearing**: Try refreshing Gmail or reloading the extension
- **Clipboard fails**: Click on Gmail first to give it focus, then try again

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
| `activeTab` | Access Gmail's DOM when you're viewing it |
| `mail.google.com` | Inject our buttons into Gmail's interface |
| `gmail.googleapis.com` | Fetch Message-ID headers via Gmail API |

## 📝 Known Limitations

- **Gmail Web Only** - Links work anywhere, but buttons only appear in Gmail web (not mobile apps)
- **Recipients Only** - Links only work for people who received the email (To, CC, or BCC)
- **Chrome/Chromium Only** - Currently only available for Chrome-based browsers
- **Authorization Required** - You need to authorize the extension to access your Gmail

## 🗺 Roadmap

### High Priority
- [ ] Keyboard shortcut for copying shareable link (e.g., `Ctrl+Shift+L`)
- [ ] Clearer error messages when links can't be created
- [ ] Live settings updates without refreshing Gmail

### Medium Priority
- [ ] Copy multiple links at once
- [ ] Link format options (Markdown, HTML, plain text)
- [ ] Preview links before copying

### Low Priority
- [ ] Dark mode support
- [ ] See how many links you've copied
- [ ] Alternative link formats

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
- **Setup help**: See [ARCHITECTURE.md](agents_context/ARCHITECTURE.md) for detailed OAuth setup
- **Questions**: Check the README or open an issue

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-11  
**Manifest Version:** 3  
**Minimum Chrome:** 88+
