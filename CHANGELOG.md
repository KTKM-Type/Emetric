# Changelog

All notable changes to Emetric are recorded here.

The project uses semantic versioning with prerelease identifiers such as `alpha`, `beta` and `rc`.

## Unreleased

## 0.42.0-beta.2 — Stability and preset fixes

### Fixed

- Clicking **Create Document** could feel noticeably slower or less consistent than the Live Preview updates leading up to it. `performPreviewUpdate()` already disables screen redraw (`app.scriptPreferences.enableRedraw`) while it builds the preview document, but `createButton.onClick()` built the final document — the same layers/guides/styles/text-frame work — without that toggle, repainting the screen on every step. It now disables redraw for the same span and restores it afterward, matching the preview path.
- The **Save Preset** icon (and Delete Preset) could become nearly invisible in its disabled state under the **Medium Dark** UI brightness setting. The icon control has no fill of its own to sample a real background from, so its disabled-state color blend fell back to a hardcoded guess that only distinguished two tones (dark-family / light-family) instead of Adobe's four UI brightness levels; Medium Dark's real panel tone is lighter than Dark's, so the guess undershot it. The fallback now reuses the same per-theme measured tones already used for the icon's hover highlight, giving Medium Dark (and Medium Light) their own distinct value instead of being lumped in with Dark/Light.
- **Vertical Grid → Grid Guides** (the major grid-row guides drawn by `addBoundaryGuides()`) measured their starting position from the margin instead of from the page's top edge. This page-anchored reference grid is meant to combine with **Horizontal Grid**'s equivalent Grid Guides into a plain rectangular grid across the whole page format; it now starts one Grid Module Height (Steps × Grid Interval) down from the page edge, plus the Offset needed to compensate for the vertical ruler-zero shift `setupDocumentAndBaselineGrids()` applies for the document grid, instead of drifting with the margin and Vertical Grid Alignment settings.
- A `presets.json` file that could not be read (locked by cloud sync, a permission hiccup, or truncated by a prior crash) no longer causes Emetric to silently overwrite it with an empty preset store on the next autosave. The unreadable file is now backed up next to itself as `presets-unreadable-<timestamp>.json` and the failure is reported through the diagnostic log and an alert instead of failing silently.
- The **Emetric Data** page's "Ratios:" line now reflects the actual Type Size values used when Metric Source is Custom Metric, instead of a disconnected, hidden set of legacy fields that no longer tracked user edits after the `0.42.0-alpha.32` Custom Metric redesign.
- The **Save Preset** and **Delete Preset** pictograms are now drawn from Adobe's actual icon geometry, traced from a Figma export of Adobe's own pictograms, instead of an approximation built out of plain rectangles. Confirmed against InDesign: Save's tray notch renders as a real cut-out; Delete's handle and bin body are each one rounded, open outline (no enclosed hole cut, so nothing relies on a fill winding rule) with the ribs and lid as plain filled rectangles, matching Adobe's rounded corners and rib clearance instead of reading as blocky.
- The **Default** preset (and any saved preset whose Metric Source is Selected Font with a font that isn't installed) no longer permanently shows as "— Modified" with no user edits. Ascender/Cap Height/x-Height/Descender are live, font-measurement-based display values in that mode, not saved numbers, so a silently substituted fallback font naturally measured differently from the preset's original font and tripped the dirty check; those four values are now excluded from it for Selected Font presets, while Font Family/Font Style still compare normally.
- **Reset** now always re-selects a font instead of silently leaving whatever font was previously chosen selected. Previously, picking a different font and then pressing Reset kept that font active rather than returning to Default's own font, which is what made the fix above look incomplete — Font Family is genuinely compared, so a leftover font correctly kept showing "Modified". The preferred-font list Reset picks from is now `Afacad`, `Afacad Pro`, `Afacad Flux`, `A Garamond`, `Minion`, `Minion Pro`, `Times`, `Times New`, `Comic Sans`, in that order, matched by "starts with" (so "Times New" also matches an installed "Times New Roman", "Minion" also matches "Minion Pro", etc.), falling back to the first installed font alphabetically if none of those are present.

### Changed

- Removed seven internal helper functions with zero remaining call sites (`currentUnitSuffix`, `formatInternalInputNumber`, `toPoints`, `styleFieldLabel`, `addSubheading`, `addNote`, `presetBackgroundLuminance`); no behavior change.
- Added `docs/architecture.md` (a map of the source file's structure and data flow) and `docs/maintenance-notes.md` (the fixes above, plus dead-state variables that were found but intentionally left in place pending an InDesign-tested follow-up or a maintainer decision).

## 0.42.0-beta.1 — Public beta

### Added

- First public beta package for wider testing.
- GitHub-ready documentation, issue templates, beta license and release notes.
- Manual beta test checklist.
- Screenshots under `docs/img/`.
- Page Size format selector with standard sizes such as A4, A3, Letter, Legal and Tabloid.

### Changed

- Promoted the accepted `0.42.0-alpha.32` behavior to beta without adding new product functionality.
- Release metadata now reports **BETA** and version `0.42.0-beta.1`.
- Distribution file is available at `dist/beta/Emetric-0.42.0-beta.1.jsx`.
- Custom Metric now uses the existing Type Size fields as manual metric values instead of expanding a separate Custom Metric field group.
- Type Size values are independent in Custom Metric.
- Vertical Grid Alignment reads the corresponding Type Size value directly when Custom Metric is selected.
- Placeholder Text uses InDesign’s **[Basic Paragraph]** rather than a separate Placeholder Text paragraph style.
- Emetric Information was renamed to **Emetric Data**.
- Layers are created only when their corresponding output choices are enabled.

### Fixed

- A4 and other standard page-size names are retained instead of reverting to `[Default]` when dimensions match imported InDesign presets.
- Horizontal Grid Guides are centered over Type Area when left and right margins differ.
- Several ScriptUI layout issues around Colors and Metric Source changes were reduced by removing Custom Metric expand/collapse behavior.
- Numeric UI fields display values consistently with three decimal precision.

## 0.42.0-alpha.32

- Changed **Custom Metric** to use the existing **Type Size** fields as manual metric values.
- Type Size values are independent in Custom Metric: editing Metrics, Ascender, Cap Height, x-Height or Descender no longer recalculates the other Type Size fields.
- **Vertical Grid → Alignment** reads the corresponding Type Size value directly in Custom Metric. For example, if Ascender is 2 mm and Alignment is Ascender, the first baseline is placed 2 mm from the top margin.
- Custom Format no longer overwrites manual Type Size values while Custom Metric is selected.

## 0.42.0-alpha.29

- Split numeric field formatting into separate UI and internal precision helpers.
- Visible editable UI values normalize to three decimals.
- Added an internal high-precision formatter for text values that need to preserve up to eight decimals.

## 0.42.0-alpha.28

- Changed Ascender alignment to measure visible lowercase ascender stems from temporary outlines.
- Kept Type Size → Ascender as the displayed alignment value while making the measured ascender reflect the actual upstroke top.
- Falls back to InDesign’s ascent metric if outline measurement is unavailable for a specific font.

## 0.42.0-alpha.25

- Added Page Size format selector.
- Added common page sizes including A-series, B-series, Letter, Legal, Tabloid, Ledger, Executive, Half Letter and selected envelopes.

## 0.42.0-alpha.23

- Set **[Basic Paragraph]** to Align Left for Placeholder Text output.
- Shortened the visible **Metrics & Leading Ratio** label to **M & L Ratio** while keeping the full tooltip text.

## 0.42.0-alpha.21

- Removed the separate Paragraph Style **Placeholder Text**.
- Placeholder Text now uses **[Basic Paragraph]**.
- Renamed **Emetric Information** to **Emetric Data**.
- Emetric Data is only created when **Emetric Index Page** is selected.
- Emetric layers are created only when corresponding options are enabled.

## 0.42.0-alpha.18

- Centered **Horizontal Grid Guides** over the **Type Area** instead of the full page.
- Updated tooltip inventory by applying suggested texts to the main tooltip column.

## 0.42.0-alpha.14

- Renamed **Gridline Every** to **Grid Interval**.
- Restored the preview pasteboard/background behavior to the earlier white/default setting.
- Fixed a ScriptUI repaint issue where lower Colors HEX fields could disappear after choosing Custom Metric.
