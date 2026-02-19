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
 * Container element for history settings
 * @type {HTMLElement}
 */
const historySettingsContainer = document.getElementById('history-settings-container');

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
 * Toggle switch for save history setting
 * @type {ToggleSwitch}
 */
let saveHistoryToggle;
let enhancedHistoryDetailsToggle;

/**
 * Initialize the popup page.
 * Loads current settings, creates toggle switches, and sets up event handlers.
 * @returns {Promise<void>}
 */
async function init() {
  const settings = await settingsManager.load({
    conv: true,
    list: true,
    saveHistory: true,
    enhancedHistoryDetails: false,
  });
  
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
  
  saveHistoryToggle = new ToggleSwitch({
    id: 'saveHistory',
    label: 'Save Link History',
    description: 'Save copied links to local history',
    checked: settings.saveHistory,
    onChange: (checked) => {
      settingsManager.save({ saveHistory: checked });
    }
  });

  enhancedHistoryDetailsToggle = new ToggleSwitch({
    id: 'enhancedHistoryDetails',
    label: 'Enhanced History Details',
    description: 'Optional: request broader Gmail read-only scope for Subject/From/To/CC history',
    checked: settings.enhancedHistoryDetails,
    onChange: (checked) => {
      settingsManager.save({ enhancedHistoryDetails: checked });
    }
  });
  
  settingsContainer.appendChild(convToggle.getElement());
  settingsContainer.appendChild(listToggle.getElement());
  
  historySettingsContainer.appendChild(saveHistoryToggle.getElement());
  historySettingsContainer.appendChild(enhancedHistoryDetailsToggle.getElement());
  
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
