# JSONEasy: Product Overview

JSONEasy is a high-performance Chrome extension designed for developers who need to quickly view, format, and debug JSON snippets anywhere on the web. Instead of switching tabs or pasting into external tools, JSONEasy provides a robust, in-page formatter that "just works."

## Core Features

### 🚀 Smart Selection Engine
JSONEasy is built to handle the messiness of the web. It doesn't just look at DOM selection; it uses a multi-layered extraction strategy:
-   **Deep Scrapers**: Specifically designed to work with code editors like **Monaco (VS Code/GitHub)**, **CodeMirror**, and **Ace**.
-   **Artifact Stripping**: Automatically removes line numbers, gutter markers, and zero-width spaces that often get included when copying from documentation sites or diffs.
-   **Form Support**: Works inside `<textarea>` and `<input>` fields, making it perfect for debugging form payloads.
-   **Copy-Event Fallback**: If standard selection fails, JSONEasy can even intercept text via an internal copy-command loop to ensure you get the data you need.

### 🧩 Robust Parsing (JSON5)
Powered by the JSON5 engine, JSONEasy handles data that standard parsers reject:
-   **Malformed Data**: Missing quotes, single quotes, and trailing commas are no problem.
-   **Partial Fragments**: Captured only the middle of a huge object or a comma-separated list? JSONEasy will attempt to wrap and parse it as a valid fragment.
-   **Comments Support**: Handles JSON with `//` or `/* */` comments often found in configuration files.

### 🖼 Contextual In-Page Popup
View your data exactly where you found it.
-   **Non-Destructive**: The formatter appears as a lightweight overlay, keeping your current page state intact.
-   **Smart Positioning**: The popup intelligently avoids viewport edges and stays relative to your selection as you scroll or resize.
-   **Zero Bloat**: Built with vanilla JavaScript and CSS for near-instant load times.

### 🛠 Professional Formatting Tools
-   **Key Sorting**: Alphabetically organize object keys to find nested properties faster.
-   **Custom Indentation**: Toggle between 2-space, 4-space, or compact (minified) layouts.
-   **Line Wrapping**: Prevent horizontal scrolling by wrapping long strings automatically.
-   **Semantic Highlighting**: Optional color-coding for keys, strings, numbers, and booleans for instant scanability.

## Workflow Integration

-   **Keyboard First**: Use `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows) to trigger formatting instantly.
-   **Context Menu**: Right-click any selection to "Format with JSONEasy."
-   **One-Click Copy**: Get clean, pretty-printed JSON back into your clipboard with a single click.

## Privacy & Security

Everything happens locally on your machine. Your JSON data is never sent to a server, processed by an AI, or stored beyond your current session. JSONEasy is a private-by-design tool for the privacy-conscious developer.

---

*JSONEasy: Making JSON readable, one selection at a time.*
