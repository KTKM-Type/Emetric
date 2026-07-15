# Emetric

A typographic proportioning tool for creating type-based document grids, margins, and modular layouts in Adobe InDesign.

Emetric translates typographic proportions into document geometry. It can derive measurements from a selected font or from predefined and custom metric systems, then use those values to create an InDesign document with margins, modules, guides, grids, and optional reference pages.

> **Status:** Alpha — current source version `0.42.0-alpha.20`

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

### 0.42.0-alpha.20 notes

This iteration places **Use Column Gutter in InDesign** after **Column Gutter Guides** and applies the latest tooltip copy directly in the Emetric UI.
