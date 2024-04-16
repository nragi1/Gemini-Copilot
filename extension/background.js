var browser = browser || chrome;

// Toggle the chatbot container
chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleChatbot' });
});

// Context menu
chrome.contextMenus.create({
  id: "explainText",
  title: "Explain this...",
  contexts: ["selection"],
});

// Click event for context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainText" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, { action: 'explainText', text: info.selectionText });
  }
});
