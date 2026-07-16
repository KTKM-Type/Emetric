![Emetric][https://github.com/KTKM-Type/Emetric/blob/main/docs/img/emetric-full.png]

# Emetric

A typographic proportioning tool for creating type-based document grids, margins, and modular layouts in Adobe InDesign.

Emetric translates typographic proportions into document geometry. It can derive measurements from a selected font or from predefined and custom metric systems, then use those values to create an InDesign document with margins, modules, guides, grids, and optional reference pages.

> **Status:** Beta — current source version `0.42.0-beta.1`

## Main features

- Font-based measurements using **Selected Font**
- **Emetric Decimal**, **Emetric Dozenal**, and **Custom Metric** sources
- Typographic size, Type Leading, Vertical Grid, and Horizontal Grid calculations
- Direct modular Columns and Rows with calculated gutters and margins
- **Emetric Mode** section placed before Measurement and Sources, with **Type Defined Format** and **Custom Format**
- Emetric Mode uses tooltips rather than visible explanatory notes
- Separate Page Size, Margins, Module Area, Type Area, and Grid Modules sections; Page Size uses Width, Height, editable Page Ratio, and Lock Page Ratio
- Vertical and Horizontal Grid sections use Grid Interval, Steps, Alignment, Grid Module Height/Width, Grid Height/Width, and Offset terminology
- Optional **Lock Page Ratio** for custom page resizing
- Refined bottom control bar with separated copyright, Preview, and action controls
- In Custom Format, page dimensions and editable grid interval/module fields recalculate from the current page grid-step structure
- Preview uses the restored live update behavior from before alpha.16
- Tooltips are assigned throughout the UI from the latest tooltip inventory; unused tooltip slots display `[Empty]`
- Margin-derived grid-step changes are preserved when page width or height is edited
- InDesign Horizontal Gridline Division follows the Horizontal Grid value “Grid Interval” when custom page dimensions are active
- Millimeters, points, picas, ciceros, Didot points, Edo, and Edo points
- Optional facing pages, A-Parent, index page, and placeholder text under Document Options
- Color themes, presets, and diagnostic logging
- Colors panel labels use fixed-width right-aligned controls to withstand ScriptUI reflow when Metric Source changes
- **Custom Metric** uses the existing Type Size fields as manual, independent metric values
- When non-font metric sources are used, the selected font is scaled against the active Vertical Grid Alignment metric for Placeholder Text / [Basic Paragraph]
- Ascender alignment uses the visible lowercase ascender outline so grid alignment follows the actual upstroke top
- Creation of native InDesign guides, margins, columns, grids, and paragraph styles

## Repository structure

```text
Emetric/
├── .github/                 Issue and pull-request templates
├── assets/                  Images and other repository assets
├── dist/                    Packaged alpha, beta, and release files
├── docs/                    Project, calculation, and user documentation
├── src/indesign/Emetric.jsx Active source file
└── tests/                   Manual test documentation
```

The editable source is always:

```text
src/indesign/Emetric.jsx
```

The page-driven calculation relationships are documented in [`docs/anamorphic-format.md`](docs/anamorphic-format.md).

Do not add version numbers or beta labels to the source filename. Versioned files belong in GitHub Releases or, when needed, under `dist/`.

## Installation

See [`docs/installation.md`](docs/installation.md).

## Development

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/development.md`](docs/development.md).

## License

Emetric is proprietary software and is **not open source**. All rights are reserved by Kristian Möller / KTKM Design AB. See [`LICENSE`](LICENSE).

## Credits

Based on Kristian Möller's Konstfack Master Project, 2012–2014.

Copyright © 2012–2026 Kristian Möller, KTKM Design AB.

### 0.42.0-alpha.23 notes

This iteration keeps Placeholder Text on **[Basic Paragraph]**, sets its paragraph direction to **Left-to-Right**, sets **[Basic Paragraph]** to **Align Left**, and keeps its language aligned with the default InDesign language. The visible **Metrics & Leading Ratio** label is shortened to **M & L Ratio** while the full tooltip remains.


## 0.42.0-alpha.28

- **Vertical Grid → Alignment → Ascender** now explicitly uses the visible **Type Size → Ascender** value.
- The same Type Size alignment measure is used for the baseline grid, Placeholder Text first baseline, Emetric Data text frame, and basic text-frame default.
- Page Size Format keeps named standard choices such as A4 instead of reverting to InDesign’s generic **[Default]** preset when dimensions are identical.

## 0.42.0-beta.1

- First beta build prepared for wider testing.
- Based on the accepted `0.42.0-alpha.32` Custom Metric model.
- No new feature changes from alpha.32; this build promotes the current behavior for external testing.
- Release status is now shown as **BETA** in the script title.

## 0.42.0-alpha.32

- **Custom Metric** no longer expands a separate set of metric fields.
- Existing **Type Size** fields become the manual Custom Metric source.
- Type Size values are independent in Custom Metric. Editing Ascender, for example, does not change Metrics, Cap Height, x-Height, or Descender.
- Vertical Grid Alignment reads the corresponding Type Size value directly in Custom Metric. If Ascender is 2 mm and Alignment is Ascender, the first baseline is placed 2 mm from the top margin.
- Custom Format does not overwrite manual Type Size values while Custom Metric is active.

## 0.42.0-alpha.29

- Editable numeric UI fields now use a dedicated three-decimal formatter.
- A separate internal formatter is available for text values that need higher precision.
- Initial numeric field values are normalized through the same UI formatter for more consistent display.

