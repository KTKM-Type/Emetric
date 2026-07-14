# Release process

## 1. Prepare the source

- Complete and merge the intended changes.
- Update `VERSION` and `RELEASE_STATUS` in `src/indesign/Emetric.jsx`.
- Update `CHANGELOG.md`.
- Confirm that source comments and visible version labels agree.

## 2. Test

Run `tests/manual-test-checklist.md` in the supported InDesign environments available for the release.

For an alpha or beta, pay particular attention to:

- presets created by earlier beta versions;
- font enumeration and selected-font metrics;
- placeholder and index page order;
- generated margins, columns, rows, guides, and grids;
- diagnostic log creation after an error.

## 3. Package

Copy the tested source file and give the distribution copy a versioned filename:

```text
Emetric-0.42.0-alpha.3.jsx
```

Do not rename the file under `src/`.

## 4. Tag and publish

Use matching Git tags:

```text
v0.42.0-alpha.3
v0.42.0-rc.1
v1.0.0
```

Create a GitHub Release and mark beta and release-candidate versions as prereleases. Attach the versioned `.jsx` file to the release.

## 5. Continue development

After publication, create a new **Unreleased** section in `CHANGELOG.md` and continue development from `main` using focused branches.
