# AI Agent Context Documentation

> This folder contains comprehensive documentation for AI agents (like Claude, GPT-4, etc.) working on the Gmail Deep Link Copier Chrome extension project.

## 📚 Documentation Files

### **[CLAUDE.md](CLAUDE.md)** - Main Agent Configuration
**Purpose:** Primary configuration file for AI agents  
**Contents:**
- Project overview and technology stack
- Design language and Mindful aesthetic guidelines
- Complete architecture documentation
- Code style conventions and best practices
- Common development tasks with examples
- Security, privacy, and permissions
- OAuth setup and Gmail API reference
- Future enhancements roadmap

**When to read:** Start here for complete project context before making any changes.

---

### **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical Architecture
**Purpose:** Deep dive into system design and implementation  
**Contents:**
- System components (content script, service worker, options page)
- Data flow diagrams
- DOM selectors and injection strategy
- Caching implementation
- Error handling and graceful degradation
- Performance characteristics
- Testing strategies

**When to read:** Need to understand how the extension works internally, modify core functionality, or debug complex issues.

---

### **[DESIGN_SYSTEM_REFERENCE.md](DESIGN_SYSTEM_REFERENCE.md)** - UI Quick Reference
**Purpose:** Quick lookup for design system components  
**Contents:**
- CSS variables (colors, spacing, typography)
- Component class names (cards, buttons, toggles, toasts)
- Utility classes (flexbox, margins, animations)
- Common UI patterns with code examples
- Accessibility checklist
- Design principles

**When to read:** Building or styling UI components, need to match existing design aesthetic, or looking for reusable CSS classes.

---

### **[UI_OVERHAUL_SUMMARY.md](UI_OVERHAUL_SUMMARY.md)** - Design System Implementation
**Purpose:** Comprehensive guide to the Mindful design system overhaul  
**Contents:**
- Complete list of changed files
- Before/after comparison
- Component library documentation
- Animation and micro-interaction patterns
- Reusability benefits and examples
- Testing instructions
- Maintenance notes for adding new features

**When to read:** Implementing new UI features, understanding the design system architecture, or extending the component library.

---

## 🎯 Quick Start Guide for AI Agents

### 1. **First Time Setup**
```
Read: CLAUDE.md (sections: Project Overview, Architecture, Code Style)
Skim: ARCHITECTURE.md (understand data flow)
Bookmark: DESIGN_SYSTEM_REFERENCE.md (for UI work)
```

### 2. **Before Making Changes**
- [ ] Read relevant sections of CLAUDE.md
- [ ] Check current implementation in source files
- [ ] Review code style guidelines
- [ ] Understand Gmail DOM structure if modifying content.js

### 3. **Common Tasks**

#### Adding a New Feature
1. Read CLAUDE.md → "Common Development Tasks"
2. Check ARCHITECTURE.md for integration points
3. Use DESIGN_SYSTEM_REFERENCE.md for UI components
4. Follow code conventions in CLAUDE.md

#### Fixing a Bug
1. Read ARCHITECTURE.md → "Error Handling & Fallbacks"
2. Check CLAUDE.md → "Debugging" section
3. Review relevant component in ARCHITECTURE.md

#### UI Changes
1. Read UI_OVERHAUL_SUMMARY.md → "Design System Features"
2. Use DESIGN_SYSTEM_REFERENCE.md for component classes
3. Follow Mindful aesthetic guidelines in CLAUDE.md

#### Adding Settings
1. Read CLAUDE.md → "Add Settings Option"
2. Use ToggleSwitch component from UI_OVERHAUL_SUMMARY.md
3. Update both popup.js and options.js

### 4. **After Making Changes**
- [ ] Test manually in Gmail (all views)
- [ ] Verify console has no errors
- [ ] Check design matches Mindful aesthetic
- [ ] Update documentation if behavior changed
- [ ] Test OAuth flow

---

## 🎨 Design Philosophy

The extension follows the **Mindful Healthcare Template** aesthetic:

- **Calm & Professional**: Soft colors, ample whitespace, no harsh contrasts
- **Trust & Reliability**: Consistent styling, clear feedback, predictable interactions
- **Simplicity**: Minimal UI, focus on core functionality, avoid clutter
- **Modern**: Rounded corners, smooth animations, system fonts
- **Healthcare-Grade Polish**: Attention to detail, refined micro-interactions

**Color Palette:**
- Background: `#F8F9FA` (soft off-white)
- Text: `#202124` (dark charcoal)
- Accent: `#34A853` (soft teal/green)
- Error: `#EA4335` (soft red)

**Spacing:** 8px grid system (4px, 8px, 12px, 16px, 24px)  
**Typography:** System font stack, 14px body, 1.4 line height  
**Transitions:** 0.2s ease for most animations

---

## 🔧 Development Principles

1. **Always check existing code** before adding libraries or frameworks
2. **Follow the design language** - Match Mindful aesthetic
3. **Test in Gmail** - Load unpacked extension, verify buttons appear
4. **Document changes** - Update relevant .md files
5. **Maintain security** - Never add external scripts, respect CSP
6. **Keep it simple** - Vanilla JS, no build tools, no unnecessary complexity
7. **Graceful degradation** - Extension should fail silently if Gmail DOM changes
8. **Accessibility first** - ARIA labels, keyboard navigation, contrast ratios

---

## 📁 File Organization

```
agents_context/
├── README.md                        # This file (index)
├── CLAUDE.md                        # Main agent config (READ FIRST)
├── ARCHITECTURE.md                  # Technical deep dive
├── DESIGN_SYSTEM_REFERENCE.md       # UI quick reference
```

---

## 🆘 Getting Help

**For OAuth Issues:**
- ARCHITECTURE.md → "OAuth Setup"
- CLAUDE.md → "OAuth Setup (Google Cloud Console)"

**For Gmail API:**
- CLAUDE.md → "Gmail API Reference"
- ARCHITECTURE.md → "Data Flow"

**For UI/Design:**
- DESIGN_SYSTEM_REFERENCE.md → Component classes
- CLAUDE.md → "Design Language & Visual Style"

**For Debugging:**
- CLAUDE.md → "Debugging" section
- ARCHITECTURE.md → "Error Handling & Fallbacks"
- ARCHITECTURE.md → "Debugging" section

---

## 🚀 Quick Reference

### Tech Stack
- **Language:** Vanilla JavaScript (ES6+)
- **Platform:** Chrome Extension Manifest V3
- **API:** Gmail API v1 (OAuth 2.0)
- **Storage:** chrome.storage.sync
- **Design:** Mindful-inspired healthcare aesthetic

### Key Files
- `manifest.json` - Extension configuration
- `service-worker.js` - OAuth + Gmail API
- `content.js` - Gmail DOM injection
- `shared.css` - Design system
- `shared.js` - Reusable components

### Key Concepts
- **RFC822 Message-ID** - Stable email identifier
- **Deep Links** - Gmail search URLs using Message-ID
- **MutationObserver** - Track Gmail's dynamic DOM
- **Chrome Identity API** - OAuth token management
- **Mindful Aesthetic** - Healthcare-grade UI polish

---

**Last Updated:** 2025-01-11  
**Project Version:** 1.0.0  
**Documentation Version:** 1.0.0
