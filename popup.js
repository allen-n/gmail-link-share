/**
 * Popup page script
 * Uses reusable components from shared.js (SettingsManager, ToggleSwitch)
 * Provides quick settings access from browser toolbar
 */

/**
 * Settings manager instance for loading and saving settings
 * @type {SettingsManager}
 */
const settingsManager = new SettingsManager();

/**
 * Container element for toggle switches
 * @type {HTMLElement}
 */
const settingsContainer = document.getElementById('settings-container');

/**
 * Toggle switch for conversation view setting
 * @type {ToggleSwitch}
 */
let convToggle;

/**
 * Toggle switch for thread list view setting
 * @type {ToggleSwitch}
 */
let listToggle;

/**
 * Initialize the popup page.
 * Loads current settings, creates toggle switches, and sets up event handlers.
 * @returns {Promise<void>}
 */
async function init() {
  const settings = await settingsManager.load({ conv: true, list: true });
  
  convToggle = new ToggleSwitch({
    id: 'conv',
    label: 'Conversation View',
    description: 'Show copy buttons next to each message in conversations',
    checked: settings.conv,
    onChange: (checked) => {
      settingsManager.save({ conv: checked });
    }
  });
  
  listToggle = new ToggleSwitch({
    id: 'list',
    label: 'Thread List View',
    description: 'Show copy buttons in your inbox thread list',
    checked: settings.list,
    onChange: (checked) => {
      settingsManager.save({ list: checked });
    }
  });
  
  settingsContainer.appendChild(convToggle.getElement());
  settingsContainer.appendChild(listToggle.getElement());
  
  /**
   * Handle click on "Open full options" link
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  document.getElementById('open-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

init();
