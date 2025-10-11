# Design System Quick Reference

> Quick reference guide for the Mindful-inspired design system used throughout the Gmail Deep Link Copier extension.

## 🎨 Color Variables

### Backgrounds
```css
--bg-primary: #FFFFFF;      /* White cards, surfaces */
--bg-secondary: #F8F9FA;    /* Page background, subtle areas */
--bg-tertiary: #F1F3F4;     /* Deeper background, gradients */
```

### Text Colors
```css
--text-primary: #202124;    /* Main text, headings */
--text-secondary: #5F6368;  /* Subtitles, labels */
--text-tertiary: #80868B;   /* Helper text, captions */
--text-disabled: #BDC1C6;   /* Disabled state text */
```

### Borders
```css
--border-light: #E8EAED;    /* Subtle dividers */
--border-medium: #DADCE0;   /* Standard borders */
--border-dark: #BDC1C6;     /* Emphasized borders */
```

### Accent Colors
```css
--accent-primary: #34A853;  /* Success, primary actions (green) */
--accent-hover: #2D8E4A;    /* Hover state for primary */
--accent-light: #81C995;    /* Light variant */

--error: #EA4335;           /* Error states (red) */
--warning: #FBBC04;         /* Warning states (yellow) */
--info: #4285F4;            /* Info states (blue) */
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(60, 64, 67, 0.3);      /* Subtle elevation */
--shadow-md: 0 4px 16px rgba(60, 64, 67, 0.15);    /* Card elevation */
--shadow-lg: 0 8px 24px rgba(60, 64, 67, 0.1);     /* Modal elevation */
--shadow-hover: 0 6px 20px rgba(60, 64, 67, 0.2);  /* Hover state */
```

## 📏 Spacing Scale

```css
--space-xs: 4px;    /* Tiny gaps, icon spacing */
--space-sm: 8px;    /* Small padding, tight gaps */
--space-md: 12px;   /* Medium padding, standard gaps */
--space-lg: 16px;   /* Large padding, card padding */
--space-xl: 24px;   /* Extra large spacing */
--space-2xl: 32px;  /* Section spacing */
```

### Usage Examples
```css
.card { padding: var(--space-lg); }
.button { padding: var(--space-sm) var(--space-lg); }
.stack { gap: var(--space-md); }
```

## 🔤 Typography Scale

### Font Sizes
```css
--text-xs: 11px;    /* Fine print */
--text-sm: 12px;    /* Helper text, captions */
--text-base: 14px;  /* Body text (default) */
--text-lg: 16px;    /* Card titles, subheadings */
--text-xl: 18px;    /* Section headings */
--text-2xl: 24px;   /* Page titles */
```

### Font Weights
```css
--weight-normal: 400;    /* Body text */
--weight-medium: 500;    /* Emphasized text, labels */
--weight-semibold: 600;  /* Headings, titles */
```

### Line Heights
```css
--leading-tight: 1.2;     /* Headings */
--leading-normal: 1.4;    /* Body text */
--leading-relaxed: 1.6;   /* Long-form content */
```

### Typography Classes
```html
<h1 class="heading-lg">Large Heading</h1>
<h2 class="heading-md">Medium Heading</h2>
<h3 class="heading-sm">Small Heading</h3>
<p class="subheading">SECTION LABEL</p>
<p class="body-text">Body paragraph</p>
<p class="helper-text">Helper text</p>
<p class="caption">Caption text</p>
```

## 🎯 Border Radius

```css
--radius-sm: 4px;      /* Buttons, small elements */
--radius-md: 8px;      /* Cards, toasts */
--radius-lg: 12px;     /* Large containers */
--radius-full: 9999px; /* Pills, circles */
```

## ⚡ Transitions

```css
--transition-fast: 0.15s ease;   /* Hover effects */
--transition-base: 0.2s ease;    /* Standard transitions */
--transition-slow: 0.3s ease;    /* Complex animations */
```

## 🧩 Component Classes

### Cards
```html
<!-- Basic card -->
<div class="card">
  <div class="card-header">
    <img src="icon.png" class="card-icon">
    <h2 class="card-title">Title</h2>
  </div>
  <div class="card-body">
    Content here
  </div>
</div>

<!-- Hoverable card -->
<div class="card card-hover">
  ...
</div>
```

### Toggle Switch
```javascript
// JavaScript component (see shared.js)
const toggle = new ToggleSwitch({
  id: 'feature-id',
  label: 'Feature Name',
  description: 'Description of what this does',
  checked: true,
  onChange: (checked) => {
    // Handle change
  }
});

container.appendChild(toggle.getElement());
```

### Buttons
```html
<!-- Standard button -->
<button class="btn">Click Me</button>

<!-- Primary button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Small button -->
<button class="btn btn-sm">Small</button>
```

### Links
```html
<a href="#" class="link">Click here</a>
```

### Toast Notifications
```javascript
// Success toast
showToast('Operation successful!', true);

// Error toast  
showToast('Something went wrong', false);

// Custom duration (3.5 seconds)
showToast('Custom message', true, 3500);
```

### Icons
```html
<img src="icon.png" class="icon">       <!-- 16px -->
<img src="icon.png" class="icon-md">    <!-- 20px -->
<img src="icon.png" class="icon-lg">    <!-- 24px -->
```

## 🎨 Layout Components

### Container
```html
<!-- Max-width 640px, centered -->
<div class="container">
  Content
</div>

<!-- Max-width 480px, centered -->
<div class="container-sm">
  Content
</div>
```

### Hero Section
```html
<div class="hero">
  <img src="logo.png" class="hero-icon">
  <h1 class="hero-title">Page Title</h1>
  <p class="hero-subtitle">Subtitle description</p>
</div>
```

### Setting Item
```html
<div class="setting-item">
  <div class="setting-info">
    <label class="setting-label">Setting Name</label>
    <p class="setting-description">Description text</p>
  </div>
  <div class="toggle-wrapper">
    <!-- Toggle switch here -->
  </div>
</div>
```

## 🛠 Utility Classes

### Flexbox
```html
<div class="flex">Horizontal flex</div>
<div class="flex-col">Vertical flex</div>
<div class="flex items-center">Centered items</div>
<div class="flex justify-between">Space between</div>
```

### Gaps
```html
<div class="flex gap-xs">4px gap</div>
<div class="flex gap-sm">8px gap</div>
<div class="flex gap-md">12px gap</div>
<div class="flex gap-lg">16px gap</div>
<div class="flex gap-xl">24px gap</div>
```

### Margins
```html
<!-- Top margins -->
<div class="mt-xs">4px top margin</div>
<div class="mt-sm">8px top margin</div>
<div class="mt-md">12px top margin</div>
<div class="mt-lg">16px top margin</div>
<div class="mt-xl">24px top margin</div>

<!-- Bottom margins -->
<div class="mb-xs">4px bottom margin</div>
<div class="mb-sm">8px bottom margin</div>
<!-- ... etc -->
```

### Text Utilities
```html
<div class="text-center">Centered text</div>
<div class="text-muted">Muted gray text</div>
```

### Animations
```html
<!-- Immediate fade-in -->
<div class="fade-in">Content</div>

<!-- Delayed fade-ins (for stagger effect) -->
<div class="fade-in-delay-1">First</div>
<div class="fade-in-delay-2">Second</div>
<div class="fade-in-delay-3">Third</div>
```

## 📋 Common Patterns

### Settings Form
```html
<div class="card">
  <div class="card-header">
    <h2 class="card-title">
      <span class="card-icon">⚙️</span>
      Settings
    </h2>
  </div>
  <div class="card-body">
    <div class="settings-list">
      <!-- Toggle switches here -->
    </div>
  </div>
</div>
```

### Info Card with List
```html
<div class="info-card">
  <div class="info-card-header">
    <span class="info-card-icon">📚</span>
    <h3 class="info-card-title">Features</h3>
  </div>
  <ul class="feature-list">
    <li>
      <span class="feature-bullet">•</span>
      <span>Feature description</span>
    </li>
    <!-- More items -->
  </ul>
</div>
```

### Popup Layout
```html
<div class="popup-container">
  <div class="popup-header">
    <img src="logo.png" class="popup-header-icon">
    <div class="popup-header-text">
      <h1 class="popup-title">Title</h1>
      <p class="popup-subtitle">Subtitle</p>
    </div>
  </div>
  
  <div class="popup-body">
    <!-- Content -->
  </div>
  
  <div class="popup-footer">
    <a href="#" class="footer-link">Link</a>
  </div>
</div>
```

## 🎯 Accessibility Checklist

- ✅ All buttons have `type="button"` (unless submit)
- ✅ All interactive elements have ARIA labels
- ✅ Toggle switches have `role="switch"` and `aria-checked`
- ✅ Form inputs have associated `<label>` elements
- ✅ Focus indicators visible (`:focus` styles)
- ✅ Color contrast meets WCAG AA (4.5:1 for text)
- ✅ Keyboard navigation works (Tab, Space, Enter)
- ✅ Icons have `alt=""` if decorative or `alt="description"` if meaningful

## 🎨 Design Principles

1. **Consistent Spacing**: Use 8px grid (4px, 8px, 12px, 16px, 24px)
2. **Soft Colors**: Avoid harsh blacks and pure whites
3. **Subtle Shadows**: Use for depth, not decoration
4. **Smooth Transitions**: 0.2s is the sweet spot
5. **Accessible Always**: Test with keyboard and screen readers
6. **Mobile-Friendly**: Cards stack, text scales
7. **Progressive Enhancement**: Works without JavaScript for basics

---

**Quick Links:**
- Full Design System: `../shared.css`
- Component Library: `../shared.js`
- Implementation Guide: `UI_OVERHAUL_SUMMARY.md`
- Project Config: `CLAUDE.md`

**Last Updated:** 2025-01-11
**Version:** 1.0.0
