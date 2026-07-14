# Anamorphic Format

Anamorphic Format is an optional mode that lets page dimensions drive the grid without changing the grid structure.

When the mode is off, Emetric uses the normal type-led model:

```text
Metrics / Leading → Grid → Margins → Page Format
```

When the mode is on, Page Width and Page Height become editable drivers:

```text
Page Width ÷ Columns ÷ Column Grid Group = Column Leading
Page Height ÷ Rows ÷ Row Grid Group = Row Leading
```

Grid Group, Columns and Rows are preserved. The format is allowed to stretch the horizontal and vertical leading independently.

InDesign document grid export follows the same model:

- Horizontal Gridline Division = Column Leading
- Vertical Gridline Division = Row Leading
- Baseline Grid Division = Row Leading
