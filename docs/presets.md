# Presets and local data

Emetric stores presets locally per user and machine.

## Preset file

The preset file is stored at:

```text
Folder.userData/Emetric/presets.json
```

On macOS this usually corresponds to:

```text
~/Library/Application Support/Emetric/presets.json
```

## What is saved

The preset file may include:

- saved Emetric presets;
- `lastUsed` values;
- compact/full view state;
- window position;
- recently used UI values.

## What is not saved

Presets are not stored in the InDesign document itself.

Deleting `presets.json` resets local Emetric preset state for the current user.
