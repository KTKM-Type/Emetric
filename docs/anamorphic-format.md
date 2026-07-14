# Anamorphic Format

Anamorphic Format lets the page dimensions drive the horizontal and vertical line measures while preserving the active grid structure.

In normal mode, Emetric is type-led:

```text
Metrics / Leading → Grid → Margins → Page Format
```

In Anamorphic Format, the page is format-led:

```text
Page Width → Column Leading
Page Height → Row Leading
```

The current grid structure is preserved:

- Column Grid Group is not changed by Width.
- Row Grid Group is not changed by Height.
- Grid Modules Columns and Rows are not changed by Width or Height.
- Margin factors remain active and continue to contribute to the page grid-step count.

## Lock Format Ratio

When **Lock Format Ratio** is enabled together with **Anamorphic Format**, editing one page dimension derives the other from the current page ratio.

- Editing Width keeps the current Width/Height ratio and derives Height.
- Editing Height keeps the current Width/Height ratio and derives Width.
- Height changes continue to drive Row Leading and Metrics through the active Metrics/Leading ratio.

