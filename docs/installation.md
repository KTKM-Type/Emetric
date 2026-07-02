# Installation

Emetric is an Adobe InDesign ExtendScript file.

## Install from the Scripts panel

1. Open Adobe InDesign.
2. Open **Window → Utilities → Scripts**.
3. In the Scripts panel, reveal the **User** scripts folder in Finder or File Explorer.
4. Copy `Emetric.jsx` into that folder.
5. Return to InDesign and refresh or reopen the Scripts panel.
6. Double-click `Emetric.jsx` to launch Emetric.

## Install a beta release

Download the versioned `.jsx` file attached to the relevant GitHub prerelease. A beta package may be named like this:

```text
Emetric-0.41.0-beta.2.jsx
```

Only run beta versions in documents that can be recreated or restored. Review the generated document before using it in production.

## Diagnostic logs

When diagnostic logging is enabled by the script, logs are written to an `Emetric/Logs` folder inside the current user's Documents folder. Include the relevant log when reporting a reproducible beta error.
