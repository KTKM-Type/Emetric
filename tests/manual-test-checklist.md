# Manual test checklist

Record the InDesign version, operating system, Emetric version, and test date with each completed test.

## Launch and state

- [ ] Emetric launches without an error.
- [ ] The title shows the expected version and release status.
- [ ] Full Settings and Compact View open and retain their positions.
- [ ] Default, saved, renamed, and deleted presets behave as expected.
- [ ] Last-used settings survive a normal restart.

## Metric sources and fonts

- [ ] Selected Font is the default metric source.
- [ ] Font Family and Font Style lists populate correctly.
- [ ] A Regular style is selected when available.
- [ ] Emetric Decimal uses `10:8:7:5:−2`.
- [ ] Emetric Dozenal uses `12:8:7:5:−3`.
- [ ] Custom Metric fields appear only when Custom Metric is selected.
- [ ] Custom values update all dependent calculations.

## Measurements and calculations

- [ ] Page Width is editable and remains exactly equal to the entered value.
- [ ] Page Height is editable and remains exactly equal to the entered value.
- [ ] Editing Page Width leaves Column Grid Group unchanged.
- [ ] Editing Page Height leaves Row Grid Group unchanged.
- [ ] Editing either page dimension leaves Grid Module Columns, Rows, and Module Ratio unchanged.
- [ ] Editing Page Height changes Leading while preserving Row Grid Group.
- [ ] Fixed Page Width derives `Horizontal Gridline = Width ÷ Columns`.
- [ ] Fixed Page Width derives `Horizontal Line = Horizontal Gridline ÷ Column Grid Group`.
- [ ] Fixed Page Height derives `Vertical Gridline = Height ÷ Rows`.
- [ ] Fixed Page Height derives `Vertical Line = Vertical Gridline ÷ Row Grid Group`.
- [ ] Fixed Page Height derives Metrics from the Metrics/Leading ratio.
- [ ] With Width `210`, Height `297`, Columns `8`, Rows `12`, both Groups `6`, and ratio `4:5`, the result matches the Anamorphic Format reference: Horizontal Line `4.375`, Vertical Line `4.125`, and Metrics `3.3` mm.
- [ ] In the same reference case, margins are `3.4375` mm, horizontal and vertical gutters are `6.875` mm, and module areas are `19.375 × 17.875` mm.
- [ ] Changing Columns or Column Grid Group preserves a fixed Page Width and recalculates horizontal spacing.
- [ ] Changing Rows or Row Grid Group preserves a fixed Page Height and recalculates vertical spacing and type size.
- [ ] Editing Metrics or Leading releases the fixed Page Height and restores type-led vertical calculation.
- [ ] Editing Metrics or Leading does not release a fixed Page Width.
- [ ] Fixed page dimensions survive preset save, reload, and application.
- [ ] Page dimensions accept arithmetic expressions and all supported measurement units.
- [ ] All supported units display and convert correctly.
- [ ] Arithmetic expressions work in editable numeric fields.
- [ ] Column and row module counts are editable.
- [ ] Margins, module areas, page size, and format ratio update consistently.
- [ ] Negative, zero, and invalid inputs are handled without corrupting state.

## Document creation

- [ ] A document is created with the calculated dimensions.
- [ ] Facing Pages and Use A-Master behave as selected.
- [ ] Column gutters are applied only when enabled.
- [ ] Vertical and horizontal guides match the previewed calculations.
- [ ] InDesign Horizontal Gridline Division equals Column Leading.
- [ ] The perpendicular document-grid division equals Row Leading.
- [ ] In an anamorphic format, the document grid is rectangular when Column Leading differs from Row Leading.
- [ ] Baseline grid division continues to equal Row Leading.
- [ ] Document grid and baseline grid use the expected spacing and colors.
- [ ] Snap to Grid, Snap to Guides, and Grids in Back are applied correctly.
- [ ] Generated paragraph styles use the expected size, leading, indents, and tab stops.

## Optional pages

- [ ] Placeholder Text is disabled when no valid font is selected.
- [ ] Placeholder Text becomes available with a valid selected font.
- [ ] Placeholder text begins at the calculated top margin.
- [ ] Placeholder Text appears on its own page.
- [ ] Emetric Index appears on its own page.
- [ ] When both are enabled, Placeholder Text is page 1 and Emetric Index is page 2.

## Diagnostics

- [ ] A forced test error produces a readable alert.
- [ ] The diagnostic log is created in the expected Documents folder.
- [ ] The log includes version, action, InDesign version, locale, source, font, and unit.
