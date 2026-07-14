# Changelog

All notable changes to Emetric should be recorded in this file.

The project uses [Semantic Versioning](https://semver.org/) with prerelease identifiers such as `alpha.1`, `beta.1` and `rc.1`.

## [Unreleased]

## [0.42.0-alpha.9] — 2026-07-14

### Changed

- Moved **Format Mode** into its own section before **Page**.
- Replaced visible mode/status explanation text with tooltips.
- Renamed the former **Anamorphic Format** UI to **Custom Page Size**.
- Kept **Type-led Format** as the default mode and **Custom Page Size** as the editable page-size mode.
- Updated Emetric Index output to show **Format Mode**.

## [0.42.0-alpha.8] — 2026-07-14

### Added

- Added Page subheadings for **Format Mode**, **Page Size**, **Margins**, **Calculated**, and **Page Setup**.
- Added explanatory Page status text for the active calculation mode and current driver.
- Added dynamic **Row Leading** and **Column Leading** labels when Anamorphic Format is active.

### Changed

- Moved **Anamorphic Format** to the top of Page as the primary format-mode choice.
- Renamed **Lock Format Ratio** to **Lock Page Ratio** and placed it directly with Width and Height.
- Moved Spread, Format Ratio, and Type Area values into a calculated-result area.
- Renamed **Preview** to **Live Preview** in Full Settings and Compact View.
- Renamed **Apply Column Gutters** to **Use Column Gutters in InDesign**.

## [0.42.0-alpha.7] — 2026-07-14

### Changed

- Moved **Apply Column Gutters** from Column Grid to Grid Modules.
- Moved the main-window **Preview** checkbox 5 px downward for better optical alignment.
- Added bottom-bar dividers between copyright/version information, Preview, and action buttons, matching Compact View.

## [0.42.0-alpha.6] — 2026-07-14

### Added

- Added **Lock Format Ratio** in the Page section.
- When **Anamorphic Format** and **Lock Format Ratio** are active, editing Width derives Height from the current format ratio, and editing Height derives Width from the current format ratio.
- Preview is now enabled by default when the main window opens.

### Changed

- Moved **Anamorphic Format** to the end of the Page section.
- Moved **Facing Pages** from Document Options to Page, directly before Anamorphic Format.
- Renamed **Use A-Master** to **Use A-Parent**.
- Moved **Apply Column Gutters** from Document Options to the Column Grid section.
- Moved **Emetric Index Page** and **Placeholder Text** to the bottom of Document Options.
- Moved **Preview** next to **Compact View** in the bottom control bar.
- Moved the copyright/version text to the left side of the bottom bar.
- New documents now set InDesign’s Preview Background preference to **Match to Theme Color**.

## [0.42.0-alpha.5] — 2026-07-14

### Changed

- Moved **Anamorphic Format** from Document Options to the Page section.
- Page Width and Page Height now solve back through the same page expansion structure as normal mode.
- Editing page dimensions preserves margin-derived page grid steps instead of snapping back to the bare module grid.
- Horizontal values follow Column Leading and vertical values follow Row Leading in Anamorphic Format.

## [0.42.0-alpha.4] — 2026-07-14

### Added

- Added an **Anamorphic Format** checkbox under Document Options.
- Page Width and Page Height are editable only when Anamorphic Format is enabled.
- Presets now store the Anamorphic Format option.
- Emetric Index reports whether Anamorphic Format is on or off.

### Changed

- Normal mode returns to the original type-led format calculation.
- Anamorphic width and height overrides are ignored when Anamorphic Format is disabled.

## [0.42.0-alpha.3] — 2026-07-03

### Changed

- InDesign Horizontal Gridline Division now uses Column Leading (`horizontalLine`).
- The perpendicular document-grid division continues to use Row Leading (`lineSpace`).
- Emetric Index now reports the two document-grid intervals separately.

## [0.42.0-alpha.2] — 2026-07-03

### Changed

- Page Width and Page Height edits now explicitly preserve Row Grid Group and Column Grid Group.
- Editing Page Height changes Leading through the unchanged Row Grid Group instead of modifying the grid structure.
- Editing Page Width changes the horizontal line measure through the unchanged Column Grid Group.
- Clarified the Anamorphic Format driver and precedence documentation.

## [0.42.0-alpha.1] — 2026-07-03

### Added

- Editable Page Width and Page Height fields.
- Anamorphic page-dimension calculations based on the `Anamorphic_Format` workbook.
- Alpha distribution copy under `dist/alpha/`.

### Changed

- Editing Page Width now derives the horizontal grid line from the fixed format width, column count, and Column Grid Group.
- Editing Page Height now derives the vertical grid line and type size from the fixed format height, row count, and Row Grid Group.
- Horizontal grid spacing can differ from vertical leading while margins and gutters retain their vertical typographic measure.
- Fixed page dimensions are stored in presets.
- Editing Metrics or Leading releases a fixed Page Height so the type-led model becomes the vertical driver again.
- Updated application metadata from beta to alpha.

## [0.41.0-beta.2] — 2026-07-02

### Added

- Selected Font, Emetric Decimal, Emetric Dozenal, and Custom Metric sources.
- Separate Placeholder Text and Emetric Index pages.
- Editable grid rows and custom metric ratios.
- Preset handling, color themes, and diagnostic logging.

### Changed

- Prepared `Emetric.jsx` as the canonical source file under `src/indesign/`.
- Centralized application name, version, and release-status metadata.
- Generalized diagnostic identifiers so they can remain in future releases.
