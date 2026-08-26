# Emetric 0.42.0-beta.3 — Release Notes

This is a stability-focused follow-up to beta.2. It contains no new features — it fixes bugs found during ongoing testing, most notably a set of related rounding and font-measurement issues that could make the same typed values produce different results depending on Metric Source or InDesign version.

Emetric is a typographic proportioning tool for Adobe InDesign. It creates document grids, margins, modules, type areas and optional reference pages from typographic measurements.

## Download

Use the versioned script file:

```text
dist/beta/Emetric-0.42.0-beta.3.jsx
```

For testers, the smaller release asset ZIP contains the same script plus installation notes and screenshots.

## Fixed since beta.2

- Typing "1" into **Metrics** while **Picas** (or Cicero/Didot Point) was active could display "4p0" instead of "1p0", with margins, grid and page size all reflecting the wrong number even where Metrics itself looked correct. `parseMeasureInput()`'s compound-unit parsing has been rewritten as explicit `if`/`else` with `indexOf`/`substring`, the same fix shape already used for the Picas letter bug below.
- Choosing **Custom Metric** versus **Selected Font** with the identical typed x-Height and Leading could give different Margin, Row Margin and Row Gutter values even though Offset matched. A new full-precision `exactMetricsMM` cache means both metric sources now calculate from the same precision instead of one of them losing precision through a rounded display field.
- Offset could round a value like 0,834 mm where the project's rule (round exact halfway points toward zero) called for 0,833 mm — caused by `round()`'s own multiplication manufacturing an exact tie out of a value that was never really one. Offset now uses its own narrowly-scoped rounding rule; Margin, Row Margin and Row Gutter are unaffected.
- The same font and Metrics value could measure a different x-Height/Cap Height on InDesign 2026 than on InDesign 2025 (for example Afacad Pro giving 1,997 mm instead of 2,000 mm), so a grid built on one InDesign version didn't reproduce on the other. x-Height and Cap Height are now read directly from the font file's own OS/2 table instead of through InDesign's live composition measurement, confirmed by testing to give identical results on both InDesign 2025 and 2026.
- The **Save Preset** and **Delete Preset** icons could become nearly invisible under the **Medium Dark** UI Brightness setting. Medium Dark (and Medium Light) now use their own correctly measured tone.
- Selecting **Picas** as the measurement unit labelled correctly computed values with a "c" (Cicero) instead of "p" — the number was always right, only the letter was wrong.

See [`CHANGELOG.md`](CHANGELOG.md) for full technical detail on each fix.

## Highlights carried over from earlier betas

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
- Some grid/alignment behavior can depend on font metrics and InDesign's text rendering.
- The license may change for future stable releases.

## License

This beta is distributed under the Emetric Beta License. It is free for evaluation and beta testing, but it is not open source. Future stable releases may require a paid commercial license.
