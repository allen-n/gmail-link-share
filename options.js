/**
 * Options page script
 * Uses reusable components from shared.js
 */

const settingsManager = new SettingsManager();
const settingsContainer = document.getElementById('settings-container');

let convToggle;
let listToggle;

/**
 * Initialize the options page
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
  
  document.getElementById('report-issue').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('To report an issue, please contact support or visit our GitHub page', true, 3500);
  });
}

init();
