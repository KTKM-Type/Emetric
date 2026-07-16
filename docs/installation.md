# Installation

Emetric is distributed as an Adobe InDesign ExtendScript file.

## Quick start

1. Download the latest Emetric release ZIP.
2. Unzip the package.
3. Locate:

```text
dist/beta/Emetric-0.42.0-beta.1.jsx
```

4. Open Adobe InDesign.
5. Run the script from InDesign’s Scripts panel or by using your preferred script runner.

## Recommended InDesign Scripts folder

You can place the JSX file in InDesign’s user scripts folder.

Typical macOS path:

```text
~/Library/Preferences/Adobe InDesign/<version>/<language>/Scripts/Scripts Panel/
```

Typical Windows path:

```text
%APPDATA%\Adobe\InDesign\<version>\<language>\Scripts\Scripts Panel\
```

The exact folder can vary depending on InDesign version, language and installation.

## Running from the Scripts panel

1. Open InDesign.
2. Go to **Window → Utilities → Scripts**.
3. Right-click **User** and choose **Reveal in Finder** or **Reveal in Explorer**.
4. Copy `Emetric-0.42.0-beta.1.jsx` into that folder.
5. Return to InDesign and double-click the script in the Scripts panel.

## Beta recommendation

Run Emetric on copies of real InDesign documents while testing. The beta creates new documents, layers, guides, grid preferences and paragraph-style settings.
