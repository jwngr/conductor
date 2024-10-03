document.getElementById('saveButton')?.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, {action: 'saveUrl'});
    }
  });
});
