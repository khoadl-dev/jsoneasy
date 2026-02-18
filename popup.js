document.addEventListener('DOMContentLoaded', async () => {
  const checkbox = document.getElementById('hidePopupButton');
  const label = document.getElementById('labelHideButton');
  const helpIcon = document.getElementById('helpIconHideButton');

  // Initialize localized text
  label.textContent = chrome.i18n.getMessage('settingHideButton');
  helpIcon.title = chrome.i18n.getMessage('settingHideButtonHelp');

  // Load saved setting
  const result = await chrome.storage.local.get('hidePopupButton');
  checkbox.checked = result.hidePopupButton || false;

  // Save setting when changed
  checkbox.addEventListener('change', () => {
    chrome.storage.local.set({ hidePopupButton: checkbox.checked });
  });
});