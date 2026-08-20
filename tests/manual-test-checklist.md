# Emetric 0.42.0-beta.2 — Manual Test Checklist

Use this checklist as the baseline for wider beta testing in Adobe InDesign.

## Test report metadata

| Field | Value |
|---|---|
| Tester |  |
| Date |  |
| Operating system |  |
| Adobe InDesign version |  |
| Emetric version | 0.42.0-beta.2 |
| Script file tested | `dist/beta/Emetric-0.42.0-beta.2.jsx` |
| Font used for main test |  |
| Notes / screenshots link |  |

## Result legend

Use the checkboxes directly or mark each item with `PASS`, `FAIL`, `N/A`, or `NEEDS REVIEW`.

---

## 1. Installation and launch

- [ ] Copy or run `Emetric-0.42.0-beta.2.jsx` in Adobe InDesign.
- [ ] The Emetric dialog opens without an ExtendScript error.
- [ ] The window title shows `Emetric 0.42.0-beta.2` and beta status.
- [ ] The UI appears in three main columns plus the bottom control bar.
- [ ] Closing and reopening the script works without restarting InDesign.
- [ ] No unexpected document is created before pressing **Create Document**.

### Notes

```text

```

---

## 2. UI labels, tooltips, and layout stability

- [ ] Hovering over visible controls shows a tooltip.
- [ ] No visible tooltip still says `[Empty]`.
- [ ] **M & L Ratio** is shown in the UI instead of the longer label.
- [ ] The tooltip for **M & L Ratio** still explains the full **Metrics & Leading Ratio** meaning.
- [ ] Changing **Metric Source** does not move or left-align labels under **Colors**.
- [ ] HEX fields under **Colors** remain visible after changing **Metric Source** several times.
- [ ] Color labels stay right-aligned for: Color Theme, Guides, Margins, Columns, Baseline Grid, Document Grid.
- [ ] Switching between compact/full view, if used, does not break the layout.

### Notes

```text

```

---

## 3. Metric Source behavior

### 3.1 Selected Font

- [ ] Select **Metric Source → Selected Font**.
- [ ] Select a known font family and style.
- [ ] **Type Size** values update from the selected font.
- [ ] Changing font family/style updates the metric values.
- [ ] **Placeholder Text** remains selectable.

### 3.2 Emetric Decimal

- [ ] Select **Metric Source → Emetric Decimal**.
- [ ] **Placeholder Text** remains selectable.
- [ ] The previously selected font is still used for generated placeholder text.
- [ ] **Type Size** values follow the Emetric Decimal metric model.

### 3.3 Emetric Dozenal

- [ ] Select **Metric Source → Emetric Dozenal**.
- [ ] **Placeholder Text** remains selectable.
- [ ] The previously selected font is still used for generated placeholder text.
- [ ] **Type Size** values follow the Emetric Dozenal metric model.

### 3.4 Custom Metric

- [ ] Select **Metric Source → Custom Metric**.
- [ ] No additional Custom Metric field group expands below Metric Source.
- [ ] Existing **Type Size** fields become editable.
- [ ] Editing **Metrics** does not change Ascender, Cap Height, x-Height, or Descender.
- [ ] Editing **Ascender** does not change Metrics, Cap Height, x-Height, or Descender.
- [ ] Editing **Cap Height** does not change Metrics, Ascender, x-Height, or Descender.
- [ ] Editing **x-Height** does not change Metrics, Ascender, Cap Height, or Descender.
- [ ] Editing **Descender** does not change Metrics, Ascender, Cap Height, or x-Height.
- [ ] Custom Metric values remain stable when switching between **Type Defined Format** and **Custom Format**.

### Notes

```text

```

---

## 4. Numeric formatting

- [ ] Visible editable numeric fields normalize to a maximum of 3 decimals.
- [ ] Decimal comma input is accepted where expected, for example `1,25`.
- [ ] Decimal point input is accepted where expected, for example `1.25`.
- [ ] Page Size Width and Height do not show excessive decimals.
- [ ] Grid Interval and Grid Module Height/Width do not show excessive decimals.
- [ ] Type Size fields do not show excessive decimals after edits or recalculation.
- [ ] Calculated read-only values remain legible and consistently rounded.

### Notes

```text

```

---

## 5. Emetric Mode

### 5.1 Type Defined Format

- [ ] Select **Emetric Mode → Type Defined Format**.
- [ ] Changing Type Size / Type Leading updates document geometry as expected.
- [ ] Page Size values follow the type-defined calculation model.
- [ ] Page Ratio updates after relevant changes.

### 5.2 Custom Format

- [ ] Select **Emetric Mode → Custom Format**.
- [ ] Page Size Width is editable.
- [ ] Page Size Height is editable.
- [ ] Page Ratio is editable when appropriate.
- [ ] **Vertical Grid → Grid Interval** is editable.
- [ ] **Vertical Grid → Grid Module Height** is editable.
- [ ] **Horizontal Grid → Grid Interval** is editable.
- [ ] **Horizontal Grid → Grid Module Width** is editable.
- [ ] Editing vertical grid values updates Page Height / vertical structure without unexpected resets.
- [ ] Editing horizontal grid values updates Page Width / horizontal structure without unexpected resets.
- [ ] Custom Format does not overwrite manual Type Size values while **Custom Metric** is selected.

### Notes

```text

```

---

## 6. Page Size format selector

- [ ] Open **Page Size → Format**.
- [ ] Standard formats are available, including A4, A3, Letter.
- [ ] Selecting **A4** writes correct A4 dimensions into Width and Height.
- [ ] After selecting A4, the selected format still displays **A4**, not `[Default]`.
- [ ] Selecting **A3** writes correct A3 dimensions into Width and Height.
- [ ] Selecting **Letter** writes correct Letter dimensions into Width and Height.
- [ ] Manually editing Width or Height switches the format display to a custom/manual state if applicable.
- [ ] Selecting a format switches to **Custom Format** if that is the current intended behavior.

### Notes

```text

```

---

## 7. Vertical Grid alignment

Test with visible placeholder text enabled and a font with clear lowercase ascenders, for example letters like `b`, `d`, `h`, `k`, `l`.

### 7.1 Metrics alignment

- [ ] Select **Vertical Grid → Alignment → Metrics**.
- [ ] The first baseline uses **Type Size → Metrics** as the offset from the top margin.
- [ ] Baseline Grid Start matches the expected Metrics offset.

### 7.2 Ascender alignment

- [ ] Select **Metric Source → Custom Metric**.
- [ ] Set **Type Size → Ascender** to `2 mm`.
- [ ] Select **Vertical Grid → Alignment → Ascender**.
- [ ] Create a document with Placeholder Text enabled.
- [ ] The first baseline is placed 2 mm below the top margin.
- [ ] The visible lowercase ascenders align with the intended grid position.
- [ ] Re-test with **Selected Font** and confirm ascender alignment follows the visible lowercase ascender outline as closely as possible.

### 7.3 Cap Height alignment

- [ ] Select **Vertical Grid → Alignment → Cap Height**.
- [ ] The first baseline uses **Type Size → Cap Height** as the offset from the top margin.
- [ ] Capital letters visually align with the intended grid position.

### 7.4 x-Height alignment

- [ ] Select **Vertical Grid → Alignment → x-Height**.
- [ ] The first baseline uses **Type Size → x-Height** as the offset from the top margin.
- [ ] Lowercase x-height visually aligns with the intended grid position.

### 7.5 Descender alignment

- [ ] Select **Vertical Grid → Alignment → Descender**.
- [ ] The resulting baseline behavior is predictable and documented in the test notes.
- [ ] No script error occurs.

### Notes

```text

```

---

## 8. Horizontal Grid, margins, and type area

- [ ] Create a document with equal left/right margins and Horizontal Grid Guides enabled.
- [ ] Horizontal Grid Guides center over the Type Area.
- [ ] Change to different left/right margins.
- [ ] Horizontal Grid Guides still center over the Type Area, not over the full page.
- [ ] Repeat with Facing Pages enabled and different inside/outside margins.
- [ ] Horizontal Grid Guides center correctly over each page's Type Area.
- [ ] Column Gutter Guides align with the calculated module area.
- [ ] **Use Column Gutter in InDesign** appears after **Column Gutter Guides**.

### Notes

```text

```

---

## 9. Document creation options

Create separate documents for these cases to verify conditional styles/layers.

### 9.1 Minimal document

- [ ] Disable Placeholder Text.
- [ ] Disable Emetric Index Page.
- [ ] Disable Grid Guides, Row Gutter Guides, and Column Gutter Guides.
- [ ] Create Document.
- [ ] No unnecessary **Emetric – Content** layer is created.
- [ ] No unnecessary **Emetric – Module Areas** layer is created.
- [ ] No unnecessary **Emetric – Grid Lines** layer is created.
- [ ] No **Emetric Data** paragraph style is created.

### 9.2 Placeholder Text only

- [ ] Enable Placeholder Text.
- [ ] Disable Emetric Index Page.
- [ ] Create Document.
- [ ] Placeholder Text is created.
- [ ] No Paragraph Style named **Placeholder Text** is created.
- [ ] Placeholder Text uses **[Basic Paragraph]**.
- [ ] **[Basic Paragraph]** is set to Left-to-Right.
- [ ] **[Basic Paragraph]** is set to Align Left.
- [ ] Language follows InDesign's default language.
- [ ] Placeholder Text appears below the top margin according to the active Vertical Grid Alignment.

### 9.3 Emetric Data only

- [ ] Enable Emetric Index Page.
- [ ] Disable Placeholder Text.
- [ ] Create Document.
- [ ] Paragraph Style **Emetric Data** is created.
- [ ] No Paragraph Style named **Emetric Information** is created.
- [ ] Emetric Data page/frame contains current document values.

### 9.4 Guides and layers

- [ ] Enable Grid Guides and create a document.
- [ ] **Emetric – Grid Lines** is created only when guide-related options require it.
- [ ] Enable module/gutter guide options and create a document.
- [ ] **Emetric – Module Areas** is created only when module-area/gutter options require it.
- [ ] Enable Placeholder Text and create a document.
- [ ] **Emetric – Content** is created only when content is generated.

### Notes

```text

```

---

## 10. InDesign document preferences

- [ ] Document page size matches the Emetric Width and Height values.
- [ ] Margins match the Emetric margin values.
- [ ] Facing Pages setting matches the selected option.
- [ ] A-Parent is used only when selected.
- [ ] Snap to Grid follows the selected option.
- [ ] Snap to Guides follows the selected option.
- [ ] Grids in Back follows the selected option.
- [ ] Baseline Grid settings match the Emetric Vertical Grid values.
- [ ] Document Grid settings match the Emetric Horizontal Grid values.
- [ ] Preview background uses the expected white/default behavior.

### Notes

```text

```

---

## 11. Color themes and custom colors

- [ ] Default color theme loads correctly.
- [ ] Changing Color Theme updates color swatches/HEX fields.
- [ ] Editing a HEX value updates the color preview.
- [ ] Invalid HEX values are handled without script errors.
- [ ] Manually edited colors show expected custom-state behavior.
- [ ] Generated guides use the selected colors.
- [ ] Baseline Grid and Document Grid HEX values remain visible after multiple Metric Source changes.

### Notes

```text

```

---

## 12. Presets and persistence

Preset storage is expected at:

```text
Folder.userData/Emetric/presets.json
```

On macOS this usually resolves to approximately:

```text
~/Library/Application Support/Emetric/presets.json
```

- [ ] Saving a preset creates or updates `presets.json`.
- [ ] Loading a saved preset restores expected UI values.
- [ ] `lastUsed` is restored when reopening the script.
- [ ] Window position / UI state persistence works if supported in the current build.
- [ ] Deleting or renaming `presets.json` does not prevent Emetric from launching.
- [ ] Malformed preset data is handled without data loss beyond the invalid preset state.

### Notes

```text

```

---

## 13. Error handling and diagnostics

- [ ] Invalid numeric input is handled without an ExtendScript crash.
- [ ] Empty required fields are handled predictably.
- [ ] Missing or unavailable fonts are handled predictably.
- [ ] Diagnostic/reporting copy includes the current Emetric version.
- [ ] If an error occurs, capture the exact steps, InDesign version, OS, and screenshot.

### Error report template

```text
Emetric version: 0.42.0-beta.2
InDesign version:
Operating system:
Font:
Metric Source:
Emetric Mode:
Steps to reproduce:
Expected result:
Actual result:
Screenshot/video:
Preset file attached: Yes/No
```

---

## 14. Known backlog / not required for beta.2 pass

These items are noted for a future version and should not fail beta.2 unless they break existing behavior.

- [ ] Additional units such as Japanese Q are not expected in beta.2.
- [ ] Portrait/Landscape orientation switching is not expected in beta.2.
- [ ] Wider localization or translated UI is not expected in beta.2.

---

## Final beta assessment

| Area | Pass / Fail / Notes |
|---|---|
| Launch and UI stability |  |
| Metric Source behavior |  |
| Custom Metric model |  |
| Page Size and presets |  |
| Grid and alignment |  |
| Document creation |  |
| Styles and layers |  |
| Colors |  |
| Presets |  |
| Overall beta readiness |  |

## Overall notes

```text

```
