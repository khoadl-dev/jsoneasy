document.addEventListener('DOMContentLoaded', async () => {
  const hideButtonCheckbox = document.getElementById('hidePopupButton');
  const sortKeysCheckbox = document.getElementById('sortKeys');
  const wrapLinesCheckbox = document.getElementById('wrapLines');
  const indentRadios = document.getElementsByName('indent');

  const labelHide = document.getElementById('labelHideButton');
  const labelSort = document.getElementById('labelSortKeys');
  const labelWrap = document.getElementById('labelWrapLines');
  const labelIndent = document.getElementById('labelIndent');
  const labelIndentCompact = document.getElementById('labelIndentCompact');
  const labelIndent2 = document.getElementById('labelIndent2');
  const labelIndent4 = document.getElementById('labelIndent4');
  const helpIcon = document.getElementById('helpIconHideButton');

  const labelKeyboardShortcut = document.getElementById('labelKeyboardShortcut');
  const linkKeyboardShortcut = document.getElementById('linkKeyboardShortcut');

  // Initialize localized text
  labelHide.textContent = chrome.i18n.getMessage('settingHideButton');
  labelSort.textContent = chrome.i18n.getMessage('settingSortKeys');
  labelWrap.textContent = chrome.i18n.getMessage('settingWrapLines');
  labelIndent.textContent = chrome.i18n.getMessage('settingIndent');
  labelIndentCompact.textContent = chrome.i18n.getMessage('settingIndentCompact');
  labelIndent2.textContent = chrome.i18n.getMessage('settingIndent2');
  labelIndent4.textContent = chrome.i18n.getMessage('settingIndent4');
  helpIcon.title = chrome.i18n.getMessage('settingHideButtonHelp');

  if (labelKeyboardShortcut) labelKeyboardShortcut.textContent = chrome.i18n.getMessage('settingKeyboardShortcut');
  if (linkKeyboardShortcut) linkKeyboardShortcut.textContent = chrome.i18n.getMessage('settingKeyboardShortcutLink');

  // Load saved settings
  const result = await chrome.storage.local.get(['hidePopupButton', 'sortKeys', 'indentSize', 'wrapLines']);

  hideButtonCheckbox.checked = result.hidePopupButton || false;
  sortKeysCheckbox.checked = result.sortKeys || false;
  wrapLinesCheckbox.checked = result.wrapLines || false;

  const indentSize = result.indentSize !== undefined ? result.indentSize : 2;
  const targetRadio = document.querySelector(`input[name="indent"][value="${indentSize}"]`);
  if (targetRadio) {
    targetRadio.checked = true;
  }

  // Save settings when changed
  hideButtonCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ hidePopupButton: hideButtonCheckbox.checked });
  });

  sortKeysCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ sortKeys: sortKeysCheckbox.checked });
  });

  wrapLinesCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ wrapLines: wrapLinesCheckbox.checked });
  });

  indentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      chrome.storage.local.set({ indentSize: parseInt(radio.value, 10) });
    });
  });

  if (linkKeyboardShortcut) {
    linkKeyboardShortcut.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }
});