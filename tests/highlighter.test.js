const { highlightJSON } = require('../highlighter.js');
const assert = require('assert');

console.log('Running Highlighting Tests...');

// Helper to count occurrences of a class in the result
function countClass(html, className) {
  const regex = new RegExp(`class="${className}"`, 'g');
  return (html.match(regex) || []).length;
}

// Test Case 1: All Token Types
const json1 = '{"key": "value", "num": 123.45, "neg": -67, "bool": true, "n": null}';
const html1 = highlightJSON(json1);
assert(countClass(html1, 'je-key') === 5, 'Should find 5 keys');
assert(countClass(html1, 'je-string') === 1, 'Should find 1 value string');
assert(countClass(html1, 'je-number') === 2, 'Should find 2 numbers');
assert(countClass(html1, 'je-boolean') === 1, 'Should find 1 boolean');
assert(countClass(html1, 'je-null') === 1, 'Should find 1 null');
console.log('✓ Test Case 1 passed: All Token Types');

// Test Case 2: Scientific Notation & Diverse Numbers
const json2 = '{"sci": 1.23e+4, "sci2": -5.6E-7, "zero": 0}';
const html2 = highlightJSON(json2);
assert(countClass(html2, 'je-number') === 3, 'Should find 3 numbers in scientific/diverse formats');
console.log('✓ Test Case 2 passed: Scientific Notation');

// Test Case 3: Complex String Escapes
const json3 = '{"escaped": "Line 1\\nLine 2\\tTabbed \\"Quotes\\" and \\\\ backslashes"}';
const html3 = highlightJSON(json3);
assert(html3.includes('Line 1\\nLine 2'), 'Should preserve escaped characters');
assert(countClass(html3, 'je-string') === 1, 'Should treat complex escaped string as a single token');
console.log('✓ Test Case 3 passed: Complex String Escapes');

// Test Case 4: Unicode Escapes
const json4 = '{"unicode": "Hello \\u2728 World"}';
const html4 = highlightJSON(json4);
assert(html4.includes('\\u2728'), 'Should preserve unicode escape sequence');
assert(countClass(html4, 'je-string') === 1, 'Should handle unicode escapes');
console.log('✓ Test Case 4 passed: Unicode Escapes');

// Test Case 5: Strings containing keywords
const json5 = '{"not_null": "null", "not_true": "true", "not_false": "false"}';
const html5 = highlightJSON(json5);
assert(countClass(html5, 'je-null') === 0, 'Keywords inside strings should not be highlighted as keywords');
assert(countClass(html5, 'je-string') === 3, 'Keywords inside strings should be part of the string');
console.log('✓ Test Case 5 passed: Keywords inside strings');

// Test Case 6: Keys with special characters (if they were valid or from loose parsing)
const json6 = '{"key with space": 1, "@type": "test"}';
const html6 = highlightJSON(json6);
assert(countClass(html6, 'je-key') === 2, 'Should handle keys with spaces and symbols');
console.log('✓ Test Case 6 passed: Special keys');

// Test Case 7: Nested Arrays and Objects
const json7 = '{"a": [1, 2, {"b": 3}], "c": {"d": 4}}';
const html7 = highlightJSON(json7);
assert(countClass(html7, 'je-key') === 4, 'Should find 4 keys in nested structure');
assert(countClass(html7, 'je-number') === 4, 'Should find 4 numbers in nested structure');
console.log('✓ Test Case 7 passed: Nested structures');

// Test Case 8: Malformed or Fragmented JSON (since we support it)
const json8 = '"key": "value", "id": 100';
const html8 = highlightJSON(json8);
assert(countClass(html8, 'je-key') === 2, 'Should highlight keys even in fragments');
assert(countClass(html8, 'je-string') === 1, 'Should highlight strings in fragments');
console.log('✓ Test Case 8 passed: Fragments');

console.log('\nAll tests passed! 🚀');
