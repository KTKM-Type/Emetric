# Anamorphic Format

Anamorphic Format is an optional mode in the **Page** section. It lets page dimensions drive the grid while preserving the current page grid-step structure.

When the mode is off, Emetric uses the normal type-led model:

```text
Metrics / Leading → Grid → Margins → Page Format
```

When the mode is on, Page Width and Page Height become editable drivers. They solve back to line measures using the same format expansion as normal mode, including the active margin factors:

```text
Page Width ÷ horizontal page grid steps = Column Leading
Page Height ÷ vertical page grid steps = Row Leading
```

The page grid steps are derived from the existing structure:

```text
horizontal page grid steps = Columns × Column Grid Group + Left Margin factor − 1 + Right Margin factor − 1
vertical page grid steps   = Rows × Row Grid Group + Top Margin factor − 1 + Bottom Margin factor − 1
```

This means a margin change made before enabling Anamorphic Format is preserved when the page size is edited. The format is stretched from the current state instead of being reset to the bare module grid.

Grid Group, Columns, Rows and Margin factors are preserved. Column Leading and Row Leading may diverge.

InDesign document grid export follows the same model:

- Horizontal Gridline Division = Column Leading
- Vertical Gridline Division = Row Leading
- Baseline Grid Division = Row Leading
