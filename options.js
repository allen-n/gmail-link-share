/**
 * Options page script
 * Uses reusable components from shared.js (SettingsManager, ToggleSwitch, showToast)
 * Provides full settings interface accessible via right-click menu
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
 * Initialize the options page.
 * Loads current settings, creates toggle switches, and sets up event handlers.
 * @returns {Promise<void>}
 */
async function init() {
  const settings = await settingsManager.load({ conv: true, list: true });
  
  convToggle = new ToggleSwitch({
    id: 'conv',
    label: 'Conversation View',
    description: 'Show "Copy link" buttons next to each message bubble when viewing conversations',
    checked: settings.conv,
    onChange: (checked) => {
      settingsManager.save({ conv: checked });
    }
  });
  
  listToggle = new ToggleSwitch({
    id: 'list',
    label: 'Thread List View',
    description: 'Show "Copy link" buttons in your inbox thread list (copies link to last message in thread)',
    checked: settings.list,
    onChange: (checked) => {
      settingsManager.save({ list: checked });
    }
  });
  
  settingsContainer.appendChild(convToggle.getElement());
  settingsContainer.appendChild(listToggle.getElement());
  
  /**
   * Handle click on "Report an issue" link
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  document.getElementById('report-issue').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('To report an issue, please contact support or visit our GitHub page', true, 3500);
  });
}

init();
