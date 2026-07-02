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

- [ ] All supported units display and convert correctly.
- [ ] Arithmetic expressions work in editable numeric fields.
- [ ] Leading updates the vertical and horizontal grid values.
- [ ] Column and row module counts are editable.
- [ ] Margins, module areas, page size, and format ratio update consistently.
- [ ] Negative, zero, and invalid inputs are handled without corrupting state.

## Document creation

- [ ] A document is created with the calculated dimensions.
- [ ] Facing Pages and Use A-Master behave as selected.
- [ ] Column gutters are applied only when enabled.
- [ ] Vertical and horizontal guides match the previewed calculations.
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
