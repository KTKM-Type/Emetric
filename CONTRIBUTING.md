# Contributing to Emetric

Emetric is a proprietary public beta maintained by Kristian Möller / KTKM Design AB.

Bug reports, test notes and feature proposals are welcome. Code contributions are not accepted unless agreed in advance.

## Best ways to help during beta

- Test Emetric in different Adobe InDesign versions.
- Report bugs with screenshots and clear reproduction steps.
- Test different fonts, page sizes, Metric Sources and Custom Metric values.
- Suggest terminology, tooltip and documentation improvements.
- Share examples of layouts where Emetric is useful or confusing.

## Bug reports

Please include:

- Emetric version;
- Adobe InDesign version;
- operating system;
- Metric Source;
- selected font and style;
- page size and orientation;
- exact steps to reproduce;
- expected result;
- actual result;
- screenshots or screen recording if possible.

Use `tests/manual-test-checklist.md` as the baseline for wider beta testing.

## Code changes

Do not submit code changes unless they have been discussed first. If a code contribution is explicitly invited, the pull request should state:

- what changed;
- why it changed;
- how it was tested in InDesign;
- whether presets, generated documents or existing workflows are affected.

## Source rules

- Keep the active source filename as `src/indesign/Emetric.jsx`.
- Keep versioned release files under `dist/`.
- Preserve Adobe ExtendScript compatibility.
- Avoid modern JavaScript syntax unsupported by ExtendScript.
- Keep documentation and changelog updates close to code changes.
