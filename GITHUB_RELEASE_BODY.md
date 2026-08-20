# Emetric 0.42.0-beta.2 — Stability and Preset Fixes

A follow-up to the first public beta of **Emetric**, a typographic proportioning tool for Adobe InDesign. No new features — this release fixes bugs reported during beta.1 testing.

## Download

Download the release asset ZIP, unzip it and run:

```text
Emetric-0.42.0-beta.2.jsx
```

## Screenshots

![Compact View](docs/img/emetric-compact.png)

![Full Settings](docs/img/emetric-full.png)

![Compact View in InDesign](docs/img/emetric-compact-default.png)

## Fixed since beta.1

- **Create Document** now disables screen redraw the same way Live Preview already does, so it no longer feels slower or less consistent.
- The **Save Preset** / **Delete Preset** icons no longer become nearly invisible when disabled under the **Medium Dark** UI brightness setting.
- **Vertical Grid → Grid Guides** now measures from the page's top edge instead of drifting with margin/alignment settings.
- An unreadable `presets.json` is now backed up and reported instead of being silently overwritten.
- The **Emetric Data** page's "Ratios:" line reflects the actual Custom Metric Type Size values.
- The **Save Preset** and **Delete Preset** pictograms now match Adobe's real icon geometry (rounded corners, tray notch, rib clearance).
- The **Default** preset no longer permanently shows "— Modified" when its font isn't installed; **Reset** now reliably re-selects a sensible font (Afacad, Afacad Pro, Afacad Flux, A Garamond, Minion, Minion Pro, Times, Times New, Comic Sans, matched by "starts with", falling back to the first installed font).

See [`CHANGELOG.md`](CHANGELOG.md) and [`RELEASE_NOTES.md`](RELEASE_NOTES.md) for full details.

## Beta feedback wanted

Please report bugs with:

- Emetric version;
- Adobe InDesign version;
- operating system;
- selected font and style;
- Metric Source and page settings;
- screenshots or screen recordings if possible.

## License

Emetric is distributed under the **Emetric Beta License**. It is free for evaluation and beta testing, but it is not open source. Redistribution, resale and repackaging are not permitted without written permission. Future stable releases may require a paid commercial license.
