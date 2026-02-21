# JSONEasy: Product Overview

JSONEasy is a high-performance Chrome extension designed for developers who need to quickly view, format, and debug JSON snippets anywhere on the web.

## Core Features

### 🚀 Smart Detection
JSONEasy doesn't just parse clean JSON. It can handle:
-   **Partial Fragments**: Middle of a huge object? No problem.
-   **Malformed Data**: Missing quotes or trailing commas are handled by our underlying JSON5 engine.
-   **Code Editor Artifacts**: We automatically strip line numbers and gutter markers from selections in tools like VS Code or GitHub.

### 🎨 Semantic Syntax Highlighting (NEW!)
JSONEasy now automatically color-codes your JSON, making it instantly readable.
-   **Instant Scanability**: Distinguish keys from values at a glance.
-   **Type Recognition**: Numbers, strings, booleans, and null values have distinct, intuitive colors.
-   **Clean Copy-Paste**: The colors are for your eyes only. When you hit "Copy," you get 100% clean, valid JSON for your terminal or IDE.
-   **Full Control**: Prefer the raw look? You can toggle syntax highlighting on or off instantly from the settings menu.

### 🛠 Developer Tools
-   **Key Sorting**: Alphabetically organize object keys to find what you need faster.
-   **Custom Indentation**: Choose between 2-space, 4-space, or compact (tab) layouts.
-   **Keyboard First**: Built-in shortcuts (`Cmd+Shift+E`) keep you in your flow state.

## Why Choose JSONEasy?

### 1. Zero Bloat
We don't use heavy libraries. JSONEasy is built with vanilla JavaScript and CSS, ensuring it's fast even on low-spec hardware.

### 2. Privacy by Design
Everything happens locally on your machine. Your JSON data is never sent to a server, processed by an AI, or stored beyond your current session.

### 3. "Just Works" in Any Editor
Whether you're on a documentation site, a GitHub PR, or a custom internal dashboard using CodeMirror/Monaco, JSONEasy's advanced selection engine will find the JSON for you.

---

*JSONEasy: Making JSON readable, one selection at a time.*
