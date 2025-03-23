chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "formatJson",
    title: "Format JSON",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "formatJson" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: formatJson,
      args: [info.selectionText]
    });
  }
});

function formatJson(selectedText) {
  let jsonString = selectedText;

  // Remove newlines and extra spaces
  jsonString = jsonString.replace(/\s+/g, '');

  // Handle various JSON string formats
  jsonString = jsonString.replace(/\\\"/g, '"'); // Handle escaped quotes
  jsonString = jsonString.replace(/\\\\"/g, '\\"'); // Handle double escaped quotes
  jsonString = jsonString.replace(/(^"|"$)/g, ''); // Remove surrounding quotes

  try {
    const jsonObject = JSON.parse(jsonString);
    const formattedJson = JSON.stringify(jsonObject, null, 2);

    // Send formatted JSON to the popup
    chrome.runtime.sendMessage({ formattedJson: formattedJson });

    // Inject icon next to the selected text
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: injectIcon,
      args: [formattedJson]
    });
  } catch (error) {
    console.error("Invalid JSON string:", error);
  }
}

function injectIcon(formattedJson) {
  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("icons/icon16.png");
  icon.style.width = "16px";
  icon.style.height = "16px";
  icon.style.position = "absolute";
  icon.style.cursor = "pointer";
  icon.style.zIndex = "1000";

  document.body.appendChild(icon);

  // Get the bounding box of the selected text
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Position the icon next to the selected text
  icon.style.top = `${rect.top + window.scrollY}px`;
  icon.style.left = `${rect.right + window.scrollX + 5}px`;

  icon.addEventListener("click", () => {
    // Show the formatted JSON in a popup
    alert(formattedJson);
  });

  // Remove the icon when the user clicks elsewhere
  document.addEventListener("click", (e) => {
    if (e.target !== icon) {
      icon.remove();
    }
  }, { once: true });
}