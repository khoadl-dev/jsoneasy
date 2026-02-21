# Technical Documentation: Syntax Highlighting

This document outlines the technical design, implementation, and testing of the syntax highlighting system in JSONEasy.

## Overview

The syntax highlighting system is designed to be **lightweight**, **zero-dependency**, and **non-destructive**. It aims to improve the visual scanability of JSON while ensuring the underlying data remains clean for copy-paste operations.

## Architecture

### 1. Standalone Logic (`highlighter.js`)
The core highlighting logic is isolated in `highlighter.js`. This allows the same code to run in:
-   **The Browser**: As a content script injected before `content.js`.
-   **Node.js**: For automated testing in the `/tests` directory.

### 2. Regex Engine
The highlighter uses a single, carefully crafted regular expression to tokenize JSON.

```javascript
/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g
```

#### Regex Breakdown:
-   **Strings & Keys**: ` "(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:) `
    -   Handles escaping (including unicode `\uXXXX` and backslashes `\"`).
    -   Groups colons with the string to identify it as a "Key".
-   **Keywords**: ` \b(true|false|null)\b `
    -   Uses word boundaries to avoid matching inside other text.
-   **Numbers**: ` -?\d+(?:\.\d*)?(?:[eE][+-]?\d+)? `
    -   Supports integers, floating point numbers, and scientific notation (e.g., `-1.23e+4`).

### 3. Non-Destructive Rendering
The highlighter is **visual-only**.
-   When `JSONEasy.showPopup()` is called, we first generate a `formatted` string using `JSON.stringify`.
-   The highlighter transforms this string into HTML with `<span>` tags.
-   **CRITICAL**: The "Copy" button uses the original `formatted` string variable, NOT the HTML-polluted DOM. This ensures users always copy valid JSON.

## CSS Design System

Styles are defined in `styles.css` using easy-to-customize classes:

| Token Type | CSS Class | Color | Description |
| :--- | :--- | :--- | :--- |
| **Key** | `.je-key` | Coral (#d93025) | Bold, matches error state for design consistency. |
| **String** | `.je-string` | Green (#188038) | Deep green for high readability. |
| **Number** | `.je-number` | Blue (#1a73e8) | Standard Material/Chrome blue. |
| **Boolean** | `.je-boolean` | Gold (#f29900) | Weighted orange/gold. |
| **Null** | `.je-null` | Gray (#808080) | Italicized for semantic clarity. |

## Testing Strategy

We avoid heavy testing frameworks in favor of simple Node.js assertions.

-   **Location**: `/tests/highlighter.test.js`
-   **Execution**: Run `node tests/highlighter.test.js`.
-   **Coverage**:
    -   Recursive nested structures.
    -   Complex string escapes (newlines, tabs, quotes).
    -   Numerical edge cases (negatives, exponents).
    -   Fragmented/Malformed JSON (ensures partial matches still work).

## Performance & Scalability

-   **Time Complexity**: O(n) where n is the length of the JSON string.
-   **Memory**: Minimal overhead since it performs a single pass string replacement.
-   **Network**: Zero impact (offline, local processing).
