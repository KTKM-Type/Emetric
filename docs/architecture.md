# Architecture notes

This is a map of `src/indesign/Emetric.jsx`, written to make the file
faster to navigate. It reflects the structure as of version
`0.42.0-beta.3`, which includes the stability fixes described in
[`CHANGELOG.md`](../CHANGELOG.md). Line numbers will drift
as the file changes; treat them as "approximately here", not exact
addresses.

## The big picture

Emetric is a single ExtendScript file wrapped in one IIFE
(`(function () { ... })();`). ExtendScript has no `require`/`import`, so
there is no natural way to split this into multiple runtime modules —
everything has to live in one file that InDesign's script engine loads
directly. That constraint, not an accident, is why the file is ~12,500
lines long. There is no build step: `src/indesign/Emetric.jsx` *is* the
program, and the version under `dist/beta/` is a copy of it.

The file is not organized into formally separated modules. It reads
top to bottom as one long script:

1. Constants, diagnostics/logging helpers.
2. Pure math/formatting utilities (units, arithmetic input parsing,
   number formatting).
3. Page-size preset tables and lookup helpers.
4. `calculate(v)` — the core typographic/geometry engine.
5. Small ScriptUI construction helpers (`addRow`, `addSection`, ...).
6. InDesign document primitives (layers, guides, margins, paragraph
   styles, baseline grid, placeholder text, the "Emetric Data" info
   page).
7. `createDocument(v, r, options)` — orchestrates the primitives above
   into an actual InDesign document. This is what runs when the user
   clicks Create.
8. Preset-icon UI (the save/delete pictograms and their theming).
9. The main window (`w`) and compact window (`compactWindow`) are
   constructed as ScriptUI trees, with event handlers
   (`.onChange`, `.onClick`, `.onChanging`) attached inline as each
   control is created. This section is the largest single piece of the
   file (roughly lines 3400–12500) because ScriptUI construction is
   verbose and every field needs at least one handler wired to it.
10. The preset persistence layer (`presets.json` read/write).
11. Live-preview-document management and input-focus tracking.
12. `w.show()` at the very end — this is the statement that actually
    starts the tool running.

Because construction code and event-wiring code run immediately (they
are not deferred inside a `function main() {}`), you cannot always
jump straight to "the function that does X" — sometimes the relevant
code is a top-level statement near where the corresponding UI control
is built.

## Execution flow: editing values

- `readValues()` (~10,320) reads every input field into a plain data
  object `v`.
- `calculate(v)` (~1,522) is a pure function: given `v`, it returns a
  result object `r` with every derived measurement (margins, grid
  cell size, type area, page size, etc.). It has no side effects and
  does not touch the UI — this is the one function you can reason
  about in isolation.
- `update()` (~10,366) ties the two together: `readValues()` →
  `calculate()` → writes the result back into the (mostly read-only)
  output fields, and refreshes the live preview document if enabled.
- `getDocumentOptions()` (~11,370) builds the options object that gets
  passed to `createDocument()` when the user clicks Create.

## Execution flow: building a document

- `createDocument(doc's v, r, options)` (~3,194) is the orchestrator.
  It calls, roughly in order: `ensureLayer`, `addBoundaryGuides` /
  `addIntersectionGuides`, `applyPageMargins`, `createParagraphStyles`,
  `setupDocumentAndBaselineGrids`, `createPlaceholderTextFrame`,
  `createInformationFrame` (the "Emetric Data" page),
  `applyDocumentDefaultStyles`, `applyPageBoundSettings`.
- `createInformationFrame` (~2,588) is purely a text-formatting
  function: it takes the same `options` object and writes a
  human-readable summary of what was used onto the info page. Because
  it reads from `options` rather than recomputing anything, any field
  that `getDocumentOptions()` populates incorrectly will show up wrong
  here — see `docs/maintenance-notes.md` for a bug of exactly this
  shape that was fixed.

## Execution flow: presets

- `capturePresetSettings()` (~6,450, exact line drifts) reads the
  entire UI into a plain settings object.
- `presetJSONStringify` / `presetJSONParse` (~5,960–6,090) are a
  hand-rolled JSON codec (ExtendScript may not have a native `JSON`
  global on every host version, so `presetJSONParse` tries native
  `JSON.parse` first and falls back to `eval`).
- `writePresetStore()` / `loadPresetStore()` (~6,340–6,400) persist to
  `Folder.userData/Emetric/presets.json`.
- `normalizePresetStore()` defensively rebuilds the in-memory store
  from whatever was read, dropping anything malformed rather than
  throwing.
- `applyPresetSettings()` (~6,850, exact line drifts) is the inverse of
  `capturePresetSettings()` — it pushes a saved settings object back
  into every UI field.
- `markDirty()` → `scheduleLastUsedPresetSave()` → (750 ms debounce) →
  `writePresetStore()` is the autosave path: almost any field edit
  eventually triggers a write of the "last used" state to disk. See
  `docs/maintenance-notes.md` for why this made a load failure
  dangerous, and how it was fixed.

## Navigating the file

Useful anchors to search for:

- `addSection(col1, "..."` / `addSection(col2, "..."` /
  `addSection(col3, "..."` — the panel headers in the main window,
  matching the section names visible in the UI (Page Size, Margins,
  Module Area, Type Area, Grid Modules, Vertical Grid, Horizontal
  Grid, Type Size, Type Leading, Colors, Document Options).
- `function calculate(` — the geometry engine.
- `function createDocument(` — the document builder.
- `presetStorageFile` / `loadPresetStore` / `writePresetStore` — the
  persistence layer.
- `w.show()` near the end of the file — confirms you've reached the
  bottom of the script.

## Known structural debt

A handful of variables and one whole hidden UI panel are tracked but
never actually consulted by any other code (confirmed by running the
file through ESLint's `no-unused-vars` after masking the `#target`
directives so a standard JS parser accepts it — see
`docs/maintenance-notes.md` for the full list, the evidence for each,
and why they were left in place rather than deleted outright). The
short version: they are safe to leave as-is, but any future change
that adds a new "why isn't this working" bug report should check that
list first, since dead state is exactly where wiring tends to go stale
silently.

If a future pass wants to physically split the source into multiple
files, the natural seams are the twelve numbered sections above; the
blocker is that any split still has to be concatenated back into one
file before InDesign can run it, and none of that can be regression
tested without an actual InDesign install, so it should be done
carefully, with the manual test checklist run in full before and
after.
