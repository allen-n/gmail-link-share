/**
 * Popup page script
 * Uses reusable components from shared.js
 */

const settingsManager = new SettingsManager();
const settingsContainer = document.getElementById('settings-container');

let convToggle;
let listToggle;

/**
 * Initialize the popup page
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
  
  document.getElementById('open-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

init();
