# Contributing to Emetric

Emetric is a proprietary project maintained by Kristian Möller / KTKM Design AB. External code contributions should only be submitted by prior agreement. Bug reports and feature proposals are welcome through GitHub Issues.

## Workflow

1. Create or select an issue describing one focused change.
2. Create a branch from `main`.
3. Edit `src/indesign/Emetric.jsx`.
4. Test the change in Adobe InDesign.
5. Update documentation and `CHANGELOG.md` when relevant.
6. Open a pull request against `main`.

## Branch names

```text
feature/custom-ratios
fix/placeholder-position
refactor/metric-source-logic
docs/update-readme
release/0.42.0-beta.1
```

## Commit messages

Use short imperative messages:

```text
Add custom metric controls
Fix placeholder text position
Update beta test checklist
Refactor diagnostic logging
```

## Source rules

- Keep the active source filename as `Emetric.jsx`.
- Do not put version numbers in filenames under `src/`.
- Keep application metadata near the top of the source file.
- Use four spaces for indentation.
- Preserve compatibility with Adobe ExtendScript; avoid unsupported modern JavaScript syntax.
- Keep calculations separate from ScriptUI event handling where practical.
- Do not edit files in `dist/` as source.

## Pull requests

A pull request should contain one coherent change and state:

- what changed;
- why it changed;
- how it was tested;
- whether presets, generated documents, or existing workflows are affected.

Use `tests/manual-test-checklist.md` as the baseline for beta testing.
