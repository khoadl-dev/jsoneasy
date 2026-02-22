# JSONEasy: Technical Architecture

This document describes the technical design, implementation strategies, and architectural patterns used in JSONEasy.

## Overview

JSONEasy is a client-side Chrome extension designed for non-destructive JSON formatting. It operates entirely within the user's browser context, utilizing vanilla JavaScript and zero external dependencies except for the JSON5 parser.

## Core Components

### 1. Selection & Extraction Engine (`content.js`)
The most complex part of JSONEasy is reliably extracting JSON from diverse web environments. It uses a hierarchical discovery strategy:

1.  **Standard DOM Selection**: Uses `window.getSelection()` for normal text.
2.  **Form Element Detection**: Automatically detects and extracts text from active `<textarea>` and `<input>` elements.
3.  **Editor "Deep Scrapers"**:
    -   Targeted selectors for **Monaco**, **CodeMirror**, and **Ace** editors.
    -   Iterative line-by-line scraping to rebuild the text content while stripping line numbers and gutter markers.
4.  **Copy-Event Interception**:
    -   Monkey-patches `navigator.clipboard.writeText` and intercepts `copy` events.
    -   Programmatically triggers a `copy` command to "trick" complex editors into providing their internal text state, which might not be accurately reflected in the DOM.

### 2. Multi-Stage Parsing Pipeline
JSONEasy uses a resilient parsing flow to handle partial or malformed snippets:

1.  **Pre-cleaning**: Strips non-breaking spaces (`\u00A0`), zero-width spaces (`\u200B`), and common line-number patterns.
2.  **JSON5 Engine**: Provides support for ES5-like features (single quotes, trailing commas, comments).
3.  **Fragment Strategy**: If direct parsing fails, the engine attempts to wrap the text in `[]` (array fragment) or `{}` (object fragment) to see if it's a captured subset of a larger structure.

### 3. Contextual UI System
The popup is designed to be lightweight and responsive:

-   **Dynamic Positioning**: Uses a viewport-aware algorithm (`calculateOptimalPosition`) to ensure the popup stays visible regardless of where the selection occurs.
-   **Scroll/Resize Synchronization**: Listeners update the popup position in real-time to maintain context.
-   **CSS Isolation**: Uses the `je-` prefix for all classes and IDs to avoid style collisions with the host page without the overhead of Shadow DOM.
-   **Live Settings**: Uses `chrome.storage.onChanged` to provide instant UI feedback when the user toggles settings (wrap lines, syntax highlighting, etc.) in the extension popup.

---

## Syntax Highlighting System (`highlighter.js`)

The highlighting system is a lightweight tokenization engine built for speed.

### Highlighting Regex
A single-pass regex is used to tokenize the JSON string:
```javascript
/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g
```

### Design System
Tokens are wrapped in `<span>` elements with the following class mappings:

| Token Type | CSS Class | Description |
| :--- | :--- | :--- |
| **Key** | `.je-key` | JSON keys (includes the trailing colon). |
| **String** | `.je-string` | Standard string values. |
| **Number** | `.je-number` | Integers, floats, and scientific notation. |
| **Boolean** | `.je-boolean` | `true` and `false` literals. |
| **Null** | `.je-null` | The `null` literal. |

---

## Architecture

-   **`content.js`**: State manager and UI controller. Handles DOM interaction and coordination.
-   **`highlighter.js`**: Pure utility for tokenizing strings. Decoupled for testing.
-   **`background.js`**: Lightweight event page for context menu registration and keyboard command routing.
-   **`manifest.json`**: Defined with `run_at: "document_end"` to ensure the selection engine is available as soon as possible.

## Testing Strategy

-   **Unit Tests**: Located in `/tests/`, focusing on the tokenizer and parsing heuristics.
-   **Manual Verification**: Tested against varied sites (GitHub, StackOverflow, internal dashboards) to ensure editor scraper reliability.
-   **CI/CD**: Simple Node.js-based assertions ensure regex performance and edge-case handling.
