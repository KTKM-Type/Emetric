# Metric sources

Emetric can derive typographic proportions from four sources.

## Selected Font

Uses the metrics of the selected installed font and style. This is the default source when a valid font is available.

## Emetric Decimal

Uses a decimal em divided into ten parts:

```text
Metrics : Ascender : Cap Height : x-Height : Descender
10      : 8        : 7          : 5        : −2
```

## Emetric Dozenal

Uses a dozenal em divided into twelve parts:

```text
Metrics : Ascender : Cap Height : x-Height : Descender
12      : 8        : 7          : 5        : −3
```

## Custom Metric

Allows the user to define the metrics base and the ascender, cap-height, x-height, and descender values. Custom values should be treated as a proportional system rather than fixed physical measurements.

The selected metric source affects the derived type measurements and therefore the resulting leading, margins, grids, modules, and page format.
