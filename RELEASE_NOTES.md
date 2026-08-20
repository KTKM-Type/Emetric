# Emetric 0.42.0-beta.2 — Release Notes

This is a stability-focused follow-up to the first public beta. It contains no new features — it fixes bugs found in beta.1 during ongoing testing.

Emetric is a typographic proportioning tool for Adobe InDesign. It creates document grids, margins, modules, type areas and optional reference pages from typographic measurements.

## Download

Use the versioned script file:

```text
dist/beta/Emetric-0.42.0-beta.2.jsx
```

For testers, the smaller release asset ZIP contains the same script plus installation notes and screenshots.

## Fixed since beta.1

- **Create Document** could feel slower or less smooth than Live Preview updates. It now disables screen redraw while building the final document, the same way the preview already does.
- The **Save Preset** and **Delete Preset** icons could become nearly invisible in their disabled state under the **Medium Dark** UI brightness setting. Medium Dark (and Medium Light) now use their own correctly measured tone instead of being lumped in with Dark/Light.
- **Vertical Grid → Grid Guides** now measures its starting position from the page's top edge, matching Horizontal Grid's Grid Guides, instead of drifting with the margin and Vertical Grid Alignment settings.
- A `presets.json` file that can't be read (locked by cloud sync, a permission hiccup, a prior crash) is no longer silently overwritten with an empty preset store. It's backed up as `presets-unreadable-<timestamp>.json` and reported through the diagnostic log and an alert.
- The **Emetric Data** page's "Ratios:" line now reflects the actual Type Size values used in Custom Metric, instead of stale legacy fields.
- The **Save Preset** and **Delete Preset** pictograms are now drawn from Adobe's actual icon geometry instead of an approximation built from plain rectangles — matching Adobe's rounded corners, cut-out tray notch and rib clearance.
- The **Default** preset (and any saved preset whose Metric Source is Selected Font with a font that isn't installed) no longer permanently shows as "— Modified" with no user edits. This took three related fixes: excluding the live, font-measurement-based Ascender/Cap Height/x-Height/Descender values from the dirty check for Selected Font presets; making **Reset** always re-select a font (from a priority list: Afacad, Afacad Pro, Afacad Flux, A Garamond, Minion, Minion Pro, Times, Times New, Comic Sans, falling back to the first installed font) instead of leaving whatever font was previously active selected; and matching those font names by "starts with" rather than exact match, so e.g. an installed "Times New Roman" or "Minion Pro" is still recognized.

## Highlights carried over from beta.1

- Selected Font, Emetric Decimal, Emetric Dozenal and Custom Metric sources.
- Custom Metric now uses Type Size fields directly as manual independent values.
- Page Size selector with A-series, B-series, Letter, Legal and other common formats.
- Custom Format supports editable page size and grid fields.
- Compact View for quick iteration.
- Optional Placeholder Text and Emetric Data page.
- Local preset storage.
- Manual beta test checklist.

## Known limitations

- This is beta software and should be tested on copies of real documents.
- Practical testing across different InDesign versions, operating systems and locales is still needed.
- Some grid/alignment behavior can depend on font metrics and InDesign’s text rendering.
- The license may change for future stable releases.

## License

This beta is distributed under the Emetric Beta License. It is free for evaluation and beta testing, but it is not open source. Future stable releases may require a paid commercial license.
