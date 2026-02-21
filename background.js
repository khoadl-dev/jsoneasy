chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "SHOW_POPUP",
    title: chrome.i18n.getMessage("contextMenuTitle"),
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, {
    type: "SHOW_POPUP",
    text: info.selectionText || "",
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('[JSONEasy]', JSON.stringify(chrome.runtime.lastError, null, 2));
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'log') {
    console[msg.level]('[JSONEasy]', msg.text, '\n', msg.data || '');
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "parse_json") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "SHOW_POPUP",
          text: "" // content.js will get the selection
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('[JSONEasy]', JSON.stringify(chrome.runtime.lastError, null, 2));
          }
        });
      }
    });
  }
});
