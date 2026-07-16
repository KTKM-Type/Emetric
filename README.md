# Emetric

**Emetric** is a typographic proportioning tool for Adobe InDesign. It turns type metrics into document geometry: page size, margins, grids, modules, guides, baseline grid, and optional reference pages.

> Current version: **0.42.0-beta.1**  
> Status: **Public beta**  
> License: **Emetric Beta License** — source-available, not open source.

![Emetric compact view in InDesign](docs/img/emetric-compact-default.png)

## What Emetric does

Emetric helps designers build page systems from typographic relationships rather than from arbitrary measurements. It can use a selected font, built-in metric systems, or manual custom metrics to generate an InDesign document with a consistent modular structure.

Core uses:

- create type-defined document formats;
- test custom page sizes against typographic metrics;
- generate vertical and horizontal grids;
- calculate module areas, type areas, margins and gutters;
- create placeholder text and an optional Emetric Data page;
- use InDesign-native guides, layers, styles and grid preferences.

## Screenshots

### Compact View

![Emetric compact view](docs/img/emetric-compact.png)

### Full Settings

![Emetric full settings](docs/img/emetric-full.png)

### Compact View with generated document preview

![Emetric compact view with InDesign document preview](docs/img/emetric-compact-default.png)

## Main features in 0.42.0-beta.1

- **Metric Source**: Selected Font, Emetric Decimal, Emetric Dozenal, Custom Metric.
- **Custom Metric** uses the existing **Type Size** fields as manual, independent values.
- **Vertical Grid Alignment** reads the corresponding Type Size value directly in Custom Metric.
- **Custom Format** supports direct page size editing and editable grid interval/module fields.
- Page Size preset selector for common formats such as A4, A3, Letter, Legal and Tabloid.
- Separate sections for Page Size, Margins, Module Area, Type Area and Grid Modules.
- Optional Placeholder Text using InDesign’s **[Basic Paragraph]**.
- Optional **Emetric Data** page.
- Layers are only created when their corresponding features are selected.
- Presets are stored locally per user.
- Compact View for fast iteration.
- Public beta documentation and manual test checklist.

## Quick install

1. Download the latest release ZIP from GitHub Releases.
2. Unzip it.
3. Open Adobe InDesign.
4. Run:

```text
Emetric-0.42.0-beta.1.jsx
```

Recommended installation paths are documented in [`docs/installation.md`](docs/installation.md).

## Repository structure

```text
Emetric/
├── .github/                 Issue templates and GitHub metadata
├── dist/beta/               Versioned beta JSX file for distribution
├── docs/                    Installation, beta notes, roadmap and images
│   └── img/                 Screenshots used in README and docs
├── src/indesign/            Active source file
├── tests/                   Manual beta test checklist
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE.md               Emetric Beta License
├── README.md
└── RELEASE_NOTES.md
```

The active source file is:

```text
src/indesign/Emetric.jsx
```

The versioned file for this beta is:

```text
dist/beta/Emetric-0.42.0-beta.1.jsx
```

## Presets and local data

Emetric stores saved presets locally, outside the InDesign document, at:

```text
Folder.userData/Emetric/presets.json
```

On macOS this usually corresponds to:

```text
~/Library/Application Support/Emetric/presets.json
```

See [`docs/presets.md`](docs/presets.md).

## Beta testing

Use [`tests/manual-test-checklist.md`](tests/manual-test-checklist.md) when testing Emetric in InDesign.

Please include the following in bug reports:

- Emetric version;
- Adobe InDesign version;
- operating system;
- selected font and font style;
- Metric Source;
- page size and grid settings;
- screenshot or screen recording when possible.

## Roadmap

The next planned areas are documented in [`docs/roadmap.md`](docs/roadmap.md), including:

- Japanese **Q** unit support;
- portrait/landscape orientation switching;
- continued beta feedback and stability fixes.

## License

Emetric is distributed as a public beta under the **Emetric Beta License**. It is **not open source**. Redistribution, resale, sublicensing or repackaging is not permitted without written permission.

Future stable releases may require a paid commercial license.

See [`LICENSE.md`](LICENSE.md).

## Credits

Based on Kristian Möller’s Konstfack Master Project, 2012–2014.

Copyright © 2012–2026 Kristian Möller / KTKM Design AB. All rights reserved.
