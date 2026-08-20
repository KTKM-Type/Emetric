# Maintenance notes — stability review

This documents a stability and dead-code review of
`src/indesign/Emetric.jsx` done outside InDesign (static reading plus
ESLint run against the file with the `#target`/`#targetengine`
directives commented out, using rules that don't depend on
InDesign-specific globals: `no-redeclare`, `no-dupe-keys`,
`no-dupe-args`, `no-unreachable`, `no-fallthrough`, `no-cond-assign`,
`no-self-assign`, `no-self-compare`, `no-unused-vars`, and similar).
That pass found no syntax errors and no structural bugs of that kind
anywhere in the file. The findings below are logic-level issues found
by reading the code, confirmed by tracing every reference with
`grep`/ESLint before changing anything.

Two fixes were made directly to `src/indesign/Emetric.jsx`. The rest
are documented, not changed, because confirming them further needs an
actual InDesign session (which this review did not have access to) or
a product decision from the maintainer.

## Fixed

### 1. A preset-file read failure could silently erase all saved presets

**Where:** `loadPresetStore()` / `writePresetStore()` / `markDirty()` →
`scheduleLastUsedPresetSave()`.

**What was wrong:** `loadPresetStore()` caught *any* error while
opening, reading, or parsing `presets.json` — a momentary file lock
from cloud sync (iCloud/OneDrive/Dropbox), a permission hiccup, or a
file left truncated by a previous crash — and silently returned an
empty preset store, with no distinction from "this is a brand-new
install with no file yet." `presetSystemReady` was then set to `true`
regardless. From that point, the very next field edit calls
`markDirty()`, which (750 ms later, debounced) calls
`writePresetStore()` and writes that empty in-memory store back over
the real file on disk — with `showErrors` off, so nothing was ever
shown to the user. A single transient read glitch at startup was
enough to permanently and silently delete every preset the user had
ever saved.

**Fix:** `loadPresetStore()` now routes every "file exists but
couldn't be read/parsed/opened" case through a new
`handlePresetLoadFailure()`, which:

1. Copies the existing (unreadable) file to
   `presets-unreadable-<timestamp>.json` in the same folder, via
   `File.prototype.copy`, before anything can be overwritten.
2. Reports the failure through the existing
   `reportDiagnosticError()` path (writes to the diagnostic log and
   shows an alert naming the backup path), instead of failing
   silently.

The app still starts with an empty preset store in this case (no
behavior change there — that part was reasonable), but the user's
original file is preserved on disk either way, and they are told what
happened instead of finding their presets gone with no explanation.

**Suggested follow-up (not done here):** decide whether repeated
failures should also suspend autosave for the session, and whether
`presets-unreadable-*.json` backups should be pruned automatically
after some number of days.

### 2. The "Emetric Data" info page showed stale Custom Metric ratios

**Where:** `getDocumentOptions()`'s `customRatioText` field, consumed
by `createInformationFrame()`.

**What was wrong:** Since `0.42.0-alpha.32` (per `CHANGELOG.md`),
Custom Metric works by using the visible **Type Size** fields
(`fMetrics`, `oAscender`, `oUppercase`, `oLowercase`, `oDescender`)
directly as manual metric values — that's the whole point of the
alpha.32 change. But `getDocumentOptions()` still built the
"Ratios:" line shown on the generated **Emetric Data** page from a
*different*, older set of fields (`customRatioMetrics`,
`customRatioAscender`, `customRatioCapHeight`, `customRatioXHeight`,
`customRatioDescender`) that live inside a container
(`customRatioContainer`) which is permanently hidden
(`.visible = false`, zero height) and which the user can no longer see
or edit. Those fields only ever held their hardcoded defaults
(`12 / 8 / 7 / 5 / -3`) or a stale value restored from an old preset —
never whatever the user actually typed into Type Size. Result: any
document generated with Metric Source = Custom Metric had a "Ratios:"
line on its Emetric Data page that did not reflect the metrics
actually used to build that document.

**Fix:** `customRatioText` is now built from `fMetrics.text`,
`oAscender.text`, `oUppercase.text`, `oLowercase.text`,
`oDescender.text` — the same fields `customTypeSizeValuesFromFields()`
already treats as the live source of truth for Custom Metric.

### 3. Vertical Grid → Grid Guides measured from the wrong origin

**Where:** `addBoundaryGuides()`'s `startY`, used for the "VTI Major
Horizontal" guides created by the **Grid Guides** checkbox in the
**Vertical Grid** panel.

**What was wrong:** these guides are a page-anchored reference grid —
by design they combine with the equivalent **Grid Guides** checkbox
under **Horizontal Grid** to form a plain rectangular grid across the
whole page format, independent of margins (confirmed with the
maintainer; this is a different, simpler concept than the
margin/type-area-relative Row/Column Gutter Guides drawn by
`addIntersectionGuides()`, which are unaffected by this fix). `startY`
was instead derived from `r.marginTop`, so the row guides drifted with
the margin and Vertical Grid Alignment settings instead of being
anchored to the page. With the default preset (Grid Interval 5 mm,
Steps 6 → Grid Module Height 30 mm, Margin factor Top 1, Alignment
Lowercase → Offset 0.833 mm) this put the first guide at either
4.167 mm or 5 mm from the page's top edge instead of the intended
30 mm — visible as an unwanted gap once the checkbox was enabled (it
defaults off, which is why this went unnoticed for a while — the
Row/Column Gutter Guides, which default on, were never affected).

**Fix:** `startY` is now `r.verticalGridline + r.offsetGridVertical`
(one Grid Module Height, i.e. Steps × Grid Interval, plus the Offset),
measured from the page's physical top edge rather than from
`r.marginTop`. There is intentionally no guide at the page edge itself
("row 0") — the first guide is one full module down, and each
following guide is one more module down, matching the existing
`y = startY + i * r.verticalGridline` loop.

The extra `+ r.offsetGridVertical` term is needed because of a second,
independent effect: `setupDocumentAndBaselineGrids()` sets
`doc.zeroPoint = [0, -r.offsetGridVertical]` so InDesign's native
document grid lines up with the selected Vertical Grid Alignment, and
that call runs earlier in `createDocument()`, before these guides are
placed. `addGuide()` passes its `location` straight through to
`page.guides.add()` with no coordinate adjustment of its own, so it
inherits that shifted ruler — every guide placed after
`setupDocumentAndBaselineGrids()` runs is one Offset Grid higher (in
real page terms) than the number handed to `addGuide()` would suggest,
unless that Offset is added back in. Horizontal Grid's `startX` needs
no equivalent term because only the vertical zero point is shifted
(`doc.zeroPoint`'s X component stays `0`), which matches it being
confirmed correct as-is and left unchanged.

Also removed several lines of superseded scratch formulas for
`startX`/`startY` in the same function that were unconditionally
overwritten before use (dead code, no behavior change) — they were
part of what made the live formula hard to spot next to the actual
bug.

### 4. Save/Delete Preset icons nearly invisible when disabled in Medium Dark

**Where:** `presetIconColor()`'s disabled-state background fallback,
used by the custom-drawn icons in `addPresetIconControl()`.

**What was wrong:** the preset save/delete icon is not a real button —
it's a `"statictext"` control repurposed for hand-rolled drawing (see
`addPresetIconControl()`), which has no fill of its own, so
`graphics.backgroundColor` (read via `presetControlBackgroundColor()`)
is essentially never populated. That makes the hardcoded fallback in
`presetIconColor()` the value that actually determines the disabled
icon's contrast on every theme, not just an edge case. That fallback
only had two tones — one shared by Dark and Medium Dark, one shared by
Medium Light and Light — while `presetHoverPalette()` a few functions
down already has four separately measured Adobe tones, one per UI
brightness level, with a comment noting Medium Dark's was measured
directly against real InDesign. Medium Dark's real panel tone is
lighter than Dark's, so blending the disabled icon color against the
Dark-tuned guess left too little contrast to read in Medium Dark.

**Fix:** the fallback now calls `presetHoverPalette().fill` instead of
guessing, giving all four themes their own already-measured tone. This
is a reasonable, low-risk source since it's the most concretely
verified per-theme data already in the file, but it was written for a
hover highlight rather than an ambient background, so the maintainer
should double check it against a real Medium Dark InDesign session and
adjust the constant if it doesn't look exactly right — this could not
be visually verified without InDesign available during this review.

### 5. Create Document felt slower/less consistent than Live Preview

**Where:** `createButton.onClick()`.

**What was wrong:** `performPreviewUpdate()` (the Live Preview refresh,
which runs on essentially every field edit while Live Preview is on)
wraps its call to `createDocument()` in
`app.scriptPreferences.enableRedraw = false` / restore, specifically
because building a document — layers, guides, paragraph styles,
document/baseline grid setup, the placeholder text frame, the Emetric
Data page — is enough InDesign work that redrawing the screen after
every step is worth skipping. `createButton.onClick()` calls the exact
same `createDocument()` for the final document, but never did this;
every step repainted the screen. Since Live Preview defaults on and
typically just finished the same build moments earlier via the
optimized path, clicking Create right after editing made the
difference between the two paths' redraw behavior easy to notice as
"Create feels slower/less predictable than the preview did."

**Fix:** `createButton.onClick()` now disables `enableRedraw` around
`closePreviewDocument()` + `createDocument()` and restores it in a
`finally` block, mirroring `performPreviewUpdate()` exactly.

### 6. Save/Delete Preset icons redrawn from the Adobe-style Figma pictograms

**Where:** `drawSavePresetPictogram()` / `drawDeletePresetPictogram()`,
drawn by `addPresetIconControl()`; the now-removed `presetFillRectangle()`
helper they used to share.

**What was wrong:** the two pictograms were hand-approximated out of
plain filled rectangles (a boxy tray + arrow for Save, a boxy bin + ribs
for Delete) on a 32 × 32 source grid scaled down by half. They read as
icons but didn't match Adobe's own rounded, proportioned iconography —
the concern behind the maintainer's original "buttons don't render like
Adobe's" report, alongside the Medium Dark contrast bug fixed above.

**Fix, first attempt (visually broken — see revision below):** the
maintainer recreated Adobe's actual Save/Delete pictograms in Figma and
exported them as 16 × 16 SVGs. Both drawing functions were rewritten to
trace that exact path data (including the rounded tray/lid corners,
drawn with `graphics.curveTo()` using the same control-point convention
as SVG's cubic `C` command) instead of approximating with rectangles.
Each icon's cut-outs (the tray's indicator notch; the bin's front face,
ribs and handle gap) were built as genuine holes in one compound path
per fill call — multiple `moveTo()`/`closePath()` subpaths inside a
single `newPath()`/`fillPath()` — rather than rectangles with a gap
left unpainted.

**What was actually wrong with that first attempt:** in real InDesign,
both pictograms rendered as nothing at all (only the hover frame, drawn
separately, was visible) — in every UI theme, not just Medium Dark.
Nowhere else in this file does any drawing function call `moveTo()`
more than once inside a single `newPath()`/`fillPath()` pair (the
existing rounded-rectangle helper, `presetRoundedRectanglePath()`, and
every other custom-drawn shape only ever builds one subpath before
filling or stroking). ScriptUI's Graphics path here does not reliably
support starting a further subpath this way: the second `moveTo()`
call threw, the exception propagated out of the drawing function, and
`addPresetIconControl()`'s `onDraw` swallows it in a bare
`catch (_) {}` — silently, with no icon drawn and no diagnostic
recorded, which is why it looked identical across every theme instead
of just the disabled state.

**Second attempt (Save fixed, Delete still visually wrong — see third
revision below):** both functions were rewritten to build each icon as
a single simple path — one `moveTo()`, a run of `lineTo()`/`curveTo()`
calls, one `closePath()` — using the standard "keyhole" technique for
every cut-out: a straight bridge line out from the surrounding boundary
to the hole's corner, the hole's own perimeter, then back out along the
exact same coordinates, before continuing the surrounding boundary.
Because the bridge is retraced identically in both directions it
encloses zero area, so in theory it reads as a real hole without ever
needing a second subpath or relying on a fill winding rule. The Save
icon's tray notch (one keyhole, not nested) rendered correctly this
way, confirmed against a real InDesign screenshot pixel-for-pixel
against Adobe's icon. The Delete icon nested the technique two levels
deep — a bridge from the outer silhouette to the bin's front-face hole,
then three further bridges from *that* hole's own boundary walk out to
each rib and back — and rendered as one solid silhouette with no holes
at all, confirmed against a real InDesign screenshot. The exact point
sequence was independently simulated outside InDesign (Python/Pillow
polygon fill) and rendered correctly there, so the geometry itself
isn't the bug — whatever fill approach ScriptUI's Graphics path uses
here doesn't reliably resolve that many self-touching pinch points in
one path, even though it does resolve a single one.

**Third attempt (too blocky — see fourth revision below):**
`drawDeletePresetPictogram()` was rebuilt with no hole cut at all: a
union of independent solid rectangles — two handle legs and a top bar,
the lid, two bin side walls and a bottom, and three ribs — each with
its own `newPath()`/`fillPath()` call via a reinstated
`presetFillRectangle()` helper, the same technique this file already
used successfully before the Figma redraw and still uses for Save's
tray and arrow. Confirmed in InDesign that this reliably renders (no
repeat of the solid-blob bug), but the maintainer found it read as too
blocky compared to Adobe's icon — every corner was a sharp rectangle
corner instead of Adobe's rounded ones, and the ribs ran flush to the
bin's inner bottom edge instead of stopping short of it with visible
clearance above the rim, as Adobe's icon does.

**Actual fix:** the handle and the bin body are each redrawn as one
single closed path with genuinely rounded outer corners (`curveTo()`,
guarded by the same `typeof graphics.curveTo === "function"` check used
for Save's tray), while staying just as reliable as the rectangle
version. The trick is that both shapes are *open* on the side where
their hollow interior connects straight through to unpainted space
outside the shape, rather than being fully enclosed: the handle's gap
opens downward into the lid below it, and the bin's front face opens
upward into the lid above it. Tracing an open "staple" (handle) or "U"
(bin walls + bottom) as a single path visits every coordinate exactly
once — unlike a keyhole bridge, which deliberately revisits the same
coordinates twice to fake a fully-enclosed hole, which is what the
second attempt's nested version above did and which is what actually
failed. No repeated or coincident points anywhere in either path. The
three ribs were also shortened (from a height of 8 to 7, in the
16-unit coordinate space) so they stop one unit above the bin's inner
bottom edge instead of touching it, matching the clearance visible in
Adobe's icon. The lid stays a plain rectangle, matching Adobe's own
SVG, which has sharp (not rounded) corners there. Save's function is
unchanged from the second attempt (already confirmed correct in
InDesign) and still uses one non-nested keyhole for its tray notch.
`presetFillRectangle()` remains in use for the lid and the three ribs.
This fourth revision has not yet been re-confirmed in InDesign at the
time of writing.

The Figma export also included two further pictograms, "Horizontal" and
"Vertical" (preserved as-is at `docs/icons/*.svg` alongside the two
already traced above). The maintainer confirmed these are for a future
custom **Orientation** button cluster for **Portrait/Landscape** page
switching — the roadmap item in `docs/roadmap.md` — since ScriptUI has
no native orientation-cluster widget, the same gap that motivated
tracing Adobe's Save/Delete pictograms by hand above. Building that
control (and the width/height-swap logic behind it) was explicitly
deferred by the maintainer; this is scaffolding context for whoever
picks that roadmap item up next, not a call to build it now.

### 7. The Default preset (and any preset using a missing font) always showed "— Modified"

**Where:** `presetSettingsEqual()` (dirty-check comparison), and a
sequencing issue in `applyPresetSettings()`.

**What was wrong:** with **Metric Source = Selected Font** (the Default
preset's setting), Ascender/Cap Height/x-Height/Descender are never
stable saved numbers — `update()` recomputes them live, every time it
runs, from `activeTypeRatios` (whichever font is *currently* installed
and selected, freshly measured by `activateSelectedFontMetrics()`) and
the current Metrics base size. `applyPresetSettings()` does briefly
write the preset's saved Ascender/Cap Height/x-Height/Descender text
into those fields, but the `update()` call that follows immediately
overwrites them again with a fresh live computation — so those four
saved numbers are effectively inert for this Metric Source. If the
preset's original font (Afacad, for the factory Default) isn't
installed, `findPreferredFontFamilyIndex()` silently substitutes
whichever font is first alphabetically on that machine — and that
font's real measured metrics are naturally different numbers from
Afacad's. `presetSettingsEqual()` compared everything captured by
`capturePresetSettings()`, including those four now-substituted
numbers, against the preset's saved ones, so the mismatch flagged the
preset "Modified" immediately, with no user edits involved.

A related sequencing issue made this fragile even with the right font
installed: `applyPresetSettings()` called `activateSelectedFontMetrics()`
(which ends by calling `update()`) *before* restoring `fMetrics.text`
from the preset, so that recompute briefly used the base size left
over from whatever preset was active beforehand rather than the one
being applied.

**Fix:** `fMetrics.text` is now restored from the preset immediately
after `selectPresetFont()`, before `activateSelectedFontMetrics()`/
`activateEmetricSource()` run, so their internal recompute always uses
the correct base size. Separately, `presetSettingsEqual()` now compares
through a new `presetComparableSettings()`, which — only when
`metricSourceKey === "selectedFont"` — drops Ascender/Cap Height/
x-Height/Descender before comparing, since they're derived display
values in that mode, not saved user intent. Font Family and Font Style
(the actual saved intent) still compare normally, so switching to a
preset that names a genuinely different font still correctly shows
Modified once its measured metrics would differ from what's currently
displayed for another reason (e.g. after the user picks yet another
font by hand). Decimal, Dozenal and Custom Metric sources are
unaffected — they use fixed ratios or literally-typed values, not live
font measurement, so there's nothing to substitute.

**Suggested follow-up (not done here):** consider surfacing to the user
when a preset's saved font isn't installed (a status line, similar to
`fontMetricsStatus`), so a silent substitution is visible rather than
just quietly avoided in the dirty-check.

**Second fix, found by the maintainer testing the above in InDesign:**
the dirty-check exclusion above assumes Default always lands back on
the *same* substitute font it started with, so there's nothing left to
compare. That assumption broke because `reset()` never selected a font
at all — it left `fontFamilyDropdown`/`fontStyleDropdown` exactly as
the user had last set them. Pressing **Reset** after picking a
different font therefore kept that font selected instead of returning
to Default's own (preferred-or-fallback) font, so the very next
dirty-check still correctly found a genuine Font Family difference and
showed "Modified" — Font Family/Style were never part of the exclusion
above, by design, since they're real saved intent. `reset()` now
re-resolves the preferred font the same way dialog startup does
(`findPreferredFontFamilyIndex()` + `populateFontStyles()`, guarded
with `fontSelectionIsUpdating` so `fontFamilyDropdown.onChange` doesn't
also fire and redundantly re-measure) before calling
`activateSelectedFontMetrics()`, so Reset reliably lands back on
Default's font every time regardless of what was selected beforehand.

While fixing this, `findPreferredFontFamilyIndex()`'s candidate list
was also expanded from just `["Afacad", "Afacad Flux"]` to the
maintainer's full preferred order — `Afacad`, `Afacad Pro`,
`Afacad Flux`, `A Garamond`, `Minion`, `Minion Pro`, `Times`,
`Times New`, `Comic Sans` — tried in that order, falling through to
index 0 (whatever is first alphabetically) only if none of those are
installed.

**Third fix:** matching was originally an *exact* case-insensitive
family name comparison, so e.g. a font installed as "Times New Roman"
would not match the "Times New" entry. Changed to a "starts with"
match (case-insensitive `indexOf(...) === 0`) per the maintainer's
request, so "Times New" now matches "Times New Roman", "Minion"
matches "Minion Pro", "Comic Sans" matches "Comic Sans MS", and so on.
One side effect worth knowing about: because candidates are still
tried strictly in list order, a broader early entry can match before a
more specific later one is ever reached — e.g. "Times" (priority 7)
will match an installed "Times New Roman" before "Times New"
(priority 8) gets a chance to, which happens to give the same result
here but would matter if a future candidate list relied on the more
specific entry actually being reached.

## Dead code removed (zero call sites, confirmed by ESLint + grep)

These seven functions had no reference anywhere else in the file — not
in an event handler, not in a preset field, nothing. Removing them is
a pure line-count/readability cleanup with no behavior change:
`currentUnitSuffix`, `formatInternalInputNumber`, `toPoints`,
`styleFieldLabel`, `addSubheading`, `addNote`,
`presetBackgroundLuminance`.

## Documented, not changed — needs InDesign testing or a product call

These are all cases where a variable is written but never read
anywhere, which usually means a feature was partially removed or
never finished. None of them currently produce *wrong* output the way
the two fixed bugs did (as far as static reading can tell), so they
were left alone rather than guessed at.

- **The whole hidden Custom Ratio panel.** `customRatioContainer` and
  its five fields (`customRatioMetrics`, `customRatioAscender`,
  `customRatioCapHeight`, `customRatioXHeight`,
  `customRatioDescender`) are built, permanently hidden, still written
  to by `setCustomMetricFieldValues()` / `applyPresetSettings()` /
  `reset()`, still read by `customRatiosFromFields()`, and still
  included in the `inputFields` array that drives focus tracking and
  the giant `onChanging`/`onChange` wiring loop — but the whole
  subsystem is unreachable by the user, because nothing ever calls
  `inheritCustomMetricFromSource()` (itself 100% dead, zero callers)
  and `activateCustomRatios()` no longer references any of it. This
  looks like leftover scaffolding from before the alpha.32 redesign
  that was never fully cleaned up. It's also still part of the saved
  preset schema (`presets.json`), so removing it safely means checking
  backward compatibility with existing users' preset files, not just
  the code. Recommend: confirm in InDesign that removing it doesn't
  regress anything, then delete it as a follow-up change.
- **`exactGridRows`** (module-level var near `update()`/`readValues()`)
  is set on `fGridGroupV`'s `onChange` and reset to `null` on
  `fGridGroupH`'s `onChanging`, mirroring the pattern used for
  `exactLineSpaceMM`/`exactPageWidthMM`/`exactPageHeightMM` — except
  those three are read back inside `readValues()` and `exactGridRows`
  is not. If the intent was "preserve the user's exact typed row count
  across a recalculation the way the other three overrides do," that
  part of the feature is currently a no-op. Needs the maintainer to
  confirm the intended behavior before wiring it up.
- **`lastActiveSelection`** (caret/selection range of the last active
  input field) is carefully computed in `rememberInputFocus()` but
  `restoreInputFocus()` always does `field.selection = [0,
  field.text.length]` (select the whole value) instead of using it —
  and a comment right there explains that's intentional, so this looks
  like a deliberate later change that left the now-unused tracking
  code behind rather than a bug. Safe to delete the tracking, but
  left in place in case the maintainer intends to bring back precise
  selection restoration.
- **`previousSourceKey`** (captured in `metricsSourceDropdown.onChange`)
  and **`customRatiosExpanded`** (state for the now-removed
  expand/collapse behavior of the Custom Ratio panel, per its own
  comment) are both write-only. Same category as above: harmless,
  but worth a cleanup pass once the hidden Custom Ratio panel question
  above is resolved, since they're all part of the same leftover
  subsystem.
- **`previewFirstOpen`** is assigned `true`/`false` in seven places
  around the live-preview-document lifecycle but never read anywhere.
  Likely a leftover from a removed "only auto-fit/reposition the
  preview the first time it opens" behavior. No observed effect on
  output; flagged for the maintainer to decide whether to restore the
  intended behavior or delete the variable.

## Explicitly checked and found correct

To avoid re-litigating these in a future pass: `calculate(v)`'s
division guards, offset-source pairing (rows↔vertical,
columns↔horizontal), and its anamorphic-override algebra were traced
by hand and are internally consistent; every unit in `UNIT_OPTIONS`
round-trips through `unitToMM`/`mmToUnit` correctly, including the
compound Pica/Cicero/Edo special cases; `presetJSONStringify`/
`presetJSONParse` correctly escape and round-trip strings, arrays,
objects, and stable key ordering; every field written by
`capturePresetSettings()` has a matching restore in
`applyPresetSettings()` (no orphaned preset keys in either direction).
