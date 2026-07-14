# Anamorphic Format calculation model

The editable Page Width and Page Height fields in Emetric `0.42.0-alpha.3` follow the calculation relationships in the reference workbook `VTI-003-Anamorphic_Format-.xlsx`.

## Width as a driver

When Page Width is edited, it becomes a fixed format dimension:

```text
Horizontal Gridline = Page Width / Columns
Horizontal Line     = Horizontal Gridline / Column Grid Group
```

The horizontal line may therefore differ from the vertical typographic leading. Editing Page Width preserves the entered Column Grid Group and module count; only the horizontal line measure is recalculated. If the user later changes Columns or Column Grid Group directly, the fixed width remains and the horizontal spacing is recalculated.

## Height as a driver

When Page Height is edited, it becomes the vertical driver:

```text
Vertical Gridline = Page Height / Rows
Vertical Line     = Vertical Gridline / Row Grid Group
Metrics           = Vertical Line × Metrics Ratio / Leading Ratio
```

Editing Page Height preserves the entered Row Grid Group and module count. The unchanged structure produces a new Vertical Line/Leading, and Metrics follows the selected Metrics/Leading ratio. If the user later changes Rows, Row Grid Group, or the ratio directly, the fixed height remains and the vertical values are recalculated.

## Margins and gutters

As in the reference workbook, both horizontal and vertical margins and gutters retain a physical measure derived from the vertical typographic line:

```text
Offset              = selected type metric / 2
Grid Margin          = Vertical Line - Offset
Grid Gutter          = Grid Margin × 2
Individual Margin    = Vertical Line × Margin Factor - Offset
```

This allows the horizontal module grid to stretch independently without anamorphically stretching the typographic margins and gutters.

## Preserved grid structure

When Page Width or Page Height is edited, Emetric treats the page dimension as the changed value and keeps these structural inputs unchanged:

- Row Grid Group
- Column Grid Group
- Grid Module Columns
- Grid Module Rows
- Grid Module Ratio

Page Height therefore changes Leading rather than changing Row Grid Group. Page Width changes the horizontal line measure rather than changing Column Grid Group.

## Driver precedence

- Editing Page Width fixes width.
- Editing Page Height fixes height and supersedes an explicitly entered Leading.
- Editing Metrics or Leading releases the fixed height and restores the type-led vertical model.
- A fixed width remains active when Metrics or Leading changes.
- Reset clears both fixed dimensions.
- Presets store fixed dimensions in millimeters.

## Reference check

Using the workbook values:

```text
Page Width:       210 mm
Page Height:      297 mm
Columns:          8
Rows:             12
Column Group:     6
Row Group:        6
Metrics/Leading:  4:5
```

produces:

```text
Horizontal Line:  4.375 mm
Vertical Line:    4.125 mm
Metrics:          3.3 mm
Margins:          3.4375 mm
Gutters:          6.875 mm
Module Area:      19.375 × 17.875 mm
Format Ratio:     1:1.414285714
```

## InDesign document grid

When a document is created, Emetric maps the anamorphic line measures to InDesign as follows:

- **Horizontal Gridline Division** uses **Column Leading** (`horizontalLine`).
- The perpendicular document-grid division uses **Row Leading** (`lineSpace`).
- The baseline grid continues to use Row Leading.

This means the InDesign document grid reflects the horizontal deformation instead of forcing a square grid.
