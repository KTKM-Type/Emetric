# Changelog

## 0.42.0-alpha.32

- Changed **Custom Metric** to use the existing **Type Size** fields as manual metric values instead of expanding a separate Custom Metric field group.
- Type Size values are independent in Custom Metric: editing Metrics, Ascender, Cap Height, x-Height, or Descender no longer recalculates the other Type Size fields.
- **Vertical Grid → Alignment** now reads the corresponding Type Size value directly when Custom Metric is selected; for example, Ascender alignment uses **Type Size → Ascender** as the first-baseline offset from the top margin.
- Custom Format no longer overwrites manual Type Size values when Custom Metric is selected.
- Removing the Custom Metric expand/collapse flow should reduce ScriptUI reflow issues in the Colors panel.

## 0.42.0-alpha.29

- Split numeric field formatting into separate UI and internal precision helpers.
- Visible editable UI values now normalize to three decimals.
- Added an internal high-precision formatter for cases where text output needs to preserve up to eight decimals.
- Initial numeric field values now pass through the UI formatter for consistent comma decimals and three-decimal display.

## 0.42.0-alpha.28

- Changed Ascender alignment to measure the visible lowercase ascender stems from temporary outlines.
- Kept Type Size → Ascender as the displayed alignment value, but made the measured ascender reflect the actual upstroke top.
- Falls back to InDesign’s ascent metric if outline measurement is unavailable for a specific font.

## 0.42.0-alpha.27

- Bound **Vertical Grid → Alignment → Ascender** explicitly to the visible **Type Size → Ascender** value.
- Reused that same Type Size alignment measure for baseline grid start, Placeholder Text first baseline, Emetric Data text frame baseline, and the basic text-frame default.
- Kept horizontal guide alignment and Page Size preset behavior from alpha.26.

## 0.42.0-alpha.26

- Fixed Ascender alignment for horizontal grid-row guides so the guide structure aligns with the document grid/glyph-top origin.
- Prevented the Page Size Format dropdown from reverting A4 to InDesign’s generic **[Default]** preset when dimensions match.
- Standard named page sizes are now prioritized before imported InDesign document presets with identical dimensions.

## 0.42.0-alpha.24

- Scaled the selected font for Placeholder Text / [Basic Paragraph] when Metric Source is **Emetric Decimal**, **Emetric Dozenal**, or **Custom Metric**.
- The selected font now follows the active **Vertical Grid → Alignment** metric: Metrics, Ascender, Cap Height, or x-Height.
- Kept the selected font as the output font even when the metric source is not **Selected Font**.

## 0.42.0-alpha.23

- Set [Basic Paragraph] to Align Left for Placeholder Text output.
- Shortened the visible Metrics & Leading Ratio label to M & L Ratio while keeping the full tooltip text.

## 0.42.0-alpha.22

- Set Placeholder Text paragraph direction explicitly to **Left-to-Right** through **[Basic Paragraph]**.
- Keep Placeholder Text language aligned with the user’s default InDesign language instead of hard-coding a language.
- Preserve the alpha.21 behavior where Placeholder Text uses **[Basic Paragraph]** rather than a separate paragraph style.

## 0.42.0-alpha.18

- Centered **Horizontal Grid Guides** over the **Type Area** instead of the full page, fixing guide placement when left and right margins differ.
- Updated the tooltip inventory by applying the latest suggested texts to the main tooltip column.
- Kept the restored live Preview behavior from alpha.17.

## 0.42.0-alpha.17

- Restored Preview update behavior to the pre-alpha.16 live model after field edits proved unstable in InDesign.
- Kept tooltip coverage fallback so controls without specific copy are marked as `[Empty]`.
- Updated tooltip inventory workflow with proposed replacements for `[Empty]` placeholders.



## 0.42.0-alpha.17

- Made **Grid Interval** and **Grid Module Height/Width** editable in **Custom Format**.
- Editing **Vertical Grid Interval** or **Grid Module Height** now derives page height and type size while preserving Vertical Steps.
- Editing **Horizontal Grid Interval** or **Grid Module Width** now derives page width while preserving Horizontal Steps.
- Strengthened the ScriptUI repaint fix for **Baseline Grid** and **Document Grid** HEX fields when **Custom Metric** expands or collapses.

## 0.42.0-alpha.14

- Renamed **Gridline Every** to **Grid Interval** across the interface, tooltips and index output.
- Restored the preview pasteboard/background behavior to the earlier white/default setting.
- Fixed a ScriptUI repaint issue where the **Baseline Grid** and **Document Grid** HEX fields could disappear after choosing **Custom Metric**.


All notable changes to Emetric should be recorded in this file.

The project uses [Semantic Versioning](https://semver.org/) with prerelease identifiers such as `alpha.1`, `beta.1` and `rc.1`.

## [Unreleased]

## [0.42.0-alpha.16] — 2026-07-15

### Changed

- Made **Grid Interval** and **Grid Module Height/Width** editable in **Custom Format**.
- Editing vertical grid fields derives page height and type size from the existing vertical page-step structure.
- Editing horizontal grid fields derives page width from the existing horizontal page-step structure.
- Reinforced repaint handling for the lower color HEX fields after selecting **Custom Metric**.

## [0.42.0-alpha.14] — 2026-07-15

### Changed

- Moved **Grid Width** to **Horizontal Grid** under **Grid Module Width**.
- Moved **Grid Height** to **Vertical Grid** under **Grid Module Height**.
- Moved **Facing Pages** back to **Document Options**.
- Made **Page Ratio** editable in **Custom Format**; editing the ratio keeps Width as the anchor and derives Height.
- Simplified margin labels to **Top**, **Bottom**, **Left**, **Right**, **Inside**, and **Outside**.
- Moved **Module Area** before **Type Area**.

## [0.42.0-alpha.12] — 2026-07-15

### Changed

- Moved **Emetric Mode** before **Measurement and Sources**.
- Renamed grid controls to **Alignment** and **Steps** in Vertical and Horizontal Grid.
- Reordered Vertical and Horizontal Grid controls as Grid Interval, Steps, Alignment, Grid Module Height/Width, Offset, and Grid Guides.
- Removed **Module Ratio** from Grid Modules; Rows is now a direct editable module value.
- Moved **Grid Width** into Vertical Grid under Grid Module Height.
- Moved Grid Modules checkboxes to the end of the section.
- Removed **Spread** from Page Size.
- Renamed **Format Ratio** to **Page Ratio** and placed **Facing Pages** before Page Ratio.

## [0.42.0-alpha.11] — 2026-07-15

### Changed

- Renamed **Row Grid** to **Vertical Grid** and **Column Grid** to **Horizontal Grid**.
- Renamed grid controls: **Group** to **Grid Steps**, **Offset Source** to **Grid Align**, and **Row/Column Grid Lines** to **Grid Guides**.
- Renamed **Row Leading** and **Column Leading** to **Grid Interval** in the Vertical and Horizontal Grid sections.
- Renamed **Module Size** to **Grid Module Height** in Vertical Grid and **Grid Module Width** in Horizontal Grid.
- Reordered Vertical and Horizontal Grid controls as Grid Align, Grid Steps, Grid Module Height/Width, and Grid Interval.
- Moved Row Margin, Row Gutter, Row Gutter Guides, Column Margin, Column Gutter, and Column Gutter Guides to **Grid Modules**.

## [0.42.0-alpha.10] — 2026-07-15

### Changed

- Renamed **Format Mode** to **Emetric Mode**.
- Renamed **Type-led Format** to **Type Defined Format** and **Custom Page Size** to **Custom Format**.
- Made **Page Size**, **Margins**, **Type Area**, and **Module Area** separate sections.
- Reordered Page Size controls as Width, Height, Spread, Format Ratio, Facing Pages, and Lock Page Ratio.
- Renamed the **Leading** section to **Type Leading**.
- Kept **Row Leading** and **Column Leading** labels visible in both Emetric modes.
- Renamed **Live Preview** back to **Preview**.

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
