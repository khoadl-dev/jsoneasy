chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.formattedJson) {
    document.getElementById("jsonOutput").textContent = request.formattedJson;
  }
});