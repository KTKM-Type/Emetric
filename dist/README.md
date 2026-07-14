# Distribution files

This folder is reserved for packaged test and release files.

Suggested structure when local distribution files are needed:

```text
dist/
├── alpha/
│   └── Emetric-0.42.0-alpha.3.jsx
├── beta/
│   └── Emetric-0.42.0-beta.1.jsx
└── stable/
    └── Emetric-1.0.0.jsx
```

The canonical editable file remains `src/indesign/Emetric.jsx`. Distribution files should be generated from that source and must not be edited independently.

Historical packages should normally be attached to GitHub Releases instead of being retained in the repository.
