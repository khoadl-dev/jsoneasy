class JSONEasy {
  constructor() {
    if (window._JSONEasyInstance) {
      return window._JSONEasyInstance;
    }
    window._JSONEasyInstance = this;  // static instance for global access

    this.icon = null;
    this.popup = null;
    this.selectionTimeout = null;
    this.hidePopupButton = false;
    this.lastSelectedText = ''; // Store selection when icon is created
    this.loadSettings();
    this.setupEventListeners();
  }

  static getInstance() {
    if (!window._JSONEasyInstance) {
      new JSONEasy();
    }
    return window._JSONEasyInstance;
  }

  setupEventListeners() {
    // Only use mouseup for selection on document, excluding popup
    document.addEventListener('mouseup', (e) => {
      // Don't handle selections inside the popup
      if ((this.popup && (this.popup === e.target || this.popup.contains(e.target))) ||
        (this.icon && (this.icon === e.target))) {
        return;
      }
      this.handleSelection(e);
    });

    // Handle clicks at the document level
    document.addEventListener('click', (e) => {
      // If clicking the icon, show popup
      if (e.target === this.icon) {
        e.stopPropagation();
        // Use persisted text if available and meaningful, fallback to current selection.
        // Custom editors (Monaco/CodeMirror/etc.) may not expose DOM selection,
        // so allow a copy-event based fallback during this user gesture.
        const selectionObj = window.getSelection();
        let selectionText = this.lastSelectedText;

        // If stored text is too short (likely a CodeMirror/editor issue), try copy fallback
        if (!selectionText || selectionText.length < 2) {
          const copyText = this.getTextFromCopyEventFallback();
          if (copyText.length > selectionText.length) {
            selectionText = copyText;
          }
        }

        selectionText = (selectionText || this.getTextFromSelectionWithCopyFallback(selectionObj)).trim();
        this.showPopup(selectionText);
        return;
      }

      // If clicking inside popup, check if it's the copy button
      if (this.popup && this.popup.contains(e.target)) {
        const isCopyButton = e.target.closest('.je-copy-button');
        if (isCopyButton) {
          // Let the copy button handler deal with it
          return;
        }
        // For any other click inside popup, prevent closing
        e.stopPropagation();
        return;
      }

      // If clicking elsewhere, remove elements
      this.removeElements();
    }, true); // Use capture phase

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.popup && this.icon) {
        this.updatePopupPosition();
      }
    });

    // Handle scroll
    window.addEventListener('scroll', () => {
      if (this.popup && this.icon) {
        this.updatePopupPosition();
      }
    }, { passive: true });

    // Handle Escape key to dismiss popup/icon
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.removeElements();
      }
    });
  }

  async loadSettings() {
    const result = await chrome.storage.local.get('hidePopupButton');
    this.hidePopupButton = result.hidePopupButton || false;

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.hidePopupButton) {
        this.hidePopupButton = changes.hidePopupButton.newValue;
        if (this.hidePopupButton) {
          this.removeElements();
        }
      }
    });
  }

  handleSelection(event) {
    // Don't show popup button if setting is enabled
    if (this.hidePopupButton) {
      return;
    }

    // Clear any existing timeout
    if (this.selectionTimeout) {
      clearTimeout(this.selectionTimeout);
    }

    // Capture coordinates from the event to use as fallback
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Set new timeout
    this.selectionTimeout = setTimeout(() => {
      const selection = window.getSelection();
      let selectedText = this.getTextFromSelection(selection);

      // If no DOM selection, check if the active element is actually a code editor.
      if (selectedText === '') {
        const activeElement = document.activeElement;
        const isInsideEditor = activeElement?.closest('.monaco-editor, .cm-editor, .CodeMirror, .ace_editor, [class*="editor"]');

        // Only show if we are in an editor AND the selection is not collapsed.
        // This handles editors that don't expose text in the DOM but do have a selection range.
        if (!isInsideEditor || selection.isCollapsed) {
          this.lastSelectedText = '';
          return;
        }
      }

      this.lastSelectedText = selectedText;
      const position = this.determineIconPosition(selection, mouseX, mouseY);
      if (position) {
        this.createIcon(position.x, position.y);
      }
    }, 100); // Longer delay to ensure selection is stable
  }

  getTextFromSelection(selection) {
    const activeElement = document.activeElement;

    // 1. Get DOM selection and filter out editor artifacts (like "-" or "\u200B" placeholders)
    let domText = selection.toString().trim();
    if (domText.length < 2 && (domText === '-' || domText === '\u200B')) {
      domText = '';
    }

    // 2. Try form elements (Inputs/Textareas)
    let formText = '';
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      try {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        if (start !== undefined && end !== undefined && start !== end) {
          const raw = activeElement.value.substring(start, end).trim();
          if (raw.length > 1 || (raw !== '-' && raw !== '\u200B')) {
            formText = raw;
          }
        }
      } catch (e) { }
    }

    if (formText.length > domText.length) return formText;
    return domText || formText || '';
  }

  getScrapedText() {
    const activeElement = document.activeElement;
    // Deep Scraper (Generic Editor Fallback)
    // Only search the context of the active element to avoid accidental triggers from unrelated editors.
    const container = activeElement?.closest('.monaco-editor, .cm-editor, .CodeMirror, .ace_editor, [class*="editor"]');

    if (container) {
      // Try specific editor line selectors first (Monaco, CM6, CM5, Ace, generic pre)
      const lineSelectors = ['.view-line', '.cm-line', '.CodeMirror-line', '.ace_line', 'pre'];
      let lineElements = [];

      for (const selector of lineSelectors) {
        const found = container.querySelectorAll(selector);
        if (found.length > 0) {
          lineElements = Array.from(found);
          break;
        }
      }

      // If no specific lines found, fallback to more generic but filtered line elements
      if (lineElements.length === 0) {
        lineElements = Array.from(container.querySelectorAll('[class*="line"], [class*="row"]'))
          .filter(el => {
            const className = (el.className || '').toString();
            // Filter out common gutter/line-number classes
            return !/gutter|number|margin|lineno|index/i.test(className);
          });
      }

      if (lineElements.length > 0) {
        const scraped = lineElements
          .map(l => l.textContent)
          .filter(t => t.trim().length > 0)
          .join('\n').trim();

        if (scraped.length > 5) return scraped;
      }
    }

    // ContentEditable Fallback
    if (activeElement?.getAttribute('contenteditable') === 'true' || activeElement?.isContentEditable) {
      const ceText = activeElement.innerText.trim();
      if (ceText.length > 5) return ceText;
    }

    return '';
  }

  getTextFromSelectionWithCopyFallback(selection) {
    // 1. Direct DOM/Form selection (allow short selections for numbers/booleans)
    const directText = this.getTextFromSelection(selection);
    if (directText) return directText;

    // 2. Try Copy Event Fallback (for editors like Ace/Monaco)
    const copyText = this.getTextFromCopyEventFallback();
    if (copyText) return copyText;

    // 3. Last resort: Scrape the entire editor content
    return this.getScrapedText() || directText;
  }

  getTextFromCopyEventFallback() {
    let capturedText = '';
    const activeElement = document.activeElement;

    // 1. Monkey-patch navigator.clipboard.writeText (Modern editors)
    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = async (text) => {
      capturedText = text;
      return originalWriteText.apply(navigator.clipboard, [text]);
    };

    const onCopy = (e) => {
      // Try to GET data already set by the editor (Bubble phase is good for this)
      try {
        const data = e.clipboardData?.getData('text/plain');
        if (data && data.length > 0) {
          capturedText = data;
        }
      } catch (err) { }

      // Also intercept setData calls
      if (e.clipboardData && !capturedText) {
        const originalSetData = e.clipboardData.setData.bind(e.clipboardData);
        e.clipboardData.setData = (type, value) => {
          if (type === 'text/plain') {
            capturedText = value;
          }
          return originalSetData(type, value);
        };
      }
    };

    // Bubble phase increases odds we see editor-populated clipboardData
    document.addEventListener('copy', onCopy, false);
    document.addEventListener('copy', onCopy, true);

    if (activeElement && activeElement !== document) {
      activeElement.addEventListener('copy', onCopy, false);
      activeElement.addEventListener('copy', onCopy, true);
    }

    try {
      if (typeof document.execCommand === 'function') {
        document.execCommand('copy');
      }
    } catch (err) {
      console.error('[JSONEasy] execCommand error:', err);
    } finally {
      // Revert monkey-patch and listeners after a delay
      setTimeout(() => {
        navigator.clipboard.writeText = originalWriteText;
        document.removeEventListener('copy', onCopy, false);
        document.removeEventListener('copy', onCopy, true);
        if (activeElement && activeElement !== document) {
          activeElement.removeEventListener('copy', onCopy, false);
          activeElement.removeEventListener('copy', onCopy, true);
        }
      }, 100);
    }

    return (capturedText || '').trim();
  }

  determineIconPosition(selection, fallbackX, fallbackY) {
    // Check if selection is within a form element
    const activeElement = document.activeElement;
    const isFormElement = activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT';

    let x, y;

    if (isFormElement) {
      // Get coordinates relative to the form element
      const elementRect = activeElement.getBoundingClientRect();
      // Position below the input/textarea
      x = elementRect.left;
      y = elementRect.bottom;
    } else {
      // Use normal range positioning for other elements
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // Use rect if it's not empty
        if (rect.width > 0 || rect.height > 0) {
          x = rect.left;
          y = rect.bottom;
        } else {
          // Fallback to mouse coordinates or active element
          x = fallbackX || rect.left;
          y = (fallbackY || rect.bottom) + 10; // offset slightly from cursor
        }
      } else if (fallbackX !== undefined && fallbackY !== undefined) {
        x = fallbackX;
        y = fallbackY + 10;
      } else if (activeElement && activeElement !== document.body) {
        // Last resort: active element bottom
        const rect = activeElement.getBoundingClientRect();
        x = rect.left;
        y = rect.bottom;
      } else {
        return null;
      }
    }

    return { x, y };
  }

  createIcon(x, y) {
    if (this.icon) {
      this.icon.remove();
    }

    this.icon = document.createElement('div');
    this.icon.className = 'je-icon';

    // Ensure icon is visible on screen
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;

    x = Math.min(Math.max(x, 15), windowWidth - 30);
    y = Math.min(Math.max(y, 15), windowHeight - 30);

    this.icon.style.left = `${x}px`;
    this.icon.style.top = `${y}px`;

    document.body.appendChild(this.icon);
  }

  calculateOptimalPosition(iconRect, popupWidth, popupHeight) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    // Don't use scroll offset for fixed positioning
    // Calculate available space in each direction
    const spaceAbove = iconRect.top;
    const spaceBelow = viewportHeight - iconRect.bottom;
    const spaceLeft = iconRect.left;
    const spaceRight = viewportWidth - iconRect.right;

    let position = {
      top: 0,
      left: 0,
      position: 'bottom'
    };

    // Determine vertical position (viewport-relative)
    if (spaceBelow >= popupHeight || spaceBelow > spaceAbove) {
      position.top = iconRect.bottom;  // Remove scrollY
      position.position = 'bottom';
    } else {
      position.top = iconRect.top - popupHeight;  // Remove scrollY
      position.position = 'top';
    }

    // Determine horizontal position (viewport-relative)
    if (iconRect.left + popupWidth > viewportWidth) {
      if (popupWidth < iconRect.right) {
        position.left = iconRect.right - popupWidth;  // Remove scrollX
        position.position = 'left';
      } else {
        position.left = Math.max(0, (viewportWidth - popupWidth) / 2);
      }
    } else {
      position.left = iconRect.left;  // Remove scrollX
    }

    // Ensure minimum margins from viewport edges
    const margin = 5;
    position.top = Math.min(Math.max(margin, position.top),
      viewportHeight - popupHeight - margin);
    position.left = Math.min(Math.max(margin, position.left),
      viewportWidth - popupWidth - margin);

    return position;
  }

  updatePopupPosition(isError = false) {
    if (!this.popup || !this.icon) return;

    // Get the current dimensions
    const iconRect = this.icon.getBoundingClientRect();
    const popupRect = this.popup.getBoundingClientRect();

    // Calculate optimal position
    const position = this.calculateOptimalPosition(iconRect, popupRect.width, popupRect.height);

    // Update position classes while preserving error class if present
    const classes = ['je-popup', `position-${position.position}`];
    if (isError) {
      classes.push('je-error');
    }
    if (this.popup.classList.contains('showing')) {
      classes.push('showing');
    }
    this.popup.className = classes.join(' ');

    // Apply position
    this.popup.style.top = `${position.top}px`;
    this.popup.style.left = `${position.left}px`;
  }

  showPopup(text) {
    // Remove existing popup if any
    if (this.popup) {
      this.popup.remove();
    }

    this.popup = document.createElement('div');
    this.popup.className = 'je-popup showing';

    let isError = false;
    try {
      let jsonText = this.tryParseJSON(text);
      const formatted = this.formatJSON(jsonText);

      // Create content container
      const content = document.createElement('div');
      content.className = 'je-content';

      // Create pre element for the JSON content
      const pre = document.createElement('pre');
      pre.style.margin = '0';
      pre.textContent = formatted;

      // Create header for the copy button
      const header = document.createElement('div');
      header.className = 'je-header';

      // Create copy button with initial copy icon
      const copyButton = document.createElement('button');
      copyButton.className = 'je-copy-button';

      copyButton.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>`;

      // Success checkmark icon SVG
      const checkIcon = `
        <svg viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>`;

      copyButton.onclick = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        try {
          await navigator.clipboard.writeText(formatted);

          copyButton.innerHTML = checkIcon;
          copyButton.classList.add('copied');

          setTimeout(() => {
            if (copyButton && document.contains(copyButton)) {
              copyButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>`;
              copyButton.classList.remove('copied');
            }
          }, 1500);
        } catch (e) {
          chrome.runtime.sendMessage({
            type: 'log',
            level: 'warn',
            text: 'Copy failed',
            data: { text: text, error: { message: e.message, stack: e.stack, name: e.name } },
          });
        }
      };

      // Add elements to popup
      header.appendChild(copyButton);
      this.popup.appendChild(header);
      content.appendChild(pre);
      this.popup.appendChild(content);
    } catch (e) {
      chrome.runtime.sendMessage({
        type: 'log',
        level: 'warn',
        text: 'JSON parsing error',
        data: { text: text, error: { message: e.message, stack: e.stack, name: e.name } },
      });
      isError = true;
      this.popup.textContent = 'Invalid JSON format';
    }

    // Add to DOM to get dimensions
    document.body.appendChild(this.popup);

    // Position the popup optimally, passing the error state
    this.updatePopupPosition(isError);

    // Remove the showing class after animation
    setTimeout(() => {
      if (this.popup) {
        this.popup.classList.remove('showing');
        // Reapply position classes and error class if needed
        this.updatePopupPosition(isError);
      }
    }, 50);
  }

  formatJSON(obj) {
    if (typeof obj === 'string') {
      // If obj is still a string, try to parse it one more time
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        // If parsing fails, return the formatted string as is
        chrome.runtime.sendMessage({
          type: 'log',
          level: 'info',
          text: 'String could not be parsed',
          data: { text: obj, error: { message: e.message, stack: e.stack, name: e.name } },
        });
      }
    }
    return JSON.stringify(obj, null, 2);
  }

  tryParseJSON(text) {
    // 1. Pre-clean: Replace non-breaking spaces and other common invisible artifacts
    const cleanText = text
      .replace(/\u00A0/g, ' ') // Non-breaking space
      .replace(/\u200B/g, '')  // Zero-width space
      .trim();

    const attempts = [
      // Attempt 1: Standard/JSON5 parse
      () => {
        const parsed = JSON5.parse(cleanText);
        // If it returns a string, it might be double-encoded or it was just a string
        return typeof parsed === 'string' && (parsed.trim().startsWith('{') || parsed.trim().startsWith('['))
          ? JSON5.parse(parsed)
          : parsed;
      },
      // Attempt 2: Handle array fragments or comma-separated lists
      () => JSON5.parse(`[${cleanText}]`),
      // Attempt 3: Handle object fragments (captured middle of an object)
      () => JSON5.parse(`{${cleanText}}`),
      // Attempt 4: Last resort - try to strip common "code editor" artifacts like line numbers
      () => {
        const lines = cleanText.split('\n');
        const stripped = lines.map(line => line.replace(/^[ ]*\d+[ ]+/, '')).join('\n');
        if (stripped === cleanText) throw new Error("No line numbers found to strip");
        return JSON5.parse(stripped);
      }
    ];

    let lastError;
    for (let attempt of attempts) {
      try {
        return attempt();
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    throw lastError;
  }

  removeElements() {
    if (this.icon || this.popup) {
      if (this.icon) {
        this.icon.remove();
        this.icon = null;
      }
      if (this.popup) {
        this.popup.remove();
        this.popup = null;
      }
    }
  }
}

if (!window._JSONEasyInstance) {
  const jsonEasy = new JSONEasy();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHOW_POPUP") {
    showPopupOnCtxMenuClick(message.text);
    // Send a response back to acknowledge receipt
    sendResponse({ success: true });
  }
});

// Function for context menu integration
function showPopupOnCtxMenuClick(selectionText) {
  const jsonEasy = JSONEasy.getInstance();
  jsonEasy.removeElements();

  const selection = window.getSelection();
  const selectedText = (jsonEasy.getTextFromSelectionWithCopyFallback(selection) || selectionText || '').trim();

  if (!selectedText) {
    return;
  }

  try {
    const position = jsonEasy.determineIconPosition(selection);
    if (position) {
      jsonEasy.createIcon(position.x, position.y);
      jsonEasy.lastSelectedText = selectedText;
      jsonEasy.showPopup(selectedText);
    }
  } catch (e) {
    // If positioning fails (e.g. no range and not a form element), still try to show popup at default position
    chrome.runtime.sendMessage({
      type: 'log',
      level: 'info',
      text: 'Positioning failed, using fallback',
      data: { text: selectedText, error: e.message },
    });

    // Fallback: Show at top-middle of viewport
    const x = window.innerWidth / 2 - 15;
    const y = 50;
    jsonEasy.createIcon(x, y);
    jsonEasy.lastSelectedText = selectedText;
    jsonEasy.showPopup(selectedText);
  }
}
