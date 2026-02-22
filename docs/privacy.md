
## Single purpose description

This extension formats JSON text to make it readable. When you come across JSON data on a webpage that's hard to read (like minified or poorly formatted JSON), select it and the extension will display it in a clean, structured way.

## contextMenus justification

* Required to add the "View formatted JSON" right-click menu option when text is selected on web pages
* Enables users to access the JSON formatting functionality through the context

## Scripting justification

* Needed to inject and execute the JSON parsing and formatting code on web pages
* Essential for the core functionality of processing and displaying formatted JSON content

## Storage justification

* Used to save user preferences (like the "Hide popup button" setting)
* Persists user settings between browser sessions

## Host permission justification

* Required to detect and format JSON content on any webpage (hence <all_urls>)
* Necessary for the extension to function across all websites where users might encounter JSON data
