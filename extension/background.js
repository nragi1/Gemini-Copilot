var browser = browser || chrome;

chrome.action.onClicked.addListener(function(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }).then(() => {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleChatbot' });
  }).catch((error) => {
    console.error('Error executing script:', error);
  });
});