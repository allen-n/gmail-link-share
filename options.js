const conv = document.getElementById('conv');
const list = document.getElementById('list');

chrome.storage.sync.get({ conv: true, list: true }).then(v => {
  conv.checked = v.conv;
  list.checked = v.list;
});

function saveSettings() {
  const settings = { conv: conv.checked, list: list.checked };
  chrome.storage.sync.set(settings).then(() => {
    chrome.tabs.query({ url: 'https://mail.google.com/*' }, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'settingsChanged', settings }).catch(() => {});
      });
    });
  });
}

conv.addEventListener('change', saveSettings);
list.addEventListener('change', saveSettings);
