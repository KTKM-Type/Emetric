# Changelog

All notable changes to Emetric should be recorded in this file.

The project uses [Semantic Versioning](https://semver.org/) with prerelease identifiers such as `beta.1` and `rc.1`.

## [Unreleased]

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
