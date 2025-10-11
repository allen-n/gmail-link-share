/**
 * Shared Component Library - Mindful Aesthetic
 * Reusable JavaScript components and utilities
 */

/**
 * Toast notification utility
 * @param {string} message - The message to display
 * @param {boolean} isSuccess - Whether this is a success message
 * @param {number} duration - Duration in milliseconds (default: 2500)
 */
function showToast(message, isSuccess = true, duration = 2500) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = document.createElement('span');
  icon.className = isSuccess ? 'toast-icon toast-icon-success' : 'toast-icon toast-icon-error';
  icon.textContent = isSuccess ? '✓' : '✗';
  
  const messageSpan = document.createElement('span');
  messageSpan.className = 'toast-message';
  messageSpan.textContent = message;
  
  toast.appendChild(icon);
  toast.appendChild(messageSpan);
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

/**
 * Toggle Switch Component
 * Creates an accessible toggle switch that replaces checkboxes
 */
class ToggleSwitch {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.id - Unique identifier
   * @param {string} options.label - Label text
   * @param {string} options.description - Helper text description
   * @param {boolean} options.checked - Initial checked state
   * @param {Function} options.onChange - Callback when toggle changes
   */
  constructor(options) {
    this.id = options.id;
    this.label = options.label;
    this.description = options.description;
    this.checked = options.checked || false;
    this.onChange = options.onChange || (() => {});
    this.element = this.create();
    this.toggleButton = this.element.querySelector('.toggle-switch');
  }
  
  /**
   * Create the toggle switch DOM element
   * @returns {HTMLElement} The setting item element
   */
  create() {
    const settingItem = document.createElement('div');
    settingItem.className = 'setting-item';
    
    const settingInfo = document.createElement('div');
    settingInfo.className = 'setting-info';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'setting-label';
    labelEl.htmlFor = `toggle-${this.id}`;
    labelEl.textContent = this.label;
    
    settingInfo.appendChild(labelEl);
    
    if (this.description) {
      const descEl = document.createElement('p');
      descEl.className = 'setting-description';
      descEl.textContent = this.description;
      settingInfo.appendChild(descEl);
    }
    
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'toggle-wrapper';
    
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.id = `toggle-${this.id}`;
    toggleButton.className = 'toggle-switch';
    toggleButton.setAttribute('role', 'switch');
    toggleButton.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    toggleButton.setAttribute('aria-label', this.label);
    
    if (this.checked) {
      toggleButton.classList.add('active');
    }
    
    toggleButton.addEventListener('click', () => this.toggle());
    
    labelEl.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });
    
    toggleWrapper.appendChild(toggleButton);
    
    settingItem.appendChild(settingInfo);
    settingItem.appendChild(toggleWrapper);
    
    return settingItem;
  }
  
  /**
   * Toggle the switch state
   */
  toggle() {
    this.setChecked(!this.checked);
  }
  
  /**
   * Set the checked state
   * @param {boolean} checked - New checked state
   */
  setChecked(checked) {
    this.checked = checked;
    this.toggleButton.setAttribute('aria-checked', checked ? 'true' : 'false');
    
    if (checked) {
      this.toggleButton.classList.add('active');
    } else {
      this.toggleButton.classList.remove('active');
    }
    
    this.onChange(checked);
  }
  
  /**
   * Get the checked state
   * @returns {boolean} Current checked state
   */
  isChecked() {
    return this.checked;
  }
  
  /**
   * Disable the toggle
   */
  disable() {
    this.toggleButton.disabled = true;
  }
  
  /**
   * Enable the toggle
   */
  enable() {
    this.toggleButton.disabled = false;
  }
  
  /**
   * Get the DOM element
   * @returns {HTMLElement} The setting item element
   */
  getElement() {
    return this.element;
  }
}

/**
 * Settings Manager
 * Handles loading, saving, and syncing settings across extension pages
 */
class SettingsManager {
  constructor() {
    this.settings = {};
    this.listeners = [];
  }
  
  /**
   * Load settings from chrome.storage.sync
   * @param {Object} defaults - Default values
   * @returns {Promise<Object>} Loaded settings
   */
  async load(defaults = {}) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(defaults, (values) => {
        this.settings = values;
        resolve(values);
      });
    });
  }
  
  /**
   * Save settings to chrome.storage.sync
   * @param {Object} updates - Settings to update
   * @param {boolean} showFeedback - Whether to show save feedback toast
   * @returns {Promise<void>}
   */
  async save(updates, showFeedback = true) {
    this.settings = { ...this.settings, ...updates };
    
    return new Promise((resolve) => {
      chrome.storage.sync.set(updates, () => {
        this.notifyGmailTabs(updates);
        
        if (showFeedback) {
          showToast('Settings saved', true);
        }
        
        this.listeners.forEach(listener => listener(this.settings));
        resolve();
      });
    });
  }
  
  /**
   * Notify all Gmail tabs about settings changes
   * @param {Object} settings - Updated settings
   */
  notifyGmailTabs(settings) {
    chrome.tabs.query({ url: 'https://mail.google.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'settingsChanged',
          settings
        }).catch(() => {});
      });
    });
  }
  
  /**
   * Get a specific setting value
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  get(key) {
    return this.settings[key];
  }
  
  /**
   * Get all settings
   * @returns {Object} All settings
   */
  getAll() {
    return { ...this.settings };
  }
  
  /**
   * Add a change listener
   * @param {Function} listener - Callback function
   */
  onChange(listener) {
    this.listeners.push(listener);
  }
}

/**
 * Create a card element
 * @param {Object} options - Card configuration
 * @param {string} options.title - Card title
 * @param {string} options.icon - Icon emoji or HTML
 * @param {HTMLElement|string} options.content - Card content
 * @param {boolean} options.hover - Enable hover effect
 * @returns {HTMLElement} Card element
 */
function createCard(options) {
  const card = document.createElement('div');
  card.className = options.hover ? 'card card-hover' : 'card';
  
  if (options.title) {
    const header = document.createElement('div');
    header.className = 'card-header';
    
    if (options.icon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'card-icon';
      iconEl.innerHTML = options.icon;
      header.appendChild(iconEl);
    }
    
    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = options.title;
    header.appendChild(title);
    
    card.appendChild(header);
  }
  
  const body = document.createElement('div');
  body.className = 'card-body';
  
  if (typeof options.content === 'string') {
    body.innerHTML = options.content;
  } else if (options.content instanceof HTMLElement) {
    body.appendChild(options.content);
  }
  
  card.appendChild(body);
  
  return card;
}

/**
 * Create a feature list element
 * @param {Array<string>} features - Array of feature descriptions
 * @returns {HTMLElement} List element
 */
function createFeatureList(features) {
  const list = document.createElement('ul');
  list.style.margin = '0';
  list.style.padding = '0';
  list.style.listStyle = 'none';
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-sm)';
  
  features.forEach((feature) => {
    const item = document.createElement('li');
    item.style.display = 'flex';
    item.style.alignItems = 'flex-start';
    item.style.gap = 'var(--space-sm)';
    item.style.fontSize = 'var(--text-base)';
    item.style.color = 'var(--text-secondary)';
    item.style.lineHeight = 'var(--leading-normal)';
    
    const bullet = document.createElement('span');
    bullet.textContent = '•';
    bullet.style.color = 'var(--accent-primary)';
    bullet.style.fontWeight = 'var(--weight-semibold)';
    
    const text = document.createElement('span');
    text.textContent = feature;
    
    item.appendChild(bullet);
    item.appendChild(text);
    list.appendChild(item);
  });
  
  return list;
}
