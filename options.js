const settingsManager = new SettingsManager();
const historyManager = new HistoryManager();

let convToggle;
let listToggle;
let saveHistoryToggle;
let searchDebounceTimer;

function createHistoryView() {
  const container = document.createElement('div');
  container.className = 'history-view';
  
  const searchContainer = document.createElement('div');
  searchContainer.className = 'history-search-container';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'search-input';
  searchInput.placeholder = 'Search by subject, sender, or recipient...';
  searchInput.setAttribute('aria-label', 'Search email history');
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      filterHistory(e.target.value);
    }, 150);
  });
  
  searchContainer.appendChild(searchInput);
  container.appendChild(searchContainer);
  
  const historyList = document.createElement('div');
  historyList.className = 'history-list';
  historyList.id = 'history-list';
  container.appendChild(historyList);
  
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'history-actions';
  
  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'btn-danger';
  clearButton.textContent = 'Clear All History';
  clearButton.addEventListener('click', showClearConfirmation);
  
  actionsContainer.appendChild(clearButton);
  container.appendChild(actionsContainer);
  
  return container;
}

function createSettingsView() {
  const container = document.createElement('div');
  container.className = 'settings-view';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  
  const title = document.createElement('h2');
  title.className = 'card-title';
  title.innerHTML = '<span class="card-icon">⚙️</span> Button Display Settings';
  
  header.appendChild(title);
  container.appendChild(header);
  
  const settingsContainer = document.createElement('div');
  settingsContainer.className = 'settings-list';
  settingsContainer.id = 'settings-container';
  container.appendChild(settingsContainer);
  
  return container;
}

function renderHistoryItem(entry) {
  const item = document.createElement('div');
  item.className = 'history-item';
  item.setAttribute('data-url', entry.url);
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.setAttribute('aria-label', `Copy link for: ${entry.subject}`);
  
  item.addEventListener('click', () => copyHistoryUrl(entry.url, entry.subject));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyHistoryUrl(entry.url, entry.subject);
    }
  });
  
  const header = document.createElement('div');
  header.className = 'history-item-header';
  
  const subject = document.createElement('h3');
  subject.className = 'history-item-subject';
  subject.textContent = entry.subject || '(No subject)';
  
  const timestamp = document.createElement('span');
  timestamp.className = 'history-item-timestamp';
  timestamp.textContent = HistoryManager.formatTimestamp(entry.timestamp);
  
  header.appendChild(subject);
  header.appendChild(timestamp);
  item.appendChild(header);
  
  const metadata = document.createElement('div');
  metadata.className = 'history-item-metadata';
  
  if (entry.from && entry.from.length > 0) {
    const fromRow = document.createElement('div');
    fromRow.className = 'history-item-meta-row';
    
    const fromLabel = document.createElement('span');
    fromLabel.className = 'history-item-meta-label';
    fromLabel.textContent = 'From:';
    
    const fromValue = document.createElement('span');
    fromValue.className = 'history-item-meta-value';
    fromValue.textContent = entry.from.join(', ');
    fromValue.title = entry.from.join(', ');
    
    fromRow.appendChild(fromLabel);
    fromRow.appendChild(fromValue);
    metadata.appendChild(fromRow);
  }
  
  if (entry.to && entry.to.length > 0) {
    const toRow = document.createElement('div');
    toRow.className = 'history-item-meta-row';
    
    const toLabel = document.createElement('span');
    toLabel.className = 'history-item-meta-label';
    toLabel.textContent = 'To:';
    
    const toValue = document.createElement('span');
    toValue.className = 'history-item-meta-value';
    toValue.textContent = entry.to.join(', ');
    toValue.title = entry.to.join(', ');
    
    toRow.appendChild(toLabel);
    toRow.appendChild(toValue);
    metadata.appendChild(toRow);
  }
  
  if (entry.cc && entry.cc.length > 0) {
    const ccRow = document.createElement('div');
    ccRow.className = 'history-item-meta-row';
    
    const ccLabel = document.createElement('span');
    ccLabel.className = 'history-item-meta-label';
    ccLabel.textContent = 'CC:';
    
    const ccValue = document.createElement('span');
    ccValue.className = 'history-item-meta-value';
    ccValue.textContent = entry.cc.join(', ');
    ccValue.title = entry.cc.join(', ');
    
    ccRow.appendChild(ccLabel);
    ccRow.appendChild(ccValue);
    metadata.appendChild(ccRow);
  }
  
  item.appendChild(metadata);
  
  return item;
}

function renderHistory() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;
  
  historyList.innerHTML = '';
  
  const entries = historyManager.getFiltered();
  
  if (entries.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'history-empty';
    
    const icon = document.createElement('div');
    icon.className = 'history-empty-icon';
    icon.textContent = '📭';
    
    const text = document.createElement('div');
    text.className = 'history-empty-text';
    text.textContent = 'No email history yet';
    
    const subtext = document.createElement('div');
    subtext.className = 'history-empty-subtext';
    subtext.textContent = 'Links you copy in Gmail will appear here';
    
    empty.appendChild(icon);
    empty.appendChild(text);
    empty.appendChild(subtext);
    
    historyList.appendChild(empty);
    return;
  }
  
  entries.forEach(entry => {
    historyList.appendChild(renderHistoryItem(entry));
  });
}

function filterHistory(query) {
  historyManager.filter(query);
  renderHistory();
}

async function copyHistoryUrl(url, subject) {
  try {
    await navigator.clipboard.writeText(url);
    showToast(`Copied link for: ${subject}`, true);
  } catch (err) {
    showToast('Failed to copy link', false);
  }
}

function showClearConfirmation() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const header = document.createElement('div');
  header.className = 'modal-header';
  
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'Clear All History?';
  
  header.appendChild(title);
  modal.appendChild(header);
  
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.textContent = 'This will permanently delete all saved email link history. This action cannot be undone.';
  
  modal.appendChild(body);
  
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn-secondary';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => overlay.remove());
  
  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'btn-danger';
  confirmButton.textContent = 'Clear History';
  confirmButton.addEventListener('click', async () => {
    await historyManager.clear();
    renderHistory();
    overlay.remove();
    showToast('History cleared successfully', true);
  });
  
  actions.appendChild(cancelButton);
  actions.appendChild(confirmButton);
  modal.appendChild(actions);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

async function init() {
  const settings = await settingsManager.load({ conv: true, list: true, saveHistory: true });
  
  await historyManager.load();
  
  const historyContent = createHistoryView();
  const settingsContent = createSettingsView();
  
  const tabs = [
    { id: 'history', label: 'History', content: historyContent },
    { id: 'settings', label: 'Settings', content: settingsContent }
  ];
  
  const tabNav = new TabNavigation(tabs, 'history');
  
  const container = document.getElementById('tab-navigation-container');
  container.appendChild(tabNav.getElement());
  
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
  
  saveHistoryToggle = new ToggleSwitch({
    id: 'saveHistory',
    label: 'Save Link History',
    description: 'Automatically save email metadata (subject, sender, recipients) when you copy links. History is stored locally on your device.',
    checked: settings.saveHistory,
    onChange: (checked) => {
      settingsManager.save({ saveHistory: checked });
    }
  });
  
  const settingsContainer = document.getElementById('settings-container');
  settingsContainer.appendChild(convToggle.getElement());
  settingsContainer.appendChild(listToggle.getElement());
  settingsContainer.appendChild(saveHistoryToggle.getElement());
  
  renderHistory();
  
  document.getElementById('report-issue').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('To report an issue, please contact support or visit our GitHub page', true, 3500);
  });
}

init();
