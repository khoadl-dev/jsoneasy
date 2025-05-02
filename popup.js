document.addEventListener('DOMContentLoaded', async () => {
  const checkbox = document.getElementById('hidePopupButton');
  
  // Load saved setting
  const result = await chrome.storage.local.get('hidePopupButton');
  checkbox.checked = result.hidePopupButton || false;
  
  // Save setting when changed
  checkbox.addEventListener('change', () => {
    chrome.storage.local.set({ hidePopupButton: checkbox.checked });
  });
});