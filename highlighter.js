/**
 * Simple JSON syntax highlighter using regex.
 * Wraps tokens in <span> tags with classes: je-key, je-string, je-number, je-boolean, je-null.
 */
function highlightJSON(json) {
  if (!json) return '';

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'je-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'je-key';
        } else {
          cls = 'je-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'je-boolean';
      } else if (/null/.test(match)) {
        cls = 'je-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

// Support Node.js for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { highlightJSON };
}
