# Changelog

All notable changes to Emetric are recorded here.

The project uses semantic versioning with prerelease identifiers such as `alpha`, `beta` and `rc`.

## Unreleased

## 0.42.0-beta.3 — Cross-version consistency and rounding fixes

This build starts over from the `0.42.0-beta.2` release exactly as published.
A same-day series of further fix attempts from that line (a page-size-limit
guard, a locked-field contrast fix) has been set aside rather than carried
forward and is tracked again under Known issue below.

### Fixed

- The **Save Preset** and **Delete Preset** icons could become nearly invisible under the **Medium Dark** UI Brightness setting. `app.generalPreferences.uiBrightnessPreference` is a plain 0.0–1.0 float, not an enum, and Adobe's four presets are not evenly spaced quarters of that range (Dark = 0.0, Medium Dark = 0.50, Medium Bright = 0.51, Bright = 1.0). Emetric's theme detection tested `< 0.5` for Medium Dark, which excludes Medium Dark's own value of exactly 0.50, so real Medium Dark was silently misclassified as Medium Light — giving the icon the Medium Light color (a dark gray) to draw on Medium Dark's actual dark panel. The boundaries now sit at the midpoints between Adobe's real preset values instead of at reused quarter marks.
- Selecting **Picas** as the measurement unit displayed correctly computed Pica values everywhere, but labelled them with a "c" (Cicero) instead of "p" — the number was always right, only the letter was wrong. The nested ternary in `formatInDesignCompoundUnit()` that picks between "p"/"c"/"e" was rewritten as explicit `if`/`else` statements; testing confirmed this resolves the letter specifically.
- Typing "1" into **Metrics** while **Picas** (or Cicero/Didot Point) was active could display "4p0" instead of "1p0", with every value derived from Metrics — margins, grid, page size — reflecting the wrong number even where the Metrics field itself looked correct. `parseMeasureInput()` matched the compound-unit marker (`p`/`c`/`e`) with the same nested-ternary/`split()` pattern already fixed once for the Picas letter bug above, and could return the fallback value instead of the parsed one for plain compound input. Rewritten as explicit `if`/`else` with `indexOf`/`substring`, the same shape as that earlier fix.
- Choosing **Custom Metric** versus **Selected Font** with the identical typed x-Height and Leading could give different Margin, Row Margin and Row Gutter values (for example 4,166 mm versus 4,167 mm) even though both showed the same Offset. `updateLinkedTypeSizeFromField()` back-solved Metrics from a typed Type Size field and wrote the rounded, three-decimal result into the Metrics display field — the only place `readValues()` had left to read Metrics back from, a second rounding step Custom Metric's own direct value never went through. A new `exactMetricsMM` cache now holds the full-precision value alongside the display text, the same pattern already used for Line Space, Page Width and Page Height, so both metric sources calculate from the same precision.
- Offset could display a value like 0,834 mm where the project's rounding rule (round exact halfway points toward zero) called for 0,833 mm. `value * 1000` inside `round()` can itself manufacture an exact `.5` fraction out of a floating-point value that was never truly a tie — a multiplication artifact, confirmed against real values logged from InDesign. Offset now rounds through a new, narrowly-scoped `roundOffsetTiesTowardZero()`, used only for Offset's own display and guide placement; Margin, Row Margin and Row Gutter are unaffected and still round from the same raw, non-tie-broken measure they always have, so a doubled value like Row Gutter is never pulled off its own correct result by a tie-break meant for a different field.
- The same font and Metrics value could measure a different x-Height/Cap Height on InDesign 2026 than on InDesign 2025 (for example Afacad Pro measuring 1,997 mm instead of 2,000 mm), so a grid built on one InDesign version's numbers didn't reproduce on the other. x-Height and Cap Height are now read directly from the font file's own OS/2 table (`sxHeight`/`sCapHeight`) instead of through InDesign's live composition measurement — the font's own declared number is fixed no matter which InDesign version reads it. Ascender and Descender are intentionally left as they were, measured from the font's visible outline/ink extent, which has no equivalent single-table number. Confirmed by testing on both InDesign 2025 and InDesign 2026 to now produce identical results for the same font and settings.

### Known issue

- Locked (calculated, read-only) numeric fields are hard to read under the **Dark** UI Brightness setting (about 1.2:1 text/background contrast versus roughly 2:1 for InDesign's own dropdowns). Not addressed in this build; see git history for a fix attempt that didn't hold up under testing (`ScriptUIGraphics.foregroundColor` is a known-broken InDesign/ScriptUI API on InDesign 19+).
- Typing a large value into **Metrics** while a unit that is physically "large" (Picas especially) is active can throw a raw InDesign error ("Otillåtet värde", error 30481) instead of a friendly message, because the resulting page size exceeds InDesign's own 216 in (5486.4 mm) hard limit. Not addressed in this build.

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
