# Changelog

All notable changes to Emetric are recorded here.

The project uses semantic versioning with prerelease identifiers such as `alpha`, `beta` and `rc`.

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
