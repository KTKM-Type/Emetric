# Project structure

```text
Emetric/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── assets/
├── dist/
├── docs/
├── src/
│   └── indesign/
│       └── Emetric.jsx
├── tests/
├── .editorconfig
├── .gitattributes
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## `src/`

Contains the canonical editable source. The filename does not contain a version number.

## `dist/`

Reserved for generated or copied distribution artifacts. Files in this folder are never the source of truth.

## `docs/`

Contains stable project documentation. User-facing behavior should be updated here when it changes.

## `tests/`

Contains repeatable test instructions and, later, automated tests if practical.

## `.github/`

Contains repository workflow templates. CI workflows can be added later if an automated packaging or validation process is introduced.
