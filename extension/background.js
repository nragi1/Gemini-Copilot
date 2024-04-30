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

chrome.commands.onCommand.addListener((command) => {
  if (command === 'explain-text') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: getSelectedText,
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const selectedText = results[0].result;
          chrome.tabs.sendMessage(tabs[0].id, { action: 'explainText', text: selectedText });
        }
      });
    });
  }
});

function getSelectedText() {
  return window.getSelection().toString();
}