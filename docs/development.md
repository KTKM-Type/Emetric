# Development

## Environment

Emetric runs as ExtendScript inside Adobe InDesign. No package manager or build system is required for the current single-file source.

## Editing

Edit only:

```text
src/indesign/Emetric.jsx
```

Keep these directives at the beginning of the file:

```javascript
#target "InDesign"
#targetengine "Emetric"
```

## Version metadata

Update the metadata block near the beginning of the source:

```javascript
var APP_NAME = "Emetric";
var VERSION = "0.42.0-alpha.3";
var RELEASE_STATUS = "ALPHA";
```

For a stable release, use a stable semantic version and set `RELEASE_STATUS` to an empty string.

## Compatibility

ExtendScript uses an older JavaScript engine. Avoid syntax that is not supported by the target InDesign versions, including modules, arrow functions, `let`, `const`, classes, optional chaining, and other modern-only constructs.

## Testing

There is currently no automated InDesign integration test suite. Run the manual checklist in `tests/manual-test-checklist.md` before merging a release branch.

A general JavaScript parser may be used as an additional syntax check after temporarily removing the two ExtendScript `#target` directives, but that does not replace testing inside InDesign.
