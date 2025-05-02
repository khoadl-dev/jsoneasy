chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "SHOW_POPUP",
    title: "View formatted JSON",
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
