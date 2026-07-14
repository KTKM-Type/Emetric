# Emetric

A typographic proportioning tool for creating type-based document grids, margins, and modular layouts in Adobe InDesign.

Emetric translates typographic proportions into document geometry. It can derive measurements from a selected font or from predefined and custom metric systems, then use those values to create an InDesign document with margins, modules, guides, grids, and optional reference pages.

> **Status:** Alpha — current source version `0.42.0-alpha.4`

## Main features

- Font-based measurements using **Selected Font**
- **Emetric Decimal**, **Emetric Dozenal**, and **Custom Metric** sources
- Typographic size, leading, vertical grid, and horizontal grid calculations
- Modular columns and rows with proportional gutters and margins
- Optional **Anamorphic Format** mode for editable page width and height
- In Anamorphic Format, page dimensions recalculate line measures without changing Row or Column Grid Group
- InDesign Horizontal Gridline Division follows Column Leading when anamorphic dimensions are active
- Millimeters, points, picas, ciceros, Didot points, Edo, and Edo points
- Optional facing pages, A-Master, index page, and placeholder text
- Color themes, presets, and diagnostic logging
- Creation of native InDesign guides, margins, columns, grids, and paragraph styles

## Repository structure

```text
Emetric/
├── .github/                 Issue and pull-request templates
├── assets/                  Images and other repository assets
├── dist/                    Packaged beta and release files
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
