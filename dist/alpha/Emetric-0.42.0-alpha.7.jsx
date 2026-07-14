#target "InDesign"
#targetengine "Emetric"

/*
Emetric — source
File: src/indesign/Emetric.jsx
Version 0.42.0-alpha.7, 2026

A typographic proportioning tool for creating type-based document grids,
margins and modular layouts in Adobe InDesign.

Based on Kristian Möller's Konstfack Master Project, 2012–2014.
Copyright © 2012–2026 by Kristian Möller, KTKM. All rights reserved.

This software, including its source code, design, documentation and associated
materials, is the exclusive property of Kristian Möller / KTKM Design AB.
No part of the software may be copied, modified, distributed, sublicensed,
sold or otherwise used without prior written permission from the copyright holder.
*/

(function () {
    // ---------- Application metadata ----------

    // Keep release metadata here so source and distribution builds use the
    // same version information. Set RELEASE_STATUS to an empty string for a
    // stable release.
    var APP_NAME = "Emetric";
    var VERSION = "0.42.0-alpha.7";
    var RELEASE_STATUS = "ALPHA";
    var SCRIPT_NAME =
        APP_NAME +
        " v" +
        VERSION +
        (RELEASE_STATUS ? " — " + RELEASE_STATUS : "");
    var MM_TO_PT = 2.834645669291339;

    // ---------- Diagnostics ----------

    var LOG_ROOT_NAME = APP_NAME;
    var LOG_FOLDER_NAME = "Logs";
    var diagnosticLastAction = "Startup";
    var diagnosticLastLogPath = "";

    function padNumber(value, width) {
        var text = String(value);

        while (text.length < width) {
            text = "0" + text;
        }

        return text;
    }

    function diagnosticTimestamp() {
        var now = new Date();

        return (
            padNumber(now.getFullYear(), 4) +
            "-" +
            padNumber(now.getMonth() + 1, 2) +
            "-" +
            padNumber(now.getDate(), 2) +
            " " +
            padNumber(now.getHours(), 2) +
            ":" +
            padNumber(now.getMinutes(), 2) +
            ":" +
            padNumber(now.getSeconds(), 2)
        );
    }

    function safeDiagnosticText(value) {
        return String(
            value === undefined ||
            value === null
                ? ""
                : value
        )
            .replace(/\r\n/g, " ")
            .replace(/\r/g, " ")
            .replace(/\n/g, " ");
    }

    function diagnosticLogFolder() {
        try {
            var root =
                new Folder(
                    Folder.myDocuments.fsName +
                    "/" +
                    LOG_ROOT_NAME
                );

            if (
                !root.exists &&
                !root.create()
            ) {
                return null;
            }

            var logFolder =
                new Folder(
                    root.fsName +
                    "/" +
                    LOG_FOLDER_NAME
                );

            if (
                !logFolder.exists &&
                !logFolder.create()
            ) {
                return null;
            }

            return logFolder.exists
                ? logFolder
                : null;
        } catch (_) {
            return null;
        }
    }

    function diagnosticLogFile() {
        var folder = diagnosticLogFolder();

        if (!folder) {
            return null;
        }

        var file =
            new File(
                folder.fsName +
                "/Emetric-v" +
                VERSION +
                ".log"
            );

        try {
            diagnosticLastLogPath = file.fsName;
        } catch (_) {
            diagnosticLastLogPath = file.fullName;
        }

        return file;
    }

    function diagnosticSelectedText(dropdown) {
        try {
            return (
                dropdown &&
                dropdown.selection
            )
                ? String(dropdown.selection.text)
                : "";
        } catch (_) {
            return "";
        }
    }

    function diagnosticContextLines() {
        var lines = [];

        try {
            lines.push(
                "Operating system: " +
                safeDiagnosticText($.os)
            );
        } catch (_) {}

        try {
            lines.push(
                "InDesign version: " +
                safeDiagnosticText(app.version)
            );
        } catch (_) {}

        try {
            lines.push(
                "InDesign locale: " +
                safeDiagnosticText(app.locale)
            );
        } catch (_) {}

        try {
            lines.push(
                "View: " +
                (
                    compactMode
                        ? "Compact View"
                        : "Full Settings"
                )
            );
        } catch (_) {}

        try {
            lines.push(
                "Preset: " +
                safeDiagnosticText(currentPresetId)
            );
        } catch (_) {}

        try {
            lines.push(
                "Metric source: " +
                safeDiagnosticText(
                    selectedMetricSourceName()
                )
            );
        } catch (_) {}

        try {
            lines.push(
                "Font: " +
                safeDiagnosticText(
                    diagnosticSelectedText(
                        fontFamilyDropdown
                    )
                ) +
                " / " +
                safeDiagnosticText(
                    diagnosticSelectedText(
                        fontStyleDropdown
                    )
                )
            );
        } catch (_) {}

        try {
            lines.push(
                "Unit: " +
                safeDiagnosticText(
                    UNIT_OPTIONS[
                        currentUnitIndex
                    ].name
                )
            );
        } catch (_) {}

        return lines;
    }

    function appendDiagnosticLog(level, action, error) {
        var file = null;

        try {
            file = diagnosticLogFile();

            if (!file) {
                return false;
            }

            file.encoding = "UTF-8";
            file.lineFeed = "Unix";

            if (!file.open("a")) {
                return false;
            }

            file.writeln(
                "[" +
                diagnosticTimestamp() +
                "] " +
                safeDiagnosticText(level)
            );
            file.writeln(
                "Version: " +
                VERSION
            );
            file.writeln(
                "Action: " +
                safeDiagnosticText(
                    action ||
                    diagnosticLastAction
                )
            );

            var contextLines =
                diagnosticContextLines();

            for (
                var contextIndex = 0;
                contextIndex <
                    contextLines.length;
                contextIndex++
            ) {
                file.writeln(
                    contextLines[
                        contextIndex
                    ]
                );
            }

            if (error) {
                file.writeln(
                    "Error: " +
                    safeDiagnosticText(
                        error.message ||
                        error
                    )
                );

                try {
                    if (
                        error.number !==
                        undefined
                    ) {
                        file.writeln(
                            "Error number: " +
                            safeDiagnosticText(
                                error.number
                            )
                        );
                    }
                } catch (_) {}

                try {
                    if (error.line) {
                        file.writeln(
                            "Line: " +
                            safeDiagnosticText(
                                error.line
                            )
                        );
                    }
                } catch (_) {}
            }

            file.writeln("---");
            file.close();
            return true;
        } catch (_) {
            try {
                if (
                    file &&
                    file.opened
                ) {
                    file.close();
                }
            } catch (__) {}

            return false;
        }
    }

    function setDiagnosticAction(action, writeEntry) {
        diagnosticLastAction =
            String(
                action ||
                "Unknown action"
            );

        if (writeEntry) {
            appendDiagnosticLog(
                "ACTION",
                diagnosticLastAction,
                null
            );
        }
    }

    function writeDiagnosticInfo(message) {
        appendDiagnosticLog(
            "INFO",
            message,
            null
        );
    }

    function reportDiagnosticError(
        action,
        error,
        introduction,
        showAlert
    ) {
        var resolvedAction =
            String(
                action ||
                diagnosticLastAction ||
                "Unknown action"
            );
        var message =
            safeDiagnosticText(
                error &&
                error.message
                    ? error.message
                    : error
            );
        var numberText = "";
        var lineText = "";

        diagnosticLastAction = resolvedAction;

        var logWritten =
            appendDiagnosticLog(
                "ERROR",
                resolvedAction,
                error
            );

        try {
            if (
                error &&
                error.number !==
                    undefined
            ) {
                numberText =
                    "\rError number: " +
                    error.number;
            }
        } catch (_) {}

        try {
            if (
                error &&
                error.line
            ) {
                lineText =
                    "\rLine: " +
                    error.line;
            }
        } catch (_) {}

        if (showAlert === false) {
            return;
        }

        var logText =
            logWritten
                ? (
                    "\r\rDiagnostic log:\r" +
                    diagnosticLastLogPath
                  )
                : (
                    "\r\rThe diagnostic log " +
                    "could not be written."
                  );

        alert(
            (
                introduction
                    ? introduction + "\r\r"
                    : ""
            ) +
            SCRIPT_NAME +
            " encountered an error.\r\r" +
            "Action: " +
            resolvedAction +
            "\rError: " +
            message +
            numberText +
            lineText +
            logText +
            "\r\rInclude this information " +
            "in the issue or test report.",
            SCRIPT_NAME
        );
    }

    var DOZENAL_TYPE_RATIOS = {
        ascender: 8 / 12,
        capHeight: 7 / 12,
        xHeight: 5 / 12,
        descender: -3 / 12
    };

    var DECIMAL_TYPE_RATIOS = {
        ascender: 8 / 10,
        capHeight: 7 / 10,
        xHeight: 5 / 10,
        descender: -2 / 10
    };

    var DEFAULT_TYPE_RATIOS = DOZENAL_TYPE_RATIOS;

    var activeTypeRatios = {
        ascender: DOZENAL_TYPE_RATIOS.ascender,
        capHeight: DOZENAL_TYPE_RATIOS.capHeight,
        xHeight: DOZENAL_TYPE_RATIOS.xHeight,
        descender: DOZENAL_TYPE_RATIOS.descender
    };

    var selectedFontMetrics = null;
    var installedFontRecords = [];
    var installedFontFamilies = [];
    var fontSelectionIsUpdating = false;
    var fontUnitsPerEmCache = {};

    var PRESET_FORMAT_VERSION = 1;
    var PRESET_FOLDER_NAME = "Emetric";
    var PRESET_FILE_NAME = "presets.json";
    var PRESET_LAST_USED_IDLE_NAME =
        "Emetric Save Last Used Preset";

    var presetStore = {
        formatVersion: PRESET_FORMAT_VERSION,
        lastUsed: null,
        presets: [],
        uiState: {
            compactMode: false,
            mainLocation: null,
            compactLocation: null
        }
    };

    var defaultPresetSettings = null;
    var currentPresetId = "default";
    var currentPresetBaseline = null;
    var presetSystemReady = false;
    var presetIsApplying = false;
    var presetDropdownIsUpdating = false;
    var presetLastUsedIdleTask = null;

    // Courier New Regular x-height measured by Kristian Möller:
    // 866 units in a 2048 UPM em.
    var COURIER_NEW_X_HEIGHT_RATIO = 866 / 2048;


    var DIDOT_POINT_MM = 0.3759715104;
    var EDO_POINTS_PER_EDO = 12;
    var EDO_MM = 1;
    var EDO_POINT_MM = 1 / EDO_POINTS_PER_EDO;

    var UNIT_OPTIONS = [
        {
            name: "Millimeters",
            menuLabel: "Millimeters (mm)",
            suffix: "mm",
            mmPerUnit: 1,
            measurementUnit: MeasurementUnits.MILLIMETERS
        },
        {
            name: "Points",
            menuLabel: "Points (pt)",
            suffix: "pt",
            mmPerUnit: 25.4 / 72,
            measurementUnit: MeasurementUnits.POINTS
        },
        {
            name: "Picas",
            menuLabel: "Picas (p)",
            suffix: "p",
            mmPerUnit: 25.4 / 6,
            measurementUnit: MeasurementUnits.PICAS
        },
        {
            name: "Ciceros",
            menuLabel: "Ciceros (c)",
            suffix: "c",
            mmPerUnit: DIDOT_POINT_MM * 12,
            measurementUnit: MeasurementUnits.CICEROS
        },
        {
            name: "Didot Points",
            menuLabel: "Didot Points (dp)",
            suffix: "dp",
            mmPerUnit: DIDOT_POINT_MM,
            measurementUnit: MeasurementUnits.CICEROS
        },
        {
            name: "Edo",
            menuLabel: "Edo (e)",
            suffix: "e",
            mmPerUnit: EDO_MM,
            measurementUnit: MeasurementUnits.MILLIMETERS
        },
        {
            name: "Edo Points",
            menuLabel: "Edo Points (ep)",
            suffix: "ep",
            mmPerUnit: EDO_POINT_MM,
            measurementUnit: MeasurementUnits.MILLIMETERS
        }
    ];

    var currentUnitIndex = 0;

    function unitToMM(value, unitIndex) {
        if (unitIndex === 5) {
            // Compound Edo: 1 e = 1 mm.
            return value * EDO_MM;
        }

        if (unitIndex === 6) {
            // Edo Points: 12 ep = 1 e = 1 mm.
            return value * EDO_POINT_MM;
        }

        return value * UNIT_OPTIONS[unitIndex].mmPerUnit;
    }

    function mmToUnit(value, unitIndex) {
        if (unitIndex === 5) {
            // Compound Edo: 1 mm = 1 e.
            return value / EDO_MM;
        }

        if (unitIndex === 6) {
            // Edo Points: 1 mm = 12 ep.
            return value / EDO_POINT_MM;
        }

        return value / UNIT_OPTIONS[unitIndex].mmPerUnit;
    }

    function currentUnitSuffix() {
        return UNIT_OPTIONS[currentUnitIndex].suffix;
    }

    function formatInDesignCompoundUnit(value, unitIndex) {
        // Pica, Cicero and Edo use whole units plus twelfths:
        // 1 pica = 12 points -> 1p0
        // 1 cicero = 12 Didot points -> 1c0
        // 1 Edo = 12 Edo Points -> 1e0
        var prefix =
            unitIndex === 2 ? "p" :
            unitIndex === 3 ? "c" :
            "e";
        var sign = value < 0 ? "-" : "";
        var absoluteValue = Math.abs(value);

        var wholeUnits = Math.floor(absoluteValue + 0.0000001);
        var pointPart = (absoluteValue - wholeUnits) * 12;

        // Keep useful precision for fractional points while avoiding floating noise.
        var roundedPoints = Math.round(pointPart * 1000) / 1000;

        if (roundedPoints >= 12) {
            wholeUnits += 1;
            roundedPoints = 0;
        }

        return sign + wholeUnits + prefix + formatNumber(roundedPoints);
    }

    function formatMeasureValue(valueMM, unitIndex) {
        var value = mmToUnit(valueMM, unitIndex);

        if (unitIndex === 2 || unitIndex === 3 || unitIndex === 5) {
            return formatInDesignCompoundUnit(value, unitIndex);
        }

        return formatMeasureNumber(value, unitIndex) + " " + UNIT_OPTIONS[unitIndex].suffix;
    }

    function scriptNumber(value) {
        // ExtendScript measurement strings require a decimal point.
        return String(Math.round(value * 1000000) / 1000000);
    }

    function exportPointValue(valueMM, unitIndex) {
        // Text size and leading in InDesign are typographic point values.
        // Send an explicit "pt" measurement string so 12 pt remains exactly 12 pt
        // regardless of ruler units or regional preferences.
        var pointValue;

        if (unitIndex === 1) {
            // Points: preserve the number shown in the VTI field.
            pointValue = mmToUnit(valueMM, unitIndex);
        } else {
            // Millimeters, picas, ciceros, Didot Points, Edo and Edo Points retain their physical size.
            pointValue = valueMM * 72 / 25.4;
        }

        return scriptNumber(pointValue) + " pt";
    }


    function normalizeHex(value, fallback) {
        var s = String(value || "").replace(/\s/g, "").toUpperCase();
        if (s.charAt(0) !== "#") s = "#" + s;
        if (/^#[0-9A-F]{6}$/.test(s)) return s;
        return fallback || "#000000";
    }

    function hexToRGB(hex) {
        var h = normalizeHex(hex, "#000000").substring(1);
        return [
            parseInt(h.substring(0, 2), 16),
            parseInt(h.substring(2, 4), 16),
            parseInt(h.substring(4, 6), 16)
        ];
    }

    function hexToInteger(hex) {
        return parseInt(normalizeHex(hex, "#000000").substring(1), 16);
    }

    function integerToHex(value) {
        var n = Number(value);
        if (isNaN(n) || n < 0) return null;
        var s = Math.round(n).toString(16).toUpperCase();
        while (s.length < 6) s = "0" + s;
        if (s.length > 6) s = s.substring(s.length - 6);
        return "#" + s;
    }

    function rgb01(hex) {
        var rgb = hexToRGB(hex);
        return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1];
    }

    var COLOR_PROFILES = [
        {
            name: "Emetric",
            guides: "#4F99FF",
            margins: "#4F99FF",
            columns: "#4F99FF",
            baseline: "#AAD4FF",
            document: "#E0E0E0"
        },
        {
            name: "InDesign",
            guides: "#00FFFF",
            margins: "#FF00FF",
            columns: "#7F3FBF",
            baseline: "#66CCFF",
            document: "#BFBFBF"
        },
        {
            name: "Monochrome",
            guides: "#666666",
            margins: "#999999",
            columns: "#7A7A7A",
            baseline: "#B8B8B8",
            document: "#E2E2E2"
        },
        {
            name: "Blueprint",
            guides: "#0066CC",
            margins: "#008FBF",
            columns: "#3F7FBF",
            baseline: "#8FC9E8",
            document: "#D9EBF5"
        },
        {
            name: "Warm Drafting",
            guides: "#C45A00",
            margins: "#A33A2B",
            columns: "#C08040",
            baseline: "#D9A878",
            document: "#E8DDD2"
        },
        {
            name: "Bauhaus",
            guides: "#0057B8",
            margins: "#D62828",
            columns: "#F2A900",
            baseline: "#80B4E0",
            document: "#D9D9D9"
        },
        {
            name: "Nordic",
            guides: "#497A8A",
            margins: "#8A5A66",
            columns: "#6E7F91",
            baseline: "#A8C3CC",
            document: "#DEE5E7"
        },
        {
            name: "Forest",
            guides: "#2F6B4F",
            margins: "#8A5A44",
            columns: "#5D7A63",
            baseline: "#A9C3AE",
            document: "#DFE7E0"
        },
        {
            name: "High Contrast",
            guides: "#005BFF",
            margins: "#FF2A2A",
            columns: "#B000FF",
            baseline: "#00A6A6",
            document: "#BFBFBF"
        },
        {
            name: "Soft Pastel",
            guides: "#6FA8DC",
            margins: "#D58A94",
            columns: "#9C8BC2",
            baseline: "#A9D1C0",
            document: "#E4E2DF"
        }
    ];

    function addColorSelector(parent, label, defaultHex, labelWidth) {
        var group = parent.add("group");
        prepareFieldRow(group);

        var caption = addFieldLabel(group, label, labelWidth);

        var hexField =
            group.add("edittext", undefined, normalizeHex(defaultHex));
        styleEditField(hexField);

        var preview = group.add("panel", undefined, "");
        preview.preferredSize = [18, 18];
        preview.minimumSize = [18, 18];
        preview.maximumSize = [18, 18];

        var colorRowSpacer = group.add("statictext", undefined, "");
        colorRowSpacer.preferredSize.width =
            UI_FIELD_WIDTH + UI_UNIT_WIDTH - 14;
        colorRowSpacer.minimumSize.width =
            UI_FIELD_WIDTH + UI_UNIT_WIDTH - 14;

        var selector = {
            group: group,
            preview: preview,
            hexField: hexField,
            hex: normalizeHex(defaultHex),
            onUserChange: null,
            suppressChange: false
        };

        function refreshPreview() {
            try {
                if (preview.window && preview.window.update) {
                    preview.window.update();
                } else if (group.window && group.window.update) {
                    group.window.update();
                }
            } catch (_) {}
        }

        preview.onDraw = function () {
            var g = preview.graphics;
            var bounds = preview.bounds;
            try {
                var brush = g.newBrush(g.BrushType.SOLID_COLOR, rgb01(selector.hex));
                g.rectPath(1, 1, bounds.width - 2, bounds.height - 2);
                g.fillPath(brush);
                var pen = g.newPen(g.PenType.SOLID_COLOR, [0.25, 0.25, 0.25, 1], 1);
                g.rectPath(0.5, 0.5, bounds.width - 1, bounds.height - 1);
                g.strokePath(pen);
            } catch (_) {}
        };

        function openSystemColorPicker() {
            try {
                var previousHex = normalizeHex(selector.hex, "#000000");
                var picked = $.colorPicker(hexToInteger(previousHex));

                // Cancel or no valid result: keep current color and profile unchanged.
                if (picked === -1 || picked === null || picked === undefined) return;

                var pickedHex = integerToHex(picked);
                if (!pickedHex) return;
                pickedHex = normalizeHex(pickedHex, previousHex);

                // Choosing the same color is not a custom change.
                if (pickedHex === previousHex) {
                    selector.hexField.text = previousHex;
                    refreshPreview();
                    return;
                }

                selector.hex = pickedHex;
                selector.hexField.text = pickedHex;

                // Force immediate visual update as soon as the system picker closes.
                try {
                    selector.preview.visible = false;
                    selector.preview.visible = true;
                } catch (_) {}

                refreshPreview();

                try {
                    if (selector.group.window && selector.group.window.layout) {
                        selector.group.window.layout.layout(true);
                    }
                } catch (_) {}

                try {
                    if (selector.preview.window && selector.preview.window.update) {
                        selector.preview.window.update();
                    }
                } catch (_) {}

                if (!selector.suppressChange && selector.onUserChange) {
                    selector.onUserChange();
                }
            } catch (e) {
                alert("Systemets färgväljare kunde inte öppnas.\r\r" + e.message);
            }
        }

        try {
            preview.addEventListener("click", openSystemColorPicker);
        } catch (_) {
            preview.onClick = openSystemColorPicker;
        }

        hexField.onChanging = function () {
            var raw = String(hexField.text || "").replace(/\s/g, "").toUpperCase();
            if (raw.charAt(0) !== "#") raw = "#" + raw;
            if (/^#[0-9A-F]{6}$/.test(raw)) {
                selector.hex = raw;
                refreshPreview();
                if (!selector.suppressChange && selector.onUserChange) {
                    selector.onUserChange();
                }
            }
        };

        hexField.onChange = function () {
            selector.hex = normalizeHex(hexField.text, selector.hex);
            hexField.text = selector.hex;
            refreshPreview();
            if (!selector.suppressChange && selector.onUserChange) {
                selector.onUserChange();
            }
        };

        selector.getValue = function () {
            return hexToRGB(selector.hex);
        };

        selector.getHex = function () {
            return normalizeHex(selector.hex, "#000000");
        };

        selector.set = function (hex) {
            selector.suppressChange = true;
            selector.hex = normalizeHex(hex, "#000000");
            selector.hexField.text = selector.hex;

            // Repaint without toggling visibility, which causes flicker.
            try {
                selector.preview.notify("onDraw");
            } catch (_) {}

            refreshPreview();

            try {
                if (
                    selector.preview.window &&
                    selector.preview.window.update
                ) {
                    selector.preview.window.update();
                }
            } catch (_) {}

            selector.suppressChange = false;
        };

        refreshPreview();
        return selector;
    }


    // ---------- Utilities ----------

    function evaluateArithmeticExpression(value) {
        var text = String(value === undefined || value === null ? "" : value)
            .replace(/,/g, ".")
            .replace(/\s+/g, "")
            .replace(/−/g, "-")
            .replace(/–/g, "-")
            .replace(/—/g, "-")
            .replace(/×/g, "*")
            .replace(/÷/g, "/");

        if (!text) {
            throw new Error("Empty expression.");
        }

        // Allow only numbers, decimal points, arithmetic operators
        // and parentheses. No names, properties or function calls.
        if (!/^[0-9+\-*\/().]+$/.test(text)) {
            throw new Error("Invalid characters in expression.");
        }

        var index = 0;

        function peek() {
            return text.charAt(index);
        }

        function consume(character) {
            if (peek() !== character) {
                throw new Error("Expected " + character + ".");
            }
            index++;
        }

        function parsePrimary() {
            var character = peek();

            if (character === "+") {
                index++;
                return parsePrimary();
            }

            if (character === "-") {
                index++;
                return -parsePrimary();
            }

            if (character === "(") {
                index++;
                var grouped = parseExpression();
                consume(")");
                return grouped;
            }

            var start = index;
            var decimalCount = 0;

            while (index < text.length) {
                character = peek();

                if (character === ".") {
                    decimalCount++;
                    if (decimalCount > 1) break;
                    index++;
                } else if (
                    character >= "0" &&
                    character <= "9"
                ) {
                    index++;
                } else {
                    break;
                }
            }

            if (start === index) {
                throw new Error("Expected a number.");
            }

            var token = text.substring(start, index);

            if (token === ".") {
                throw new Error("Invalid number.");
            }

            var number = Number(token);

            if (!isFinite(number)) {
                throw new Error("Invalid number.");
            }

            return number;
        }

        function parseTerm() {
            var value = parsePrimary();

            while (index < text.length) {
                var operator = peek();

                if (operator !== "*" && operator !== "/") break;
                index++;

                var right = parsePrimary();

                if (operator === "*") {
                    value *= right;
                } else {
                    if (right === 0) {
                        throw new Error("Division by zero.");
                    }
                    value /= right;
                }
            }

            return value;
        }

        function parseExpression() {
            var value = parseTerm();

            while (index < text.length) {
                var operator = peek();

                if (operator !== "+" && operator !== "-") break;
                index++;

                var right = parseTerm();
                value = operator === "+" ? value + right : value - right;
            }

            return value;
        }

        var result = parseExpression();

        if (index !== text.length || !isFinite(result)) {
            throw new Error("Invalid expression.");
        }

        return result;
    }

    function parseNumber(value, fallback) {
        try {
            return evaluateArithmeticExpression(value);
        } catch (_) {
            return fallback;
        }
    }

    function parseMeasureInput(value, unitIndex, fallback) {
        var text = String(value).replace(",", ".").replace(/\s+/g, "");

        // Remove the visible suffix for simple units before parsing.
        if (unitIndex === 0) {
            text = text.replace(/mm$/i, "");
        } else if (unitIndex === 1) {
            text = text.replace(/pt$/i, "");
        } else if (unitIndex === 4) {
            text = text.replace(/(?:didotpoints?|dp)$/i, "");
        } else if (unitIndex === 6) {
            text = text.replace(/(?:edopoints?|ep)$/i, "");
        }

        if (unitIndex === 2 || unitIndex === 3 || unitIndex === 5) {
            var marker =
                unitIndex === 2 ? "p" :
                unitIndex === 3 ? "c" :
                "e";
            var parts = text.toLowerCase().split(marker);

            if (parts.length === 2) {
                var whole = parseNumber(parts[0], 0);
                var points = parseNumber(parts[1], 0);

                var sign = whole < 0 || text.charAt(0) === "-" ? -1 : 1;
                return sign * (Math.abs(whole) + Math.abs(points) / 12);
            }
        }

        return parseNumber(text, fallback);
    }

    function round(value, decimals) {
        var p = Math.pow(10, decimals || 3);
        return Math.round(value * p) / p;
    }

    function formatInputNumber(value) {
        var n = round(value, 8);
        var s = String(n);
        return s.replace(".", ",");
    }

    function formatEditableMeasureValue(valueMM, unitIndex) {
        var value = mmToUnit(valueMM, unitIndex);

        if (unitIndex === 2 || unitIndex === 3 || unitIndex === 5) {
            return formatInDesignCompoundUnit(value, unitIndex);
        }

        return (
            formatInputNumber(value) +
            " " +
            UNIT_OPTIONS[unitIndex].suffix
        );
    }

    function formatNumber(value) {
        var n = round(value, 3);
        var s = String(n);
        return s.replace(".", ",");
    }

    function formatMeasureNumber(value, unitIndex) {
        // Display all measurement values with up to three decimals.
        // Conversion calculations retain full precision internally.
        var n = round(value, 3);
        var s = String(n);
        return s.replace(".", ",");
    }

    function mmString(value) {
        return formatNumber(value) + " mm";
    }

    function toPoints(mm) {
        return mm * MM_TO_PT;
    }

    function positive(value, label) {
        if (!(value > 0)) throw new Error(label + " måste vara större än 0.");
        return value;
    }

    function nonNegative(value, label) {
        if (value < 0) throw new Error(label + " får inte vara negativt.");
        return value;
    }

    function setMeasurementUnits(doc, unitIndex) {
        var option = UNIT_OPTIONS[unitIndex] || UNIT_OPTIONS[0];
        var measurementUnit = option.measurementUnit;

        try {
            doc.viewPreferences.horizontalMeasurementUnits = measurementUnit;
            doc.viewPreferences.verticalMeasurementUnits = measurementUnit;
            doc.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
        } catch (_) {}
    }

    function setField(field, value) {
        field.text = formatNumber(value);
    }

    function setMeasureField(field, valueMM) {
        if (field.emetricThreeDecimalDisplay) {
            field.text = formatMeasureValue(valueMM, currentUnitIndex);
        } else {
            field.text = field.vtiEditableMeasure
                ? formatEditableMeasureValue(valueMM, currentUnitIndex)
                : formatMeasureValue(valueMM, currentUnitIndex);
        }

        try {
            if (field.unitLabel) {
                field.unitLabel.text = "";
            }
        } catch (_) {}
    }

    function normalizeEditableMeasureField(field, fallbackValue) {
        try {
            var valueInCurrentUnit =
                parseMeasureInput(
                    field.text,
                    currentUnitIndex,
                    fallbackValue
                );

            var valueMM =
                unitToMM(valueInCurrentUnit, currentUnitIndex);

            field.text = field.emetricThreeDecimalDisplay
                ? formatMeasureValue(valueMM, currentUnitIndex)
                : formatEditableMeasureValue(
                    valueMM,
                    currentUnitIndex
                );
        } catch (_) {}
    }

    function normalizeArithmeticNumberField(field, fallbackValue) {
        try {
            var result =
                evaluateArithmeticExpression(field.text);
            field.text = formatInputNumber(result);
            return result;
        } catch (_) {
            field.text = formatInputNumber(fallbackValue);
            return fallbackValue;
        }
    }

    function validObject(obj) {
        try { return obj && obj.isValid; } catch (_) { return false; }
    }

    // ---------- Exact workbook model ----------

    function calculate(v) {
        positive(v.metrics, "Metrics");
        positive(v.metricsRatio, "Metrics/Line, första värdet");
        positive(v.lineRatio, "Metrics/Line, andra värdet");
        positive(v.verticalGroup, "Vertical Grid – Group");
        positive(v.horizontalGroup, "Horizontal Grid – Group");
        positive(v.gridGroupHorizontal, "Grid Modules – Columns");
        positive(v.gridGroupVertical, "Grid Modules – Rows");
        positive(v.gridRatioHorizontal, "Grid Modules – Module Ratio, första värdet");
        positive(v.gridRatioVertical, "Grid Modules – Module Ratio, andra värdet");
        nonNegative(v.marginTopFactor, "Top");
        nonNegative(v.marginBottomFactor, "Bottom");
        nonNegative(v.marginLeftFactor, "Left");
        nonNegative(v.marginRightFactor, "Right");

        var pageWidthOverride =
            v.pageWidthOverride !== null &&
            v.pageWidthOverride !== undefined
                ? positive(v.pageWidthOverride, "Page Width")
                : null;
        var pageHeightOverride =
            v.pageHeightOverride !== null &&
            v.pageHeightOverride !== undefined
                ? positive(v.pageHeightOverride, "Page Height")
                : null;

        // GRID MODULES
        // Rows may either follow the module ratio or be set explicitly.
        var gridGroupVertical =
            v.gridRowsOverride !== null &&
            v.gridRowsOverride !== undefined
                ? v.gridRowsOverride
                : v.gridGroupHorizontal /
                    v.gridRatioHorizontal *
                    v.gridRatioVertical;

        positive(gridGroupVertical, "Grid Modules – Rows");

        // ANAMORPHIC FORMAT MODEL
        // In normal mode, Emetric is type-led: Metrics and Leading determine
        // the grid and the page format. In Anamorphic Format, an edited page
        // dimension solves back to the corresponding line value, but it uses
        // the same format expansion as normal mode. This preserves the
        // current page grid-step structure, including the active margins,
        // instead of snapping the page back to the bare module grid.
        var metrics = v.metrics;
        var verticalLine =
            v.lineSpaceOverride !== null &&
            v.lineSpaceOverride !== undefined
                ? v.lineSpaceOverride
                : metrics / v.metricsRatio * v.lineRatio;

        var horizontalStepCount =
            v.gridGroupHorizontal *
            v.horizontalGroup +
            v.marginLeftFactor -
            1 +
            v.marginRightFactor -
            1;

        var verticalStepCount =
            gridGroupVertical *
            v.verticalGroup +
            v.marginTopFactor -
            1 +
            v.marginBottomFactor -
            1;

        positive(horizontalStepCount, "Horizontal page grid steps");
        positive(verticalStepCount, "Vertical page grid steps");

        if (pageHeightOverride !== null) {
            verticalLine =
                pageHeightOverride /
                verticalStepCount;

            // Type size follows Row Leading through the existing
            // Metrics/Leading ratio.
            metrics =
                verticalLine *
                v.metricsRatio /
                v.lineRatio;
        }

        positive(metrics, "Metrics");
        positive(verticalLine, "Leading");

        var horizontalLine = verticalLine;

        if (pageWidthOverride !== null) {
            horizontalLine =
                pageWidthOverride /
                horizontalStepCount;
        }

        positive(horizontalLine, "Horizontal Grid – Line");

        var verticalGridline =
            verticalLine *
            v.verticalGroup;
        var horizontalGridline =
            horizontalLine *
            v.horizontalGroup;

        // TYPE SIZE
        var typeRatios = v.typeRatios || DEFAULT_TYPE_RATIOS;
        var ascender = metrics * typeRatios.ascender;
        var uppercase = metrics * typeRatios.capHeight;
        var lowercase = metrics * typeRatios.xHeight;
        var descender = metrics * typeRatios.descender;
        var lineSpace = verticalLine;

        function offsetSourceValue(sourceIndex) {
            var value = lowercase;

            if (sourceIndex === 0) {
                value = metrics;
            } else if (sourceIndex === 1) {
                value = ascender;
            } else if (sourceIndex === 2) {
                value = uppercase;
            } else if (sourceIndex === 3) {
                value = lowercase;
            }

            return Math.abs(value);
        }

        var offsetGridVertical =
            offsetSourceValue(v.rowOffsetSourceIndex) / 2;
        var offsetGridHorizontal =
            offsetSourceValue(v.columnOffsetSourceIndex) / 2;

        // GRID MARGIN
        // Horizontal values follow Column Leading; vertical values follow Row
        // Leading. In normal mode these are identical. In Anamorphic Format
        // they may diverge while the grid-step structure is preserved.
        var gridMarginHorizontal =
            horizontalLine - offsetGridHorizontal;
        var gridMarginVertical =
            verticalLine - offsetGridVertical;
        var gridGutterHorizontal = gridMarginHorizontal * 2;
        var gridGutterVertical = gridMarginVertical * 2;

        var gridWidth =
            horizontalGridline *
            v.gridGroupHorizontal;
        var gridHeight =
            verticalGridline *
            gridGroupVertical;

        // MARGIN
        var marginTop =
            verticalLine * v.marginTopFactor -
            offsetGridVertical;
        var marginBottom =
            verticalLine * v.marginBottomFactor -
            offsetGridVertical;
        var marginLeft =
            horizontalLine * v.marginLeftFactor -
            offsetGridHorizontal;
        var marginRight =
            horizontalLine * v.marginRightFactor -
            offsetGridHorizontal;

        // FORMAT
        // A directly edited dimension is the format boundary itself, exactly
        // as in Anamorphic_Format. Dimensions that are not fixed continue to
        // use the original Emetric expansion formula.
        var pageWidth =
            pageWidthOverride !== null
                ? pageWidthOverride
                : gridWidth +
                    (v.marginLeftFactor * horizontalLine) -
                    horizontalLine +
                    (v.marginRightFactor * horizontalLine) -
                    horizontalLine;

        var pageHeight =
            pageHeightOverride !== null
                ? pageHeightOverride
                : gridHeight +
                    (v.marginTopFactor * verticalLine) -
                    verticalLine +
                    (v.marginBottomFactor * verticalLine) -
                    verticalLine;

        var spread = pageWidth * 2;
        var formatRatioHorizontal = pageWidth / pageWidth;
        var formatRatioVertical = pageHeight / pageWidth;

        // TYPE AREA
        var typeAreaWidth = pageWidth - (marginLeft + marginRight);
        var typeAreaHeight = pageHeight - (marginTop + marginBottom);

        // INTERSECTION
        var allHorizontalGutters =
            Math.max(0, v.gridGroupHorizontal - 1) *
            gridGutterHorizontal;
        var allVerticalGutters =
            Math.max(0, gridGroupVertical - 1) *
            gridGutterVertical;

        var intersectionWidth =
            (pageWidth - marginLeft - marginRight - allHorizontalGutters) /
            v.gridGroupHorizontal;

        var intersectionHeight =
            (pageHeight - marginTop - marginBottom - allVerticalGutters) /
            gridGroupVertical;

        return {
            metrics: metrics,
            ascender: ascender,
            uppercase: uppercase,
            lowercase: lowercase,
            descender: descender,
            lineSpace: lineSpace,

            verticalLine: verticalLine,
            verticalGridline: verticalGridline,
            offsetGridVertical: offsetGridVertical,

            horizontalLine: horizontalLine,
            horizontalGridline: horizontalGridline,
            offsetGridHorizontal: offsetGridHorizontal,

            gridMarginHorizontal: gridMarginHorizontal,
            gridMarginVertical: gridMarginVertical,
            gridGutterHorizontal: gridGutterHorizontal,
            gridGutterVertical: gridGutterVertical,

            gridGroupHorizontal: v.gridGroupHorizontal,
            gridGroupVertical: gridGroupVertical,
            gridWidth: gridWidth,
            gridHeight: gridHeight,

            marginTop: marginTop,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
            marginRight: marginRight,

            typeAreaWidth: typeAreaWidth,
            typeAreaHeight: typeAreaHeight,
            intersectionWidth: intersectionWidth,
            intersectionHeight: intersectionHeight,

            pageWidth: pageWidth,
            pageHeight: pageHeight,
            spread: spread,
            formatRatioHorizontal: formatRatioHorizontal,
            formatRatioVertical: formatRatioVertical
        };
    }

    // ---------- ScriptUI helpers ----------

    var UI_LABEL_WIDTH = 132;
    var UI_FIELD_WIDTH = 76;
    var UI_UNIT_WIDTH = 6;
    var UI_OPERATOR_WIDTH = 12;
    var UI_LABEL_FIELD_GAP = 4;
    // Width accommodates the longest row. Units are embedded in the
    // field values, so only a minimal trailing alignment spacer is needed.
    var UI_PANEL_HORIZONTAL_PADDING = 24;
    var UI_ROW_SPACING_TOTAL = 12;

    // Minimum shared width required by the longest row:
    // label + two fields + operator + minimal spacer + panel padding.
    var UI_COLUMN_WIDTH =
        UI_LABEL_WIDTH +
        (UI_FIELD_WIDTH * 2) +
        UI_OPERATOR_WIDTH +
        UI_UNIT_WIDTH +
        UI_ROW_SPACING_TOTAL +
        UI_PANEL_HORIZONTAL_PADDING;

    function fieldLabelText(label) {
        var text = String(label || "");
        return /:$/.test(text) ? text : text + ":";
    }

    function styleFieldLabel(labelControl, requestedWidth) {
        labelControl.preferredSize.width = requestedWidth || UI_LABEL_WIDTH;
        labelControl.minimumSize.width = requestedWidth || UI_LABEL_WIDTH;
        try { labelControl.justify = "right"; } catch (_) {}
        try { labelControl.alignment = ["right", "center"]; } catch (_) {}
    }

    function styleEditField(field) {
        field.preferredSize.width = UI_FIELD_WIDTH;
        field.minimumSize.width = UI_FIELD_WIDTH;
        field.maximumSize.width = UI_FIELD_WIDTH;
    }

    function prepareFieldRow(group) {
        group.orientation = "row";
        group.alignChildren = ["left", "center"];
        group.spacing = UI_LABEL_FIELD_GAP;
        group.alignment = ["left", "center"];
        group.margins = [0, 0, 0, 0];
    }

    function addFieldLabel(group, label, width) {
        var labelWidth = width || UI_LABEL_WIDTH;

        // Use a fixed-width label container. This prevents ScriptUI from
        // redistributing the label position when rows have different numbers
        // of fields, and locks every first field to the same x-position.
        var labelGroup = group.add("group");
        labelGroup.orientation = "row";
        labelGroup.alignChildren = ["right", "center"];
        labelGroup.alignment = ["left", "center"];
        labelGroup.spacing = 0;
        labelGroup.margins = [0, 0, 0, 0];
        labelGroup.preferredSize.width = labelWidth;
        labelGroup.minimumSize.width = labelWidth;
        labelGroup.maximumSize.width = labelWidth;

        var control =
            labelGroup.add(
                "statictext",
                undefined,
                fieldLabelText(label)
            );
        try { control.justify = "right"; } catch (_) {}
        control.alignment = ["right", "center"];

        return control;
    }

    function addSection(parent, title) {
        // Create the panel without a title first. ScriptUI can otherwise
        // calculate and cache an undersized native title area, causing
        // longer headings to be truncated despite sufficient panel width.
        var panel = parent.add("panel", undefined, "");
        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.margins = [12, 18, 12, 12];
        panel.spacing = 5;
        panel.preferredSize.width = UI_COLUMN_WIDTH;
        panel.minimumSize.width = UI_COLUMN_WIDTH;
        panel.maximumSize.width = UI_COLUMN_WIDTH;

        try {
            panel.text = String(title || "");
        } catch (_) {}

        return panel;
    }

    function addRow(parent, label, value, editable, suffix, width) {
        var g = parent.add("group");
        prepareFieldRow(g);

        var l = addFieldLabel(g, label, width);

        var f = g.add("edittext", undefined, String(value));
        styleEditField(f);
        f.enabled = editable !== false;
        f.vtiEditableMeasure = editable !== false;

        if (editable === false) {
            try {
                f.graphics.backgroundColor =
                    f.graphics.newBrush(
                        f.graphics.BrushType.SOLID_COLOR,
                        [0.92, 0.92, 0.92, 1]
                    );
            } catch (_) {}
        }

        var s = g.add("statictext", undefined, suffix || "");
        s.preferredSize.width = UI_UNIT_WIDTH;
        s.minimumSize.width = UI_UNIT_WIDTH;
        s.maximumSize.width = UI_UNIT_WIDTH;
        f.unitLabel = s;

        return f;
    }

    function addCenteredOperator(group, text) {
        var operatorControl =
            group.add(
                "statictext",
                undefined,
                String(text)
            );

        operatorControl.preferredSize.width =
            UI_OPERATOR_WIDTH;
        operatorControl.minimumSize.width =
            UI_OPERATOR_WIDTH;
        operatorControl.maximumSize.width =
            UI_OPERATOR_WIDTH;

        try {
            operatorControl.justify = "center";
        } catch (_) {}

        try {
            operatorControl.alignment =
                ["center", "center"];
        } catch (_) {}

        return operatorControl;
    }

    function addRatioRow(parent, label, a, b, editable, width) {
        var g = parent.add("group");
        prepareFieldRow(g);

        var l = addFieldLabel(g, label, width);

        var fa = g.add("edittext", undefined, String(a));
        styleEditField(fa);
        fa.enabled = editable !== false;

        addCenteredOperator(g, ":");

        var fb = g.add("edittext", undefined, String(b));
        styleEditField(fb);
        fb.enabled = editable !== false;

        var ratioUnitSpacer = g.add("statictext", undefined, "");
        ratioUnitSpacer.preferredSize.width = UI_UNIT_WIDTH;
        ratioUnitSpacer.minimumSize.width = UI_UNIT_WIDTH;
        ratioUnitSpacer.maximumSize.width = UI_UNIT_WIDTH;

        return { a: fa, b: fb };
    }

    function addMarginRow(parent, label, factor, width) {
        var g = parent.add("group");
        prepareFieldRow(g);

        var l = addFieldLabel(g, label, width);

        var factorField = g.add("edittext", undefined, String(factor));
        styleEditField(factorField);

        addCenteredOperator(g, "=");

        var resultField = g.add("edittext", undefined, "");
        styleEditField(resultField);
        resultField.enabled = false;

        var unitLabel = g.add("statictext", undefined, "mm");
        unitLabel.preferredSize.width = UI_UNIT_WIDTH;
        unitLabel.minimumSize.width = UI_UNIT_WIDTH;
        unitLabel.maximumSize.width = UI_UNIT_WIDTH;
        resultField.unitLabel = unitLabel;

        return {
            factor: factorField,
            result: resultField,
            label: l
        };
    }

    function addDropdownRow(parent, label, items, selectedIndex, width) {
        var g = parent.add("group");
        prepareFieldRow(g);

        var l = addFieldLabel(g, label, width);

        var d = g.add("dropdownlist", undefined, items);
        d.preferredSize.width = UI_FIELD_WIDTH * 2 + 8;
        d.selection = selectedIndex || 0;

        var dropdownUnitSpacer = g.add("statictext", undefined, "");
        dropdownUnitSpacer.preferredSize.width = UI_UNIT_WIDTH;
        dropdownUnitSpacer.minimumSize.width = UI_UNIT_WIDTH;
        dropdownUnitSpacer.maximumSize.width = UI_UNIT_WIDTH;

        return d;
    }


    // ---------- InDesign document construction ----------

    function ensureLayer(doc, name, color) {
        var layer = doc.layers.itemByName(name);
        if (!validObject(layer)) {
            layer = doc.layers.add({ name: name });
        }
        try { layer.layerColor = color; } catch (_) {}
        return layer;
    }

    function addGuide(page, layer, orientation, location, color, name) {
        try {
            var guide = page.guides.add(layer, {
                orientation: orientation,
                location: location
            });
            try { guide.guideColor = color; } catch (_) {}
            try { guide.label = name || ""; } catch (_) {}
            return guide;
        } catch (_) {
            return null;
        }
    }

    function isLeftHandPage(page) {
        try {
            return page.side === PageSideOptions.LEFT_HAND;
        } catch (_) {
            try {
                return String(page.side).toLowerCase().indexOf("left") >= 0;
            } catch (__) {
                return false;
            }
        }
    }

    function mirroredX(page, x, mirrorHorizontal) {
        if (!mirrorHorizontal) return x;

        try {
            return page.bounds[3] - page.bounds[1] - x;
        } catch (_) {
            return x;
        }
    }

    function addBoundaryGuides(page, layer, r, guideColor, createColumns, createRows, mirrorHorizontal) {
        // Major 9 × 9 grid. The spreadsheet places the grid inside the
        // page with asymmetric exceeding margins.
        var startX =
            (r.pageWidth - r.gridWidth) / 2;
        // Exact vertical start according to the workbook's top expansion.
        var startY =
            (r.marginTop / r.verticalLine > 0)
            ? (r.pageHeight - r.gridHeight -
               ((r.pageHeight - r.gridHeight) -
                ((r.pageHeight - r.gridHeight) / 4))) // fallback, replaced below
            : 0;

        // Exact exceeding additions:
        startX = (r.pageWidth - r.gridWidth) / 2;
        startY = r.pageHeight - r.gridHeight -
                 (r.marginBottom + r.offsetGridVertical - r.verticalLine);

        // More direct and stable values derived from the workbook:
        // left excess = pageWidth - gridWidth split by the two equal side factors.
        startX = (r.pageWidth - r.gridWidth) / 2;
        // top excess is page height contribution from top factor.
        startY = r.marginTop + r.offsetGridVertical - r.verticalLine
                 + r.offsetGridVertical;

        var i, x, y;

        if (createColumns) {
            for (i = 0; i <= Math.round(r.gridGroupHorizontal); i++) {
                x = startX + i * r.horizontalGridline;
                x = mirroredX(page, x, mirrorHorizontal);
                addGuide(page, layer, HorizontalOrVertical.VERTICAL, x, guideColor,
                    "VTI Major Vertical " + i);
            }
        }

        if (createRows) {
            for (i = 0; i <= Math.round(r.gridGroupVertical); i++) {
                y = startY + i * r.verticalGridline;
                addGuide(page, layer, HorizontalOrVertical.HORIZONTAL, y, guideColor,
                    "VTI Major Horizontal " + i);
            }
        }
    }

    function addIntersectionGuides(page, layer, r, guideColor, createColumns, createRows, mirrorHorizontal) {
        var hCount = Math.round(r.gridGroupHorizontal);
        var vCount = Math.round(r.gridGroupVertical);
        var x = r.marginLeft;
        var y = r.marginTop + r.offsetGridVertical;
        var i;

        if (createColumns) {
            addGuide(
                page,
                layer,
                HorizontalOrVertical.VERTICAL,
                mirroredX(page, x, mirrorHorizontal),
                guideColor,
                mirrorHorizontal ? "VTI Type Area Right" : "VTI Type Area Left"
            );

            for (i = 0; i < hCount; i++) {
                x += r.intersectionWidth;
                addGuide(
                    page,
                    layer,
                    HorizontalOrVertical.VERTICAL,
                    mirroredX(page, x, mirrorHorizontal),
                    guideColor,
                    "VTI Column " + (i + 1) + " End"
                );
                if (i < hCount - 1) {
                    x += r.gridGutterHorizontal;
                    addGuide(
                        page,
                        layer,
                        HorizontalOrVertical.VERTICAL,
                        mirroredX(page, x, mirrorHorizontal),
                        guideColor,
                        "VTI Column " + (i + 2) + " Start"
                    );
                }
            }
        }

        if (createRows) {
            addGuide(page, layer, HorizontalOrVertical.HORIZONTAL, y, guideColor,
                "VTI Type Area Top");

            for (i = 0; i < vCount; i++) {
                y += r.intersectionHeight;
                addGuide(page, layer, HorizontalOrVertical.HORIZONTAL, y, guideColor,
                    "VTI Row " + (i + 1) + " End");
                if (i < vCount - 1) {
                    y += r.gridGutterVertical;
                    addGuide(page, layer, HorizontalOrVertical.HORIZONTAL, y, guideColor,
                        "VTI Row " + (i + 2) + " Start");
                }
            }
        }
    }

    function applyPageMargins(
        page,
        r,
        useFacingPages,
        createColumnGuides
    ) {
        try {
            var mp = page.marginPreferences;

            mp.top = r.marginTop;
            mp.bottom = r.marginBottom;

            // Keep the physical Left and Right margins identical on both pages.
            // Facing Pages changes the labels only; it does not swap the values.
            mp.left = r.marginLeft;
            mp.right = r.marginRight;

            if (createColumnGuides) {
                mp.columnCount =
                    Math.max(1, Math.round(r.gridGroupHorizontal));
                mp.columnGutter = r.gridGutterHorizontal;
            } else {
                // One column means no internal native column guides.
                mp.columnCount = 1;
                mp.columnGutter = 0;
            }
        } catch (_) {}
    }

    function replaceTabStops(target, positionsMM) {
        try {
            var existing = target.tabStops.everyItem().getElements();
            for (var i = existing.length - 1; i >= 0; i--) {
                try { existing[i].remove(); } catch (_) {}
            }
        } catch (_) {}

        for (var j = 0; j < positionsMM.length; j++) {
            try {
                target.tabStops.add({
                    alignment: TabStopAlignment.LEFT_ALIGN,
                    position: scriptNumber(positionsMM[j]) + " mm"
                });
            } catch (_) {
                try {
                    target.tabStops.add({
                        alignment: TabStopAlignment.LEFT_ALIGN,
                        position: positionsMM[j]
                    });
                } catch (__) {}
            }
        }
    }

    function createParagraphStyles(doc, r, exportUnitIndex) {
        var info =
            doc.paragraphStyles.itemByName("Emetric Information");

        if (!validObject(info)) {
            info = doc.paragraphStyles.add({
                name: "Emetric Information"
            });
        }

        try {
            // Scale Courier New so its x-height equals the x-Height measure.
            var courierEmSizeMM =
                r.lowercase / COURIER_NEW_X_HEIGHT_RATIO;

            info.pointSize =
                exportPointValue(courierEmSizeMM, exportUnitIndex);
            info.leading =
                exportPointValue(r.lineSpace, exportUnitIndex);
            info.alignToBaseline = false;
            info.justification = Justification.LEFT_ALIGN;

            // Paragraph indent follows the Column Grid offset.
            info.leftIndent =
                scriptNumber(r.offsetGridHorizontal) + " mm";
            info.firstLineIndent = "0 mm";

            // One left-aligned tab stop at:
            // 2 × Column Module Size + Column Grid offset.
            var infoTabPosition =
                (2 * r.horizontalGridline) + r.offsetGridHorizontal;

            replaceTabStops(info, [infoTabPosition]);

            try {
                info.paragraphDirection =
                    ParagraphDirectionOptions.LEFT_TO_RIGHT_DIRECTION;
            } catch (_) {}

            try {
                info.digitsType = DigitsTypeOptions.ARABIC_DIGITS;
            } catch (_) {}

            try {
                info.appliedFont = "Courier New";
                info.fontStyle = "Regular";
            } catch (_) {
                try {
                    var courier =
                        app.fonts.itemByName("Courier New\tRegular");

                    if (courier && courier.isValid) {
                        info.appliedFont = courier;
                    }
                } catch (__) {}
            }
        } catch (_) {}

        return { info: info };
    }

    function setupDocumentAndBaselineGrids(
        doc,
        r,
        documentGridColor,
        baselineGridColor,
        gridsInBack
    ) {
        var gp = doc.gridPreferences;

        // DOCUMENT GRID
        // InDesign's Horizontal Gridline Division follows Column Leading.
        // The perpendicular grid division continues to follow Row Leading.
        // This allows anamorphic formats to use different horizontal and
        // vertical grid intervals while preserving the selected grid groups.
        try {
            gp.horizontalGridlineDivision = r.horizontalLine;
            gp.verticalGridlineDivision = r.lineSpace;
            gp.horizontalGridSubdivision = 1;
            gp.verticalGridSubdivision = 1;
            gp.documentGridShown = true;
            gp.gridColor = documentGridColor;
            gp.gridsInBack = Boolean(gridsInBack);
        } catch (_) {}

        // The document grid follows the document zero point.
        // Move its vertical origin one Offset Grid above the page edge.
        try {
            doc.zeroPoint = [0, -r.offsetGridVertical];
        } catch (_) {
            try {
                doc.zeroPoint = ["0 mm", (-r.offsetGridVertical) + " mm"];
            } catch (__) {}
        }

        // BASELINE GRID
        // The first baseline follows the selected Row Offset Source.
        // Offset is half the selected source measure, so the baseline start
        // equals two times the calculated Row Offset.
        try {
            gp.baselineDivision = r.lineSpace;
            gp.baselineStart = r.offsetGridVertical * 2;
            gp.baselineGridShown = true;
            gp.baselineColor = baselineGridColor;
        } catch (_) {}

        try {
            gp.baselineGridRelativeOption =
                BaselineGridRelativeOption.TOP_OF_MARGIN;
        } catch (_) {
            try {
                gp.baselineGridRelativeOption =
                    BaselineGridRelativeOption.TOP_OF_MARGIN_OF_BASELINE_GRID_RELATIVE_OPTION;
            } catch (__) {}
        }
    }

    function createPlaceholderTextFrame(
        doc,
        page,
        layer,
        r,
        options
    ) {
        var savedZeroPoint = null;

        try {
            // The document zero point is shifted for the document grid.
            // Restore the page origin temporarily so the frame starts
            // exactly at Top Margin rather than being displaced upward.
            try {
                savedZeroPoint = doc.zeroPoint;
                doc.zeroPoint = [0, 0];
            } catch (_) {}

            var frame = page.textFrames.add(layer, {
                geometricBounds: [
                    r.marginTop,
                    r.marginLeft,
                    r.pageHeight - r.marginBottom,
                    r.pageWidth - r.marginRight
                ]
            });

            try {
                if (savedZeroPoint) {
                    doc.zeroPoint = savedZeroPoint;
                }
            } catch (_) {}

            try { frame.name = "Placeholder Text"; } catch (_) {}
            try { frame.label = "Placeholder Text"; } catch (_) {}

            try {
                frame.contents = TextFrameContents.PLACEHOLDER_TEXT;
            } catch (_) {
                try {
                    frame.parentStory.contents =
                        TextFrameContents.PLACEHOLDER_TEXT;
                } catch (__) {}
            }

            // The first baseline follows the selected Row Offset Source.
            try {
                var tfp = frame.textFramePreferences;
                tfp.firstBaselineOffset = FirstBaseline.FIXED_HEIGHT;
                tfp.minimumFirstBaselineOffset =
                    exportPointValue(
                        r.offsetGridVertical * 2,
                        options.unitIndex
                    );
            } catch (_) {}

            return frame;
        } catch (_) {
            try {
                if (savedZeroPoint) {
                    doc.zeroPoint = savedZeroPoint;
                }
            } catch (__) {}

            return null;
        }
    }

    function createInformationFrame(doc, page, layer, style, v, r, options) {
        function selectedMeasure(valueMM) {
            return formatMeasureValue(valueMM, options.unitIndex);
        }

        var usesSelectedFont =
            Boolean(
                options.usesSelectedFont &&
                options.selectedFontRecord &&
                options.selectedFontRecord.family
            );

        var metricSourceLabel = options.metricSourceName ||
            (usesSelectedFont ? "Selected Font" : "Emetric Dozenal");

        var fontSourceDetails = "";

        if (options.metricSourceKey === "custom") {
            fontSourceDetails =
                "Ratios:\t" +
                options.customRatioText + "\r";
        }

        if (usesSelectedFont) {
            fontSourceDetails =
                "Font Family:\t" +
                    options.selectedFontRecord.family + "\r" +
                "Font Style:\t" +
                    (
                        options.selectedFontRecord.style ||
                        "—"
                    ) + "\r";
        }

        var text =
            "Emetric · v" + VERSION + "\r" +
            "\r" +

            "Measurement and Source\r" +
            "Unit:\t" +
                UNIT_OPTIONS[options.unitIndex].menuLabel + "\r" +
            "Metric Source:\t" + metricSourceLabel + "\r" +
            "Anamorphic Format:\t" +
                (options.anamorphicFormat ? "On" : "Off") + "\r" +
            fontSourceDetails +
            "\r" +

            "Type Size\r" +
            "Metrics:\t" + selectedMeasure(r.metrics) + "\r" +
            "Ascender:\t" + selectedMeasure(r.ascender) + "\r" +
            "Cap Height:\t" + selectedMeasure(r.uppercase) + "\r" +
            "x-Height:\t" + selectedMeasure(r.lowercase) + "\r" +
            "Descender:\t" + selectedMeasure(r.descender) + "\r\r" +

            "Leading\r" +
            "Leading:\t" + selectedMeasure(r.lineSpace) + "\r" +
            "Metrics : Leading:\t" +
                formatNumber(v.metricsRatio) + ":" +
                formatNumber(v.lineRatio) + "\r" +
            "Document Grid:\t" +
                selectedMeasure(r.horizontalLine) + " × " +
                selectedMeasure(r.lineSpace) + "\r" +
            "Horizontal Gridline:\t" +
                selectedMeasure(r.horizontalLine) +
                " (Column Leading)\r" +
            "Vertical Gridline:\t" +
                selectedMeasure(r.lineSpace) +
                " (Row Leading)\r" +
            "Document Grid Start:\t−" +
                selectedMeasure(r.offsetGridVertical) + "\r" +
            "Baseline Start:\t" +
                selectedMeasure(r.offsetGridVertical * 2) +
                " from Top Margin\r\r" +

            "Row Grid\r" +
            "Leading:\t" + selectedMeasure(r.verticalLine) + "\r" +
            "Group:\t" + formatNumber(v.verticalGroup) + "\r" +
            "Module Size:\t" +
                selectedMeasure(r.verticalGridline) + "\r" +
            "Offset:\t" +
                selectedMeasure(r.offsetGridVertical) + "\r" +
            "Offset Source:\t" +
                options.rowOffsetSourceName + "\r" +
            "Row Margin:\t" +
                selectedMeasure(r.gridMarginVertical) + "\r" +
            "Row Gutter:\t" +
                selectedMeasure(r.gridGutterVertical) + "\r\r" +

            "Column Grid\r" +
            "Leading:\t" + selectedMeasure(r.horizontalLine) + "\r" +
            "Group:\t" + formatNumber(v.horizontalGroup) + "\r" +
            "Module Size:\t" +
                selectedMeasure(r.horizontalGridline) + "\r" +
            "Offset:\t" +
                selectedMeasure(r.offsetGridHorizontal) + "\r" +
            "Offset Source:\t" +
                options.columnOffsetSourceName + "\r" +
            "Column Margin:\t" +
                selectedMeasure(r.gridMarginHorizontal) + "\r" +
            "Column Gutter:\t" +
                selectedMeasure(r.gridGutterHorizontal) + "\r\r" +

            "Grid Modules\r" +
            "Columns:\t" +
                formatNumber(r.gridGroupHorizontal) + "\r" +
            "Rows:\t" +
                formatNumber(r.gridGroupVertical) + "\r" +
            "Module Ratio:\t" +
                formatNumber(v.gridRatioHorizontal) + ":" +
                formatNumber(v.gridRatioVertical) + "\r" +
            "Grid Width:\t" + selectedMeasure(r.gridWidth) + "\r" +
            "Grid Height:\t" + selectedMeasure(r.gridHeight) + "\r" +
            "Module Area Width:\t" +
                selectedMeasure(r.intersectionWidth) + "\r" +
            "Module Area Height:\t" +
                selectedMeasure(r.intersectionHeight) + "\r\r" +

            "Page\r" +
            "Width:\t" + selectedMeasure(r.pageWidth) + "\r" +
            "Height:\t" + selectedMeasure(r.pageHeight) + "\r" +
            "Spread:\t" + selectedMeasure(r.spread) + "\r" +
            "Format Ratio:\t" +
                formatNumber(r.formatRatioHorizontal) + ":" +
                formatNumber(r.formatRatioVertical) + "\r" +
            "Top Margin:\t" +
                formatNumber(v.marginTopFactor) + " = " +
                selectedMeasure(r.marginTop) + "\r" +
            "Bottom Margin:\t" +
                formatNumber(v.marginBottomFactor) + " = " +
                selectedMeasure(r.marginBottom) + "\r" +
            (options.facingPages
                ? "Inside Margin:\t"
                : "Left Margin:\t") +
                formatNumber(v.marginLeftFactor) + " = " +
                selectedMeasure(r.marginLeft) + "\r" +
            (options.facingPages
                ? "Outside Margin:\t"
                : "Right Margin:\t") +
                formatNumber(v.marginRightFactor) + " = " +
                selectedMeasure(r.marginRight) + "\r" +
            "Type Area Width:\t" +
                selectedMeasure(r.typeAreaWidth) + "\r" +
            "Type Area Height:\t" +
                selectedMeasure(r.typeAreaHeight) + "\r\r";



        try {
            // The document zero point is shifted for the document grid.
            // Temporarily restore the page origin so the frame starts exactly
            // at the end of Top Margin, then restore the grid zero point.
            var savedZeroPoint = null;
            try {
                savedZeroPoint = doc.zeroPoint;
                doc.zeroPoint = [0, 0];
            } catch (_) {}

            var frame = page.textFrames.add(layer, {
                geometricBounds: [
                    r.marginTop,
                    r.marginLeft,
                    r.pageHeight - r.marginBottom,
                    r.pageWidth - r.marginRight
                ],
                contents: text
            });

            try {
                if (savedZeroPoint) doc.zeroPoint = savedZeroPoint;
            } catch (_) {}

            frame.parentStory.paragraphs.everyItem().appliedParagraphStyle = style;

            try {
                var tfp = frame.textFramePreferences;

                // Text Frame Options > Baseline Options:
                // First baseline follows the selected Row Offset Source.
                tfp.firstBaselineOffset = FirstBaseline.FIXED_HEIGHT;
                tfp.minimumFirstBaselineOffset =
                    r.offsetGridVertical * 2;

                // Restore all inset spacing to zero.
                tfp.insetSpacing = [0, 0, 0, 0];
            } catch (_) {}

            try {
                frame.parentStory.storyDirection =
                    StoryDirectionOptions.LEFT_TO_RIGHT_DIRECTION;
            } catch (_) {}

            try {
                var paragraphs = frame.parentStory.paragraphs.everyItem();
                paragraphs.paragraphDirection =
                    ParagraphDirectionOptions.LEFT_TO_RIGHT_DIRECTION;
                paragraphs.digitsType = DigitsTypeOptions.ARABIC_DIGITS;
                paragraphs.justification = Justification.LEFT_ALIGN;
                paragraphs.leftIndent =
                    scriptNumber(r.offsetGridHorizontal) + " mm";
                paragraphs.firstLineIndent = "0 mm";

                try {
                    var infoParagraphs =
                        frame.parentStory.paragraphs.everyItem().getElements();
                    var paragraphTabPosition =
                        (2 * r.horizontalGridline) +
                        r.offsetGridHorizontal;

                    for (var pi = 0; pi < infoParagraphs.length; pi++) {
                        replaceTabStops(
                            infoParagraphs[pi],
                            [paragraphTabPosition]
                        );
                    }
                } catch (_) {}
            } catch (_) {}

            frame.label = "VTI Information";
            return frame;
        } catch (_) {
            return null;
        }
    }

    function configureAMasterPageCount(doc, facingPages) {
        try {
            if (doc.masterSpreads.length === 0) return;

            var master = doc.masterSpreads[0];
            var targetCount = facingPages ? 2 : 1;

            // Remove excess master pages from the end.
            while (master.pages.length > targetCount) {
                try {
                    master.pages[master.pages.length - 1].remove();
                } catch (_) {
                    break;
                }
            }

            // Add missing master pages at the end.
            while (master.pages.length < targetCount) {
                try {
                    master.pages.add(LocationOptions.AT_END);
                } catch (_) {
                    try {
                        master.pages.add();
                    } catch (__) {
                        break;
                    }
                }
            }
        } catch (_) {}
    }

    function applyAMasterOption(doc, useAMaster) {
        try {
            var pages = doc.pages.everyItem().getElements();
            var master = null;

            if (useAMaster && doc.masterSpreads.length > 0) {
                master = doc.masterSpreads[0];
            }

            for (var i = 0; i < pages.length; i++) {
                try {
                    pages[i].appliedMaster =
                        master && master.isValid
                        ? master
                        : NothingEnum.NOTHING;
                } catch (_) {}
            }
        } catch (_) {}
    }

    function setMenuActionChecked(actionName, shouldBeChecked) {
        try {
            var action = app.menuActions.itemByName(actionName);
            if (!action || !action.isValid || !action.enabled) return;

            var isChecked = false;
            try {
                isChecked = Boolean(action.checked);
            } catch (_) {}

            if (isChecked !== Boolean(shouldBeChecked)) {
                action.invoke();
            }
        } catch (_) {}
    }

    function applySnapOptions(options) {
        setMenuActionChecked(
            "$ID/Snap to Document Grid",
            options.snapToGrid
        );
        setMenuActionChecked(
            "$ID/Snap to Guides",
            options.snapToGuides
        );
    }

    function applyPageBoundSettings(
        targetPages,
        majorLayer,
        intersectionLayer,
        r,
        options
    ) {
        for (var i = 0; i < targetPages.length; i++) {
            var targetPage = targetPages[i];
            var mirrorHorizontal =
                Boolean(options.facingPages) &&
                isLeftHandPage(targetPage);

            applyPageMargins(
                targetPage,
                r,
                options.facingPages,
                options.createColumnGuides
            );

            if (options.createMajorGridVertical) {
                addBoundaryGuides(
                    targetPage,
                    majorLayer,
                    r,
                    options.guideColor,
                    true,
                    false,
                    mirrorHorizontal
                );
            }

            if (options.createMajorGridHorizontal) {
                addBoundaryGuides(
                    targetPage,
                    majorLayer,
                    r,
                    options.guideColor,
                    false,
                    true,
                    false
                );
            }

            if (options.createColumns) {
                addIntersectionGuides(
                    targetPage,
                    intersectionLayer,
                    r,
                    options.guideColor,
                    true,
                    false,
                    mirrorHorizontal
                );
            }

            if (options.createRows) {
                addIntersectionGuides(
                    targetPage,
                    intersectionLayer,
                    r,
                    options.guideColor,
                    false,
                    true,
                    false
                );
            }
        }
    }

    function setThemePasteboard(doc) {
        // InDesign > Preferences > Guides and Pasteboard:
        // Preview Background defaults to Match to Theme Color.
        try {
            app.generalPreferences.pasteboardColorPreference = 1;
        } catch (_) {}

        try {
            doc.pasteboardPreferences.matchPreviewBackgroundToThemeColor = true;
        } catch (_) {}
    }

    function getNamedStyle(collection, names, fallbackIndex) {
        var i;
        var style;

        for (i = 0; i < names.length; i++) {
            try {
                style = collection.itemByName(names[i]);
                if (style && style.isValid) return style;
            } catch (_) {}
        }

        try {
            if (
                fallbackIndex >= 0 &&
                fallbackIndex < collection.length
            ) {
                style = collection[fallbackIndex];
                if (style && style.isValid) return style;
            }
        } catch (_) {}

        return null;
    }

    function applySelectedFont(target, fontRecord) {
        if (!target || !fontRecord) return;

        try {
            target.appliedFont = fontRecord.font;
        } catch (_) {
            try {
                target.appliedFont = fontRecord.family;
            } catch (__) {}
        }

        try {
            target.fontStyle = fontRecord.style;
        } catch (_) {}
    }

    function applyDocumentDefaultStyles(doc, r, options) {
        var fontRecord = options.selectedFontRecord || null;
        var pointSize = exportPointValue(r.metrics, options.unitIndex);
        var leading = exportPointValue(r.lineSpace, options.unitIndex);

        // Document text defaults control the actual font and size used
        // when new text is created without an explicit style.
        try {
            var defaults = doc.textDefaults;

            applySelectedFont(defaults, fontRecord);

            try {
                defaults.pointSize = pointSize;
            } catch (_) {}

            try {
                defaults.leading = leading;
            } catch (_) {}
        } catch (_) {}

        // [Basic Paragraph] / [Grundstycke].
        // Index 0 is normally [No Paragraph Style], so use a localized
        // name first and index 1 only as fallback.
        try {
            var paragraphStyle = getNamedStyle(
                doc.paragraphStyles,
                [
                    "$ID/NormalParagraphStyle",
                    "[Basic Paragraph]",
                    "Basic Paragraph",
                    "[Grundstycke]",
                    "Grundstycke"
                ],
                1
            );

            if (paragraphStyle) {
                applySelectedFont(
                    paragraphStyle,
                    fontRecord
                );

                try {
                    paragraphStyle.pointSize = pointSize;
                } catch (_) {}

                try {
                    paragraphStyle.leading = leading;
                } catch (_) {}
            }
        } catch (_) {}

        // [Basic Text Frame] / [Grundläggande textram].
        // Object style index 0 is [None]; the basic text-frame style is
        // usually index 2, but names are preferred for localization.
        try {
            var objectStyle = getNamedStyle(
                doc.objectStyles,
                [
                    "$ID/Basic Text Frame",
                    "[Basic Text Frame]",
                    "Basic Text Frame",
                    "[Grundläggande textram]",
                    "Grundläggande textram"
                ],
                2
            );

            if (objectStyle) {
                try {
                    objectStyle.enableTextFrameGeneralOptions = true;
                } catch (_) {}

                try {
                    var tfp =
                        objectStyle.textFramePreferences;

                    tfp.firstBaselineOffset =
                        FirstBaseline.FIXED_HEIGHT;
                    tfp.minimumFirstBaselineOffset =
                        exportPointValue(
                            r.offsetGridVertical * 2,
                            options.unitIndex
                        );
                } catch (_) {}
            }
        } catch (_) {}
    }

    function createDocument(v, r, options) {
        var doc = app.documents.add();
        setThemePasteboard(doc);

        // Build the complete document in millimeters so all numeric layout
        // values are interpreted consistently, regardless of selected display unit.
        setMeasurementUnits(doc, 0);

        doc.documentPreferences.facingPages = options.facingPages;
        doc.documentPreferences.pageWidth = r.pageWidth;
        doc.documentPreferences.pageHeight = r.pageHeight;

        configureAMasterPageCount(doc, options.facingPages);

        // Margin and column guides have independent selected colors.
        try {
            doc.documentPreferences.marginGuideColor = options.marginColor;
            doc.documentPreferences.columnGuideColor = options.columnColor;
        } catch (_) {}

        try {
            doc.documentPreferences.pagesPerDocument = 1;
        } catch (_) {}

        var majorLayer = ensureLayer(doc, "Emetric – Grid Lines", UIColors.LIGHT_BLUE);
        var intersectionLayer =
            ensureLayer(doc, "Emetric – Module Areas", UIColors.LIGHT_BLUE);
        var contentLayer = ensureLayer(doc, "Emetric – Content", UIColors.BLACK);

        setupDocumentAndBaselineGrids(
            doc,
            r,
            options.documentGridColor,
            options.baselineGridColor,
            options.gridsInBack
        );
        var styles = createParagraphStyles(doc, r, options.unitIndex);
        applyDocumentDefaultStyles(doc, r, options);

        // Build the final page order before applying page-bound settings.
        // The document's original page becomes the first selected special
        // page. A clean working page is then kept at the end.
        var placeholderPage = null;
        var informationPage = null;
        var hasSpecialPages =
            Boolean(
                options.addPlaceholderText ||
                options.addInformationPage
            );

        var firstDocumentPage = null;

        try {
            firstDocumentPage = doc.pages[0];
        } catch (_) {}

        if (
            options.addPlaceholderText &&
            firstDocumentPage &&
            firstDocumentPage.isValid
        ) {
            // Placeholder Text always has priority and therefore occupies
            // page 1 whenever it is selected.
            placeholderPage =
                firstDocumentPage;
        } else if (
            options.addInformationPage &&
            firstDocumentPage &&
            firstDocumentPage.isValid
        ) {
            // With no Placeholder Text, the index occupies page 1.
            informationPage =
                firstDocumentPage;
        }

        if (
            options.addPlaceholderText &&
            options.addInformationPage
        ) {
            // Placeholder Text is page 1; Index Page becomes page 2.
            try {
                informationPage =
                    doc.pages.add(
                        LocationOptions.AT_END
                    );
            } catch (_) {}
        }

        if (hasSpecialPages) {
            // Preserve one empty, fully configured working page after the
            // special pages.
            try {
                doc.pages.add(
                    LocationOptions.AT_END
                );
            } catch (_) {}
        }

        // Apply or remove A-Parent only after every document page exists.
        applyAMasterOption(
            doc,
            options.useAMaster
        );

        var documentPages =
            doc.pages.everyItem().getElements();
        var settingsPages =
            documentPages;

        if (
            options.useAMaster &&
            doc.masterSpreads.length > 0
        ) {
            try {
                settingsPages =
                    doc.masterSpreads[0]
                        .pages
                        .everyItem()
                        .getElements();
            } catch (_) {
                settingsPages =
                    documentPages;
            }
        }

        // Without A-Parent, settings must be written directly to every
        // document page, including Placeholder Text and Index Page.
        applyPageBoundSettings(
            settingsPages,
            majorLayer,
            intersectionLayer,
            r,
            options
        );

        if (
            placeholderPage &&
            placeholderPage.isValid
        ) {
            createPlaceholderTextFrame(
                doc,
                placeholderPage,
                contentLayer,
                r,
                options
            );
        }

        if (
            informationPage &&
            informationPage.isValid
        ) {
            createInformationFrame(
                doc,
                informationPage,
                contentLayer,
                styles.info,
                v,
                r,
                options
            );
        }

        try {
            majorLayer.locked = true;
            intersectionLayer.locked = true;
            contentLayer.move(LocationOptions.AT_BEGINNING);
        } catch (_) {}

        // Apply the user's selected ruler/display unit last. This changes only
        // how values are shown in InDesign, not the already-created geometry.
        setMeasurementUnits(doc, options.unitIndex);

        // The newly created document is active here, so the menu actions
        // apply to its current view.
        applySnapOptions(options);

        return doc;
    }

    // ---------- Dialog ----------


    try {
        if (
            $.global.__EMETRIC_WINDOW__ &&
            $.global.__EMETRIC_WINDOW__.visible
        ) {
            $.global.__EMETRIC_WINDOW__.close();
        }
    } catch (_) {}

    var w = new Window("palette", SCRIPT_NAME, undefined, {
        closeButton: true,
        resizeable: false
    });
    $.global.__EMETRIC_WINDOW__ = w;

    w.orientation = "column";
    w.alignChildren = ["fill", "top"];
    w.spacing = 10;
    w.margins = 14;

    function refreshPresetIconControl(control) {
        if (!control) return;

        try {
            control.notify("onDraw");
        } catch (_) {}

        try {
            if (
                control.window &&
                control.window.update
            ) {
                control.window.update();
            }
        } catch (_) {}
    }

    function presetNormalizeColorComponent(
        value
    ) {
        var component = Number(value);

        if (!isFinite(component)) {
            return null;
        }

        // ScriptUI normally returns 0–1 values, but normalize defensively
        // in case a host/version exposes 0–255 components.
        if (component > 1) {
            component /= 255;
        }

        if (component < 0) {
            component = 0;
        }

        if (component > 1) {
            component = 1;
        }

        return component;
    }

    function presetControlBackgroundColor(
        graphics
    ) {
        try {
            var source =
                graphics.backgroundColor;

            if (
                source &&
                source.color &&
                source.color.length >= 3
            ) {
                var red =
                    presetNormalizeColorComponent(
                        source.color[0]
                    );
                var green =
                    presetNormalizeColorComponent(
                        source.color[1]
                    );
                var blue =
                    presetNormalizeColorComponent(
                        source.color[2]
                    );

                if (
                    red !== null &&
                    green !== null &&
                    blue !== null
                ) {
                    return [
                        red,
                        green,
                        blue,
                        1
                    ];
                }
            }
        } catch (_) {}

        return null;
    }

    function presetThemeKey() {
        try {
            var preference =
                app.generalPreferences
                    .uiBrightnessPreference;

            try {
                if (
                    preference ===
                        UIBrightnessPreference.DARK
                ) {
                    return "dark";
                }

                if (
                    preference ===
                        UIBrightnessPreference
                            .MEDIUM_DARK
                ) {
                    return "mediumDark";
                }

                if (
                    preference ===
                        UIBrightnessPreference
                            .MEDIUM_LIGHT
                ) {
                    return "mediumLight";
                }

                if (
                    preference ===
                        UIBrightnessPreference.LIGHT
                ) {
                    return "light";
                }
            } catch (_) {}

            var preferenceName =
                String(preference)
                    .toLowerCase();

            if (
                preferenceName.indexOf(
                    "medium_dark"
                ) >= 0 ||
                preferenceName.indexOf(
                    "medium dark"
                ) >= 0
            ) {
                return "mediumDark";
            }

            if (
                preferenceName.indexOf(
                    "medium_light"
                ) >= 0 ||
                preferenceName.indexOf(
                    "medium light"
                ) >= 0
            ) {
                return "mediumLight";
            }

            if (
                preferenceName.indexOf(
                    "dark"
                ) >= 0
            ) {
                return "dark";
            }

            if (
                preferenceName.indexOf(
                    "light"
                ) >= 0
            ) {
                return "light";
            }

            var numericPreference =
                Number(preference);

            if (
                isFinite(numericPreference) &&
                numericPreference >= 0 &&
                numericPreference <= 1
            ) {
                if (numericPreference < 0.25) {
                    return "dark";
                }

                if (numericPreference < 0.5) {
                    return "mediumDark";
                }

                if (numericPreference < 0.75) {
                    return "mediumLight";
                }

                return "light";
            }
        } catch (_) {}

        return "dark";
    }

    function presetThemeIsDark() {
        var themeKey =
            presetThemeKey();

        return (
            themeKey === "dark" ||
            themeKey === "mediumDark"
        );
    }

    function presetBackgroundLuminance(
        background
    ) {
        if (!background) {
            return presetThemeIsDark()
                ? 0.22
                : 0.82;
        }

        // Background luminance is retained for fallback and disabled-state
        // calculations. Active icon color follows the explicit Adobe theme.
        return (
            background[0] * 0.2126 +
            background[1] * 0.7152 +
            background[2] * 0.0722
        );
    }

    function presetIconColor(
        graphics,
        active
    ) {
        var background =
            presetControlBackgroundColor(
                graphics
            );
        var darkTheme =
            presetThemeIsDark();

        // Adobe-matched neutral icon colors:
        // Dark + Medium Dark: #C2C2C2
        // Medium Light + Light: #535353
        var color = darkTheme
            ? [
                194 / 255,
                194 / 255,
                194 / 255,
                1
              ]
            : [
                83 / 255,
                83 / 255,
                83 / 255,
                1
              ];

        if (!active) {
            if (!background) {
                background = darkTheme
                    ? [0.22, 0.22, 0.22, 1]
                    : [0.82, 0.82, 0.82, 1];
            }

            // Keep disabled icons monochrome while lowering contrast
            // against the active theme background.
            var iconWeight = 0.42;
            var backgroundWeight =
                1 - iconWeight;

            color = [
                color[0] * iconWeight +
                    background[0] *
                        backgroundWeight,
                color[1] * iconWeight +
                    background[1] *
                        backgroundWeight,
                color[2] * iconWeight +
                    background[2] *
                        backgroundWeight,
                1
            ];
        }

        return color;
    }

    function presetHexColor(
        hexValue
    ) {
        var value =
            String(hexValue || "")
                .replace("#", "");

        if (value.length === 3) {
            value =
                value.charAt(0) +
                value.charAt(0) +
                value.charAt(1) +
                value.charAt(1) +
                value.charAt(2) +
                value.charAt(2);
        }

        var red =
            parseInt(
                value.substring(0, 2),
                16
            );
        var green =
            parseInt(
                value.substring(2, 4),
                16
            );
        var blue =
            parseInt(
                value.substring(4, 6),
                16
            );

        return [
            red / 255,
            green / 255,
            blue / 255,
            1
        ];
    }

    function presetHoverPalette() {
        var themeKey =
            presetThemeKey();

        // Medium Dark is based on the measured Adobe values supplied for
        // InDesign. The remaining palettes follow the same native contrast
        // relationship and remain independently adjustable.
        if (themeKey === "mediumDark") {
            return {
                fill: presetHexColor(
                    "#292929"
                ),
                stroke: presetHexColor(
                    "#474747"
                )
            };
        }

        if (themeKey === "dark") {
            return {
                fill: presetHexColor(
                    "#1D1D1D"
                ),
                stroke: presetHexColor(
                    "#3A3A3A"
                )
            };
        }

        if (themeKey === "mediumLight") {
            return {
                fill: presetHexColor(
                    "#D8D8D8"
                ),
                stroke: presetHexColor(
                    "#A3A3A3"
                )
            };
        }

        return {
            fill: presetHexColor(
                "#EEEEEE"
            ),
            stroke: presetHexColor(
                "#B8B8B8"
            )
        };
    }

    function presetRoundedRectanglePath(
        graphics,
        left,
        top,
        right,
        bottom,
        radius
    ) {
        var kappa =
            0.5522847498;
        var control =
            radius * kappa;
        var canCurve =
            typeof graphics.curveTo ===
            "function";

        graphics.newPath();
        graphics.moveTo(
            left + radius,
            top
        );
        graphics.lineTo(
            right - radius,
            top
        );

        if (canCurve) {
            graphics.curveTo(
                right - radius + control,
                top,
                right,
                top + radius - control,
                right,
                top + radius
            );
        } else {
            // A 2 px radius only needs a short diagonal fallback to read
            // as rounded at ScriptUI scale.
            graphics.lineTo(
                right,
                top + radius
            );
        }

        graphics.lineTo(
            right,
            bottom - radius
        );

        if (canCurve) {
            graphics.curveTo(
                right,
                bottom - radius + control,
                right - radius + control,
                bottom,
                right - radius,
                bottom
            );
        } else {
            graphics.lineTo(
                right - radius,
                bottom
            );
        }

        graphics.lineTo(
            left + radius,
            bottom
        );

        if (canCurve) {
            graphics.curveTo(
                left + radius - control,
                bottom,
                left,
                bottom - radius + control,
                left,
                bottom - radius
            );
        } else {
            graphics.lineTo(
                left,
                bottom - radius
            );
        }

        graphics.lineTo(
            left,
            top + radius
        );

        if (canCurve) {
            graphics.curveTo(
                left,
                top + radius - control,
                left + radius - control,
                top,
                left + radius,
                top
            );
        } else {
            graphics.lineTo(
                left + radius,
                top
            );
        }

        graphics.closePath();
    }

    function drawPresetHoverFrame(
        graphics
    ) {
        var palette =
            presetHoverPalette();
        var fillBrush =
            graphics.newBrush(
                graphics.BrushType
                    .SOLID_COLOR,
                palette.fill
            );
        var strokePen =
            graphics.newPen(
                graphics.PenType
                    .SOLID_COLOR,
                palette.stroke,
                1
            );

        // Half-pixel alignment keeps the 1 px border crisp.
        presetRoundedRectanglePath(
            graphics,
            0.5,
            0.5,
            23.5,
            23.5,
            2
        );
        graphics.fillPath(fillBrush);

        if (
            typeof graphics.strokePath ===
            "function"
        ) {
            presetRoundedRectanglePath(
                graphics,
                0.5,
                0.5,
                23.5,
                23.5,
                2
            );
            graphics.strokePath(strokePen);
        }
    }

    function presetIconBrush(
        graphics,
        active
    ) {
        return graphics.newBrush(
            graphics.BrushType.SOLID_COLOR,
            presetIconColor(
                graphics,
                active
            )
        );
    }

    function presetScaledCoordinate(
        value,
        origin,
        scale
    ) {
        return origin + value * scale;
    }

    function presetFillRectangle(
        graphics,
        x,
        y,
        width,
        height,
        brush
    ) {
        graphics.newPath();

        if (graphics.rectPath) {
            graphics.rectPath(
                x,
                y,
                width,
                height
            );
        } else {
            graphics.moveTo(x, y);
            graphics.lineTo(
                x + width,
                y
            );
            graphics.lineTo(
                x + width,
                y + height
            );
            graphics.lineTo(
                x,
                y + height
            );
            graphics.closePath();
        }

        graphics.fillPath(brush);
    }

    function drawSavePresetPictogram(
        graphics,
        originX,
        originY,
        scale,
        brush
    ) {
        function px(value) {
            return presetScaledCoordinate(
                value,
                originX,
                scale
            );
        }

        function py(value) {
            return presetScaledCoordinate(
                value,
                originY,
                scale
            );
        }

        // Monochrome drive / tray. The indicator opening is created by
        // leaving that area untouched instead of painting it with a second
        // background color.
        presetFillRectangle(
            graphics,
            px(0),
            py(14),
            32 * scale,
            2 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(0),
            py(16),
            4 * scale,
            2 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(8),
            py(16),
            24 * scale,
            2 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(0),
            py(18),
            32 * scale,
            6 * scale,
            brush
        );

        // Downward arrow.
        graphics.newPath();
        graphics.moveTo(px(18), py(6));
        graphics.lineTo(px(23), py(6));
        graphics.lineTo(px(16), py(12));
        graphics.lineTo(px(9), py(6));
        graphics.lineTo(px(14), py(6));
        graphics.lineTo(px(14), py(0));
        graphics.lineTo(px(18), py(0));
        graphics.lineTo(px(18), py(6));
        graphics.closePath();
        graphics.fillPath(brush);
    }

    function drawDeletePresetPictogram(
        graphics,
        originX,
        originY,
        scale,
        brush
    ) {
        function px(value) {
            return presetScaledCoordinate(
                value,
                originX,
                scale
            );
        }

        function py(value) {
            return presetScaledCoordinate(
                value,
                originY,
                scale
            );
        }

        // Lid.
        presetFillRectangle(
            graphics,
            px(5),
            py(4),
            22 * scale,
            2 * scale,
            brush
        );

        // Handle, constructed from separate filled parts so its opening is
        // genuine transparency rather than a second painted color.
        presetFillRectangle(
            graphics,
            px(11),
            py(2),
            2 * scale,
            2 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(19),
            py(2),
            2 * scale,
            2 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(13),
            py(0),
            6 * scale,
            2 * scale,
            brush
        );

        // Bin outline.
        presetFillRectangle(
            graphics,
            px(7),
            py(6),
            2 * scale,
            18 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(23),
            py(6),
            2 * scale,
            18 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(9),
            py(24),
            14 * scale,
            2 * scale,
            brush
        );

        // Vertical ribs.
        presetFillRectangle(
            graphics,
            px(11),
            py(8),
            2 * scale,
            14 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(15),
            py(8),
            2 * scale,
            14 * scale,
            brush
        );
        presetFillRectangle(
            graphics,
            px(19),
            py(8),
            2 * scale,
            14 * scale,
            brush
        );
    }

    function addPresetIconControl(
        parent,
        iconKind,
        helpText
    ) {
        var control =
            parent.add(
                "statictext",
                undefined,
                ""
            );

        control.preferredSize = [24, 24];
        control.minimumSize = [24, 24];
        control.maximumSize = [24, 24];
        control.alignment = ["left", "center"];
        control.helpTip = helpText || "";
        control.emetricIconKind =
            iconKind;
        control.emetricPressed = false;
        control.emetricHovered = false;
        control.onClick = null;

        control.onDraw = function () {
            var graphics =
                control.graphics;
            var active =
                Boolean(control.enabled);
            var brush = null;

            if (
                active &&
                control.emetricHovered
            ) {
                try {
                    drawPresetHoverFrame(
                        graphics
                    );
                } catch (_) {
                    // Never let a hover-decoration failure suppress the icon.
                }
            }

            try {
                brush =
                    presetIconBrush(
                        graphics,
                        active
                    );
            } catch (_) {
                return;
            }

            // Scale the 32 × 32 source geometry to a 16 × 16 icon.
            // A 4 px inset centers it in the 24 × 24 clickable control.
            var scale = 0.5;
            var pressedOffset =
                control.emetricPressed &&
                active
                    ? 1
                    : 0;
            var originX =
                4 + pressedOffset;
            var originY =
                4 + pressedOffset;

            try {
                if (
                    control.emetricIconKind ===
                    "save"
                ) {
                    drawSavePresetPictogram(
                        graphics,
                        originX,
                        originY,
                        scale,
                        brush
                    );
                } else {
                    drawDeletePresetPictogram(
                        graphics,
                        originX,
                        originY,
                        scale,
                        brush
                    );
                }
            } catch (_) {}
        };

        function presetIconMouseDown() {
            if (!control.enabled) return;

            control.emetricPressed = true;
            refreshPresetIconControl(
                control
            );
        }

        function presetIconMouseUp() {
            var wasPressed =
                control.emetricPressed;

            control.emetricPressed = false;
            refreshPresetIconControl(
                control
            );

            if (
                wasPressed &&
                control.enabled &&
                control.onClick
            ) {
                control.onClick();
            }
        }

        try {
            control.addEventListener(
                "mouseover",
                function () {
                    if (!control.enabled) {
                        return;
                    }

                    control.emetricHovered =
                        true;
                    refreshPresetIconControl(
                        control
                    );
                }
            );
            control.addEventListener(
                "mousedown",
                presetIconMouseDown
            );
            control.addEventListener(
                "mouseup",
                presetIconMouseUp
            );
            control.addEventListener(
                "mouseout",
                function () {
                    var needsRefresh =
                        control.emetricHovered ||
                        control.emetricPressed;

                    control.emetricHovered =
                        false;
                    control.emetricPressed =
                        false;

                    if (needsRefresh) {
                        refreshPresetIconControl(
                            control
                        );
                    }
                }
            );
        } catch (_) {}

        return control;
    }

    var presetBar = w.add("group");
    prepareFieldRow(presetBar);
    presetBar.alignment = ["fill", "top"];
    presetBar.spacing = 4;

    // Align the complete preset group with the panel fields below.
    // The parent window has a 14 px outer margin; this additional inset
    // matches the panels' internal left edge.
    presetBar.margins = [14, 0, 0, 0];

    var presetLabel =
        addFieldLabel(
            presetBar,
            "Preset"
        );

    var presetDropdown =
        presetBar.add(
            "dropdownlist",
            undefined
        );
    presetDropdown.preferredSize.width = 320;
    presetDropdown.minimumSize.width = 320;
    presetDropdown.maximumSize.width = 420;

    var presetSaveButton =
        addPresetIconControl(
            presetBar,
            "save",
            "Save preset…"
        );

    var presetDeleteButton =
        addPresetIconControl(
            presetBar,
            "delete",
            "Delete preset"
        );
    presetDeleteButton.enabled = false;

    var columns = w.add("group");
    columns.orientation = "row";
    columns.alignChildren = ["fill", "top"];
    columns.spacing = 8;

    // COLUMN 1 — TYPE SIZE + COLORS
    var col1 = columns.add("group");
    col1.orientation = "column";
    col1.alignChildren = ["fill", "top"];
    col1.spacing = 8;
    col1.preferredSize.width = UI_COLUMN_WIDTH;
    col1.minimumSize.width = UI_COLUMN_WIDTH;
    col1.maximumSize.width = UI_COLUMN_WIDTH;

    var pType = addSection(col1, "Measurement and Source");

    var unitRow = pType.add("group");
    prepareFieldRow(unitRow);

    var unitLabel = addFieldLabel(unitRow, "Unit");

    var unitDropdown = unitRow.add(
        "dropdownlist",
        undefined,
        [
            "Millimeters (mm)",
            "Points (pt)",
            "Picas (p)",
            "Ciceros (c)",
            "Didot Points (dp)",
            "Edo (e)",
            "Edo Points (ep)"
        ]
    );
    unitDropdown.preferredSize.width = UI_FIELD_WIDTH * 2 + 8;
    unitDropdown.minimumSize.width = UI_FIELD_WIDTH * 2 + 8;
    unitDropdown.maximumSize.width = UI_FIELD_WIDTH * 2 + 8;
    unitDropdown.selection = 0;

    var unitRowSpacer = unitRow.add("statictext", undefined, "");
    unitRowSpacer.preferredSize.width = UI_UNIT_WIDTH;
    unitRowSpacer.minimumSize.width = UI_UNIT_WIDTH;
    unitRowSpacer.maximumSize.width = UI_UNIT_WIDTH;

    var metricsSourceRow = pType.add("group");
    prepareFieldRow(metricsSourceRow);
    var metricsSourceLabel = addFieldLabel(metricsSourceRow, "Metric Source");
    var metricsSourceDropdown =
        metricsSourceRow.add(
            "dropdownlist",
            undefined
        );

    function addMetricSourceItem(text, key) {
        var item =
            metricsSourceDropdown.add(
                "item",
                text
            );

        item.emetricSourceKey = key || null;
        return item;
    }

    function addMetricSourceSeparator() {
        var separator =
            metricsSourceDropdown.add(
                "separator"
            );

        try {
            separator.emetricSeparator = true;
        } catch (_) {}

        return separator;
    }

    addMetricSourceItem(
        "Selected Font",
        "selectedFont"
    );
    addMetricSourceSeparator();
    addMetricSourceItem(
        "Emetric Decimal",
        "decimal"
    );
    addMetricSourceItem(
        "Emetric Dozenal",
        "dozenal"
    );
    addMetricSourceSeparator();
    addMetricSourceItem(
        "Custom Metric",
        "custom"
    );

    metricsSourceDropdown.preferredSize.width =
        UI_FIELD_WIDTH * 2 + 8;
    metricsSourceDropdown.minimumSize.width =
        UI_FIELD_WIDTH * 2 + 8;
    metricsSourceDropdown.maximumSize.width =
        UI_FIELD_WIDTH * 2 + 8;
    metricsSourceDropdown.selection = 0;

    var lastValidMetricSourceIndex = 0;
    var lastValidMetricSourceKey = "selectedFont";

    function selectedMetricSourceKey() {
        try {
            var selection =
                metricsSourceDropdown.selection;

            if (
                selection &&
                selection.emetricSourceKey
            ) {
                return selection.emetricSourceKey;
            }
        } catch (_) {}

        return "selectedFont";
    }

    function selectedMetricSourceName() {
        var key = selectedMetricSourceKey();

        if (key === "decimal") {
            return "Emetric Decimal";
        }

        if (key === "dozenal") {
            return "Emetric Dozenal";
        }

        if (key === "custom") {
            return "Custom Metric";
        }

        return "Selected Font";
    }

    var metricsSourceSpacer =
        metricsSourceRow.add("statictext", undefined, "");
    metricsSourceSpacer.preferredSize.width = UI_UNIT_WIDTH;
    metricsSourceSpacer.minimumSize.width = UI_UNIT_WIDTH;
    metricsSourceSpacer.maximumSize.width = UI_UNIT_WIDTH;

    var fontFamilyRow = pType.add("group");
    prepareFieldRow(fontFamilyRow);
    addFieldLabel(fontFamilyRow, "Font Family");
    var fontFamilyDropdown =
        fontFamilyRow.add("dropdownlist", undefined, ["—"]);
    fontFamilyDropdown.preferredSize.width = UI_FIELD_WIDTH * 2 + 8;
    fontFamilyDropdown.minimumSize.width = UI_FIELD_WIDTH * 2 + 8;
    fontFamilyDropdown.maximumSize.width = UI_FIELD_WIDTH * 2 + 8;
    fontFamilyDropdown.selection = 0;
    var fontFamilySpacer =
        fontFamilyRow.add("statictext", undefined, "");
    fontFamilySpacer.preferredSize.width = UI_UNIT_WIDTH;
    fontFamilySpacer.minimumSize.width = UI_UNIT_WIDTH;
    fontFamilySpacer.maximumSize.width = UI_UNIT_WIDTH;

    var fontStyleRow = pType.add("group");
    prepareFieldRow(fontStyleRow);
    addFieldLabel(fontStyleRow, "Font Style");
    var fontStyleDropdown =
        fontStyleRow.add("dropdownlist", undefined, ["—"]);
    fontStyleDropdown.preferredSize.width = UI_FIELD_WIDTH * 2 + 8;
    fontStyleDropdown.minimumSize.width = UI_FIELD_WIDTH * 2 + 8;
    fontStyleDropdown.maximumSize.width = UI_FIELD_WIDTH * 2 + 8;
    fontStyleDropdown.selection = 0;
    var fontStyleSpacer =
        fontStyleRow.add("statictext", undefined, "");
    fontStyleSpacer.preferredSize.width = UI_UNIT_WIDTH;
    fontStyleSpacer.minimumSize.width = UI_UNIT_WIDTH;
    fontStyleSpacer.maximumSize.width = UI_UNIT_WIDTH;

    var customRatioContainer =
        pType.add("group");
    customRatioContainer.orientation = "column";
    customRatioContainer.alignChildren = ["fill", "top"];
    customRatioContainer.alignment = ["fill", "top"];
    customRatioContainer.spacing = 3;
    customRatioContainer.margins = [0, 0, 0, 0];
    customRatioContainer.visible = false;
    customRatioContainer.minimumSize.height = 0;
    customRatioContainer.maximumSize.height = 0;
    customRatioContainer.preferredSize.height = 0;

    var customRatioMetrics =
        addRow(customRatioContainer, "Metrics", "12", true, "");
    var customRatioAscender =
        addRow(customRatioContainer, "Ascender", "8", true, "");
    var customRatioCapHeight =
        addRow(customRatioContainer, "Cap Height", "7", true, "");
    var customRatioXHeight =
        addRow(customRatioContainer, "x-Height", "5", true, "");
    var customRatioDescender =
        addRow(customRatioContainer, "Descender", "-3", true, "");

    // Internal status only; no additional status row is shown in the panel.
    var fontMetricsStatus = { text: "Using Emetric Dozenal" };

    var pTypeSize = addSection(col1, "Type Size");
    var fMetrics = addRow(pTypeSize, "Metrics", "4", true, "mm");
    var oAscender = addRow(pTypeSize, "Ascender", "", true, "mm");
    var oUppercase = addRow(pTypeSize, "Cap Height", "", true, "mm");
    var oLowercase = addRow(pTypeSize, "x-Height", "", true, "mm");
    var oDescender = addRow(pTypeSize, "Descender", "", true, "mm");

    fMetrics.emetricThreeDecimalDisplay = true;
    oAscender.emetricThreeDecimalDisplay = true;
    oUppercase.emetricThreeDecimalDisplay = true;
    oLowercase.emetricThreeDecimalDisplay = true;
    oDescender.emetricThreeDecimalDisplay = true;

    metricsSourceDropdown.helpTip =
        "Choose Selected Font, Emetric Decimal, Emetric Dozenal, or Custom Metric";
    metricsSourceLabel.helpTip = metricsSourceDropdown.helpTip;
    fMetrics.helpTip =
        "The em-based reference size used for all typographic proportions.";
    try { fMetrics.label.helpTip = fMetrics.helpTip; } catch (_) {}

    var pLineSpace = addSection(col1, "Leading");
    var oLineSpace = addRow(pLineSpace, "Leading", "", true, "mm");
    oLineSpace.emetricThreeDecimalDisplay = true;

    var fMetricsLine =
        addRatioRow(pLineSpace, "Metrics : Leading", "4", "5", true);

    var colorPanel = addSection(col1, "Colors");

    var profileRow = colorPanel.add("group");
    prepareFieldRow(profileRow);

    var profileLabel = addFieldLabel(profileRow, "Color Theme");

    var colorProfileNames = [];
    for (var cp = 0; cp < COLOR_PROFILES.length; cp++) {
        colorProfileNames.push(COLOR_PROFILES[cp].name);
    }

    var colorProfileDropdown =
        profileRow.add("dropdownlist", undefined, colorProfileNames);
    colorProfileDropdown.preferredSize.width = UI_FIELD_WIDTH * 2 + 8;
    colorProfileDropdown.minimumSize.width = UI_FIELD_WIDTH * 2 + 8;
    colorProfileDropdown.maximumSize.width = UI_FIELD_WIDTH * 2 + 8;
    colorProfileDropdown.selection = 0;

    var profileRowSpacer = profileRow.add("statictext", undefined, "");
    profileRowSpacer.preferredSize.width = UI_UNIT_WIDTH;
    profileRowSpacer.minimumSize.width = UI_UNIT_WIDTH;
    profileRowSpacer.maximumSize.width = UI_UNIT_WIDTH;

    var guideColorSelector =
        addColorSelector(colorPanel, "Guides", "#4F99FF");
    var marginColorSelector =
        addColorSelector(colorPanel, "Margins", "#4F99FF");
    var columnColorSelector =
        addColorSelector(colorPanel, "Columns", "#4F99FF");
    var baselineGridColorSelector =
        addColorSelector(colorPanel, "Baseline Grid", "#AAD4FF");
    var documentGridColorSelector =
        addColorSelector(colorPanel, "Document Grid", "#E0E0E0");

    function applyColorProfile(index) {
        var profile = COLOR_PROFILES[index] || COLOR_PROFILES[0];
        guideColorSelector.set(profile.guides);
        marginColorSelector.set(profile.margins);
        columnColorSelector.set(profile.columns);
        baselineGridColorSelector.set(profile.baseline);
        documentGridColorSelector.set(profile.document);
    }

    var customProfileItem = null;
    var applyingProfile = false;

    function removeCustomProfileStatus() {
        if (customProfileItem) {
            try {
                colorProfileDropdown.remove(customProfileItem);
            } catch (_) {}
            customProfileItem = null;
        }
    }

    function markCustomProfile() {
        if (applyingProfile) return;

        if (!customProfileItem) {
            customProfileItem =
                colorProfileDropdown.add("item", "Custom Theme");
        }
        colorProfileDropdown.selection = customProfileItem;
        markDirty();
        updatePreviewDocument();
    }

    guideColorSelector.onUserChange = markCustomProfile;
    marginColorSelector.onUserChange = markCustomProfile;
    columnColorSelector.onUserChange = markCustomProfile;
    baselineGridColorSelector.onUserChange = markCustomProfile;
    documentGridColorSelector.onUserChange = markCustomProfile;

    colorProfileDropdown.onChange = function () {
        if (!colorProfileDropdown.selection) return;

        var selectedText = colorProfileDropdown.selection.text;
        if (selectedText === "Custom Theme") return;

        var index = -1;
        for (var i = 0; i < COLOR_PROFILES.length; i++) {
            if (COLOR_PROFILES[i].name === selectedText) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            applyingProfile = true;
            applyColorProfile(index);
            removeCustomProfileStatus();
            colorProfileDropdown.selection = index;
            applyingProfile = false;
            markDirty();
            updatePreviewDocument();
        }
    };

    // COLUMN 2 — ROW GRID + COLUMN GRID + GRID MODULES
    var col2 = columns.add("group");
    col2.orientation = "column";
    col2.alignChildren = ["fill", "top"];
    col2.spacing = 8;
    col2.preferredSize.width = UI_COLUMN_WIDTH;
    col2.minimumSize.width = UI_COLUMN_WIDTH;
    col2.maximumSize.width = UI_COLUMN_WIDTH;

    function addSelectorRow(parent, labelText, items, selectedIndex) {
        var row = parent.add("group");
        prepareFieldRow(row);

        var label = addFieldLabel(row, labelText);
        var dropdown = row.add("dropdownlist", undefined, items);
        dropdown.preferredSize.width = UI_FIELD_WIDTH * 2 + 8;
        dropdown.minimumSize.width = UI_FIELD_WIDTH * 2 + 8;
        dropdown.maximumSize.width = UI_FIELD_WIDTH * 2 + 8;
        dropdown.selection = selectedIndex || 0;

        var spacer = row.add("statictext", undefined, "");
        spacer.preferredSize.width = UI_UNIT_WIDTH;
        spacer.minimumSize.width = UI_UNIT_WIDTH;
        spacer.maximumSize.width = UI_UNIT_WIDTH;

        dropdown.label = label;
        return dropdown;
    }

    var OFFSET_SOURCE_NAMES = [
        "Metrics",
        "Ascender",
        "Cap Height",
        "x-Height"
    ];

    var pVertical = addSection(col2, "Row Grid");
    var oVerticalLine = addRow(pVertical, "Leading", "", false, "mm");
    var fVerticalGroup = addRow(pVertical, "Group", "6", true, "");
    var oVerticalGridline =
        addRow(pVertical, "Module Size", "", false, "mm");
    var oVerticalOffset = addRow(pVertical, "Offset", "", false, "mm");
    var rowOffsetSource =
        addSelectorRow(
            pVertical,
            "Offset Source",
            OFFSET_SOURCE_NAMES,
            3
        );
    var oGridMarginV =
        addRow(pVertical, "Row Margin", "", false, "mm");
    var oGutterV =
        addRow(pVertical, "Row Gutter", "", false, "mm");

    var majorGridHorizontalCheckbox =
        pVertical.add("checkbox", undefined, "Row Grid Lines");
    majorGridHorizontalCheckbox.value = false;

    var guideRowsCheckbox =
        pVertical.add("checkbox", undefined, "Row Gutter Guides");
    guideRowsCheckbox.value = true;

    var pHorizontal = addSection(col2, "Column Grid");
    var oHorizontalLine = addRow(pHorizontal, "Leading", "", false, "mm");
    var fHorizontalGroup = addRow(pHorizontal, "Group", "6", true, "");
    var oHorizontalGridline =
        addRow(pHorizontal, "Module Size", "", false, "mm");
    var oHorizontalOffset = addRow(pHorizontal, "Offset", "", false, "mm");
    var columnOffsetSource =
        addSelectorRow(
            pHorizontal,
            "Offset Source",
            OFFSET_SOURCE_NAMES,
            3
        );
    var oGridMarginH =
        addRow(pHorizontal, "Column Margin", "", false, "mm");
    var oGutterH =
        addRow(pHorizontal, "Column Gutter", "", false, "mm");

    var majorGridVerticalCheckbox =
        pHorizontal.add("checkbox", undefined, "Column Grid Lines");
    majorGridVerticalCheckbox.value = false;

    var guideColumnsCheckbox =
        pHorizontal.add("checkbox", undefined, "Column Gutter Guides");
    guideColumnsCheckbox.value = true;

    var pGridGroup = addSection(col2, "Grid Modules");
    var fGridGroupH = addRow(pGridGroup, "Columns", "6", true, "");
    var fGridGroupV = addRow(pGridGroup, "Rows", "9", true, "");
    var fGridRatio =
        addRatioRow(pGridGroup, "Module Ratio", "2", "3", true);

    var columnGuidesCheckbox =
        pGridGroup.add("checkbox", undefined, "Apply Column Gutters");
    columnGuidesCheckbox.value = true;
    columnGuidesCheckbox.helpTip =
        "Applies the calculated Column Gutter to InDesign’s Margins and Columns settings. It does not change Emetric’s grid calculations.";

    var oGridWidth = addRow(pGridGroup, "Grid Width", "", false, "mm");
    var oGridHeight = addRow(pGridGroup, "Grid Height", "", false, "mm");
    var oIntersectionW =
        addRow(pGridGroup, "Module Area Width", "", false, "mm");
    var oIntersectionH =
        addRow(pGridGroup, "Module Area Height", "", false, "mm");

    oVerticalGridline.helpTip =
        "Leading multiplied by Group; the height of one row module.";
    try { oVerticalGridline.label.helpTip = oVerticalGridline.helpTip; } catch (_) {}
    oHorizontalGridline.helpTip =
        "Leading multiplied by Group; the width of one column module.";
    try { oHorizontalGridline.label.helpTip = oHorizontalGridline.helpTip; } catch (_) {}
    // COLUMN 3 — PAGE + DOCUMENT OPTIONS
    var col3 = columns.add("group");
    col3.orientation = "column";
    col3.alignChildren = ["fill", "top"];
    col3.spacing = 8;
    col3.preferredSize.width = UI_COLUMN_WIDTH;
    col3.minimumSize.width = UI_COLUMN_WIDTH;
    col3.maximumSize.width = UI_COLUMN_WIDTH;

    var pPage = addSection(col3, "Page");
    var oPageWidth = addRow(pPage, "Width", "", true, "mm");
    var oPageHeight = addRow(pPage, "Height", "", true, "mm");
    var oSpread = addRow(pPage, "Spread", "", false, "mm");

    oPageWidth.helpTip =
        "Fixes the page width and derives Column Leading from the current horizontal page grid steps.";
    oPageHeight.helpTip =
        "Fixes the page height and derives Row Leading and type size from the current vertical page grid steps.";
    try { oPageWidth.label.helpTip = oPageWidth.helpTip; } catch (_) {}
    try { oPageHeight.label.helpTip = oPageHeight.helpTip; } catch (_) {}
    var oFormatRatio =
        addRatioRow(pPage, "Format Ratio", "", "", false);

    var lockFormatRatio =
        pPage.add("checkbox", undefined, "Lock Format Ratio");
    lockFormatRatio.value = false;
    lockFormatRatio.enabled = false;
    lockFormatRatio.helpTip =
        "Keeps the current page width/height ratio when Anamorphic Format is active.";

    var fMarginTop = addMarginRow(pPage, "Top Margin", "1");
    var fMarginBottom = addMarginRow(pPage, "Bottom Margin", "1");
    var fMarginLeft = addMarginRow(pPage, "Left Margin", "1");
    var fMarginRight = addMarginRow(pPage, "Right Margin", "1");

    var oTypeWidth =
        addRow(pPage, "Type Area Width", "", false, "mm");
    var oTypeHeight =
        addRow(pPage, "Type Area Height", "", false, "mm");

    var facingPages = pPage.add("checkbox", undefined, "Facing Pages");
    facingPages.value = false;

    var anamorphicFormat =
        pPage.add("checkbox", undefined, "Anamorphic Format");
    anamorphicFormat.value = false;
    anamorphicFormat.helpTip =
        "Enables editable page dimensions. Width and Height solve back to Column Leading and Row Leading while preserving the current page grid steps.";

    var pLayout = addSection(col3, "Document Options");
    var useAMaster =
        pLayout.add("checkbox", undefined, "Use A-Parent");
    useAMaster.value = true;

    var snapToGrid =
        pLayout.add("checkbox", undefined, "Snap to Grid");
    snapToGrid.value = true;

    var snapToGuides =
        pLayout.add("checkbox", undefined, "Snap to Guides");
    snapToGuides.value = true;

    var gridsInBack =
        pLayout.add("checkbox", undefined, "Grids in Back");
    gridsInBack.value = true;

    var infoPage =
        pLayout.add("checkbox", undefined, "Emetric Index Page");
    infoPage.value = false;

    var placeholderText =
        pLayout.add("checkbox", undefined, "Placeholder Text");
    placeholderText.value = false;
    placeholderText.enabled = false;
    placeholderText.helpTip =
        "Creates a text frame matching the Type Area and fills it with InDesign placeholder text.";

    function updateDynamicFieldLabel(labelControl, text) {
        try {
            labelControl.text = fieldLabelText(text);

            // Keep both the container and the text control at the same fixed
            // width. ScriptUI otherwise retains the old short text width and
            // clips longer replacement labels such as Inside: and Outside:.
            try {
                labelControl.parent.preferredSize.width = UI_LABEL_WIDTH;
                labelControl.parent.minimumSize.width = UI_LABEL_WIDTH;
                labelControl.parent.maximumSize.width = UI_LABEL_WIDTH;
            } catch (_) {}

            labelControl.preferredSize.width = UI_LABEL_WIDTH;
            labelControl.minimumSize.width = UI_LABEL_WIDTH;
            labelControl.maximumSize.width = UI_LABEL_WIDTH;
            labelControl.alignment = ["fill", "center"];
            try { labelControl.justify = "right"; } catch (_) {}

            try {
                labelControl.parent.layout.layout(true);
            } catch (_) {}
        } catch (_) {}
    }

    function updateMarginLabels() {
        var useFacingLabels = Boolean(facingPages.value);

        updateDynamicFieldLabel(
            fMarginLeft.label,
            useFacingLabels ? "Inside Margin" : "Left Margin"
        );
        updateDynamicFieldLabel(
            fMarginRight.label,
            useFacingLabels ? "Outside Margin" : "Right Margin"
        );

        // Do not re-layout the complete Margin panel. That could shift the
        // unchanged Top and Bottom rows when the longer labels are shown.
        try {
            if (pPage.window && pPage.window.update) {
                pPage.window.update();
            }
        } catch (_) {}
    }


    var compactWindow = new Window(
        "palette",
        APP_NAME +
        " v" +
        VERSION +
        " — Compact View" +
        (RELEASE_STATUS ? " — " + RELEASE_STATUS : ""),
        undefined,
        {
            closeButton: true,
            resizeable: false
        }
    );
    compactWindow.orientation = "row";
    compactWindow.alignChildren = ["left", "center"];
    compactWindow.spacing = 8;
    compactWindow.margins = [12, 8, 12, 8];

    function addCompactDivider() {
        var divider =
            compactWindow.add("panel");
        divider.preferredSize = [1, 24];
        divider.minimumSize = [1, 24];
        divider.maximumSize = [1, 24];
        return divider;
    }

    function addCompactGroup() {
        var group =
            compactWindow.add("group");
        group.orientation = "row";
        group.alignChildren =
            ["left", "center"];
        group.alignment =
            ["left", "center"];
        group.spacing =
            UI_LABEL_FIELD_GAP;
        group.margins = [0, 0, 0, 0];
        return group;
    }

    function addCompactLabel(
        parent,
        text
    ) {
        return parent.add(
            "statictext",
            undefined,
            text
        );
    }

    function addCompactField(
        parent,
        value,
        width
    ) {
        var field =
            parent.add(
                "edittext",
                undefined,
                String(value)
            );
        field.preferredSize.width =
            width || 42;
        field.minimumSize.width =
            width || 42;
        field.maximumSize.width =
            width || 42;
        return field;
    }

    // Compact View is intentionally limited to the controls needed while
    // visually evaluating a live layout.
    var compactPresetGroup =
        addCompactGroup();
    addCompactLabel(
        compactPresetGroup,
        "Preset:"
    );
    var compactPresetDropdown =
        compactPresetGroup.add(
            "dropdownlist",
            undefined
        );
    compactPresetDropdown.preferredSize.width =
        180;
    compactPresetDropdown.minimumSize.width =
        180;
    compactPresetDropdown.maximumSize.width =
        240;
    var compactPresetDropdownIsUpdating =
        false;

    addCompactDivider();

    var compactMetricsGroup =
        addCompactGroup();
    addCompactLabel(
        compactMetricsGroup,
        "Metrics:"
    );
    var compactMetrics =
        addCompactField(
            compactMetricsGroup,
            fMetrics.text,
            72
        );

    var compactColumnsGroup =
        addCompactGroup();
    addCompactLabel(
        compactColumnsGroup,
        "Columns:"
    );
    var compactColumns =
        addCompactField(
            compactColumnsGroup,
            fGridGroupH.text,
            38
        );

    var compactRowsGroup =
        addCompactGroup();
    addCompactLabel(
        compactRowsGroup,
        "Rows:"
    );
    var compactRows =
        addCompactField(
            compactRowsGroup,
            fGridGroupV.text,
            38
        );

    addCompactDivider();

    var compactPreviewGroup =
        compactWindow.add("group");
    compactPreviewGroup.orientation = "row";
    compactPreviewGroup.alignChildren =
        ["left", "center"];
    compactPreviewGroup.alignment =
        ["left", "center"];
    compactPreviewGroup.margins =
        [0, 3, 0, 0];
    compactPreviewGroup.spacing = 0;

    var compactPreviewCheckbox =
        compactPreviewGroup.add(
            "checkbox",
            undefined,
            "Preview"
        );
    compactPreviewCheckbox.value = true;
    compactPreviewCheckbox.alignment =
        ["left", "center"];

    addCompactDivider();

    var compactFullSettingsButton =
        compactWindow.add(
            "button",
            undefined,
            "Full Settings"
        );
    compactFullSettingsButton.helpTip =
        "Open Full Settings";

    var compactCreateButton =
        compactWindow.add(
            "button",
            undefined,
            "Create",
            { name: "ok" }
        );

    var bottomBar = w.add("group");
    bottomBar.orientation = "row";
    bottomBar.alignChildren = ["left", "center"];
    bottomBar.alignment = ["fill", "bottom"];
    bottomBar.preferredSize.width =
        (UI_COLUMN_WIDTH * 3) + (columns.spacing * 2);

    function addBottomDivider() {
        var divider =
            bottomBar.add("panel");
        divider.preferredSize = [1, 24];
        divider.minimumSize = [1, 24];
        divider.maximumSize = [1, 24];
        divider.alignment = ["left", "center"];
        return divider;
    }

    var bottomInfoText =
        bottomBar.add(
            "statictext",
            undefined,
            "v" + VERSION +
            ". Copyright © 2012–2026 by Kristian Möller, KTKM. All rights reserved."
        );
    bottomInfoText.alignment = ["fill", "center"];

    try {
        bottomInfoText.graphics.font =
            ScriptUI.newFont(
                bottomInfoText.graphics.font.name,
                "REGULAR",
                10
            );
    } catch (_) {}

    addBottomDivider();

    var previewGroup = bottomBar.add("group");
    previewGroup.orientation = "row";
    previewGroup.alignChildren = ["left", "center"];
    previewGroup.alignment = ["left", "center"];
    previewGroup.margins = [0, 5, 0, 0];
    previewGroup.spacing = 0;

    var previewCheckbox =
        previewGroup.add("checkbox", undefined, "Preview");
    previewCheckbox.value = true;
    previewCheckbox.alignment = ["left", "center"];

    addBottomDivider();

    var buttons = bottomBar.add("group");
    buttons.orientation = "row";
    buttons.alignment = ["right", "center"];
    buttons.alignChildren = ["right", "center"];

    var compactViewButton =
        buttons.add(
            "button",
            undefined,
            "Compact View"
        );
    compactViewButton.helpTip =
        "Switch to Compact View";

    var resetButton = buttons.add("button", undefined, "Reset");
    var cancelButton = buttons.add("button", undefined, "Cancel");

    var createButton =
        buttons.add(
            "button",
            undefined,
            "Create Document",
            { name: "ok" }
        );

    var emetricActiveInputField = null;
    var emetricInputExplicitlyClosed = false;
    var emetricCreateGuardUntil = 0;

    function emetricCurrentTime() {
        try {
            return new Date().getTime();
        } catch (_) {
            return 0;
        }
    }

    function setPrimaryCreateEnabled(
        enabled
    ) {
        var isEnabled =
            Boolean(enabled);

        try {
            createButton.enabled =
                isEnabled;
        } catch (_) {}

        try {
            compactCreateButton.enabled =
                isEnabled;
        } catch (_) {}

        try {
            w.defaultElement =
                isEnabled
                    ? createButton
                    : null;
        } catch (_) {}

        try {
            compactWindow.defaultElement =
                isEnabled
                    ? compactCreateButton
                    : null;
        } catch (_) {}
    }

    function beginEmetricInputEditing(
        field
    ) {
        emetricActiveInputField =
            field || null;
        emetricInputExplicitlyClosed =
            false;
        emetricCreateGuardUntil =
            2147483647;

        removeFocusRestoreIdleTask();
        setPrimaryCreateEnabled(false);
    }

    function finishEmetricInputEditing(
        field
    ) {
        if (
            field &&
            emetricActiveInputField &&
            field !==
                emetricActiveInputField
        ) {
            return;
        }

        emetricActiveInputField = null;
        emetricInputExplicitlyClosed =
            true;

        // This one-shot guard prevents the same mouse or key event that
        // closed the field from also activating Create.
        emetricCreateGuardUntil =
            emetricCurrentTime() + 200;

        removeFocusRestoreIdleTask();
        setPrimaryCreateEnabled(true);
    }

    function activeEmetricInputField() {
        try {
            if (
                emetricActiveInputField &&
                emetricActiveInputField.active
            ) {
                return emetricActiveInputField;
            }
        } catch (_) {}

        try {
            var activeField =
                currentlyActiveInputField();

            if (activeField) {
                emetricActiveInputField =
                    activeField;
                return activeField;
            }
        } catch (_) {}

        return null;
    }

    function commitActiveEmetricInput() {
        var field =
            activeEmetricInputField();

        if (!field) {
            return false;
        }

        setDiagnosticAction(
            "Commit active input field",
            false
        );

        emetricInputExplicitlyClosed =
            true;

        try {
            if (field.notify) {
                field.notify("onChange");
            } else if (
                typeof field.onChange ===
                "function"
            ) {
                field.onChange();
            }
        } catch (_) {}

        try {
            field.active = false;
        } catch (_) {}

        finishEmetricInputEditing(
            field
        );

        try {
            var targetWindow =
                compactMode
                    ? compactWindow
                    : w;
            targetWindow.active = true;
        } catch (_) {}

        return true;
    }

    function primaryCreateIsBlocked() {
        if (activeEmetricInputField()) {
            return true;
        }

        return (
            emetricCurrentTime() <
            emetricCreateGuardUntil
        );
    }

    function activateDefaultCreateButton(
        targetButton
    ) {
        if (
            !targetButton ||
            !targetButton.enabled ||
            primaryCreateIsBlocked()
        ) {
            return;
        }

        try {
            targetButton.notify(
                "onClick"
            );
        } catch (_) {
            try {
                targetButton.onClick();
            } catch (__) {}
        }
    }

    function installDefaultCreateButton(
        targetWindow,
        targetButton
    ) {
        try {
            targetWindow.defaultElement =
                targetButton;
        } catch (_) {}

        try {
            targetWindow.addEventListener(
                "keydown",
                function (event) {
                    var keyName = "";

                    try {
                        keyName =
                            String(
                                event.keyName ||
                                ""
                            ).toLowerCase();
                    } catch (_) {}

                    if (
                        keyName !== "enter" &&
                        keyName !== "return"
                    ) {
                        return;
                    }

                    try {
                        if (
                            event.altKey ||
                            event.ctrlKey ||
                            event.metaKey
                        ) {
                            return;
                        }
                    } catch (_) {}

                    // Prevent ScriptUI from also invoking the native default
                    // action after the explicit palette fallback.
                    try {
                        event.preventDefault();
                    } catch (_) {}

                    try {
                        event.stopPropagation();
                    } catch (_) {}

                    if (
                        commitActiveEmetricInput()
                    ) {
                        return;
                    }

                    if (
                        primaryCreateIsBlocked()
                    ) {
                        return;
                    }

                    activateDefaultCreateButton(
                        targetButton
                    );
                }
            );
        } catch (_) {}
    }

    installDefaultCreateButton(
        compactWindow,
        compactCreateButton
    );
    installDefaultCreateButton(
        w,
        createButton
    );

    function measureButtonText(button, text) {
        try {
            var measured = button.graphics.measureString(String(text));
            if (measured && measured.length > 0) {
                return Number(measured[0]);
            }
        } catch (_) {}

        // Fallback approximation for ScriptUI environments without measureString.
        return String(text).length * 7;
    }

    function setButtonSize(button, width) {
        var buttonWidth = Math.max(54, Math.ceil(width));
        button.preferredSize = [buttonWidth, 24];
        button.minimumSize = [buttonWidth, 24];
        button.maximumSize = [buttonWidth, 24];
    }

    function styleActionButtons() {
        // Create Document is the reference. Its established width is 132 px;
        // derive equal left/right text padding from the current UI font.
        var referenceWidth = 132;
        var referenceTextWidth =
            measureButtonText(createButton, createButton.text);
        var horizontalPadding =
            Math.max(12, (referenceWidth - referenceTextWidth) / 2);

        var actionButtons = [
            compactFullSettingsButton,
            compactCreateButton,
            compactViewButton,
            resetButton,
            cancelButton,
            createButton
        ];

        for (var i = 0; i < actionButtons.length; i++) {
            var button = actionButtons[i];
            var textWidth = measureButtonText(button, button.text);
            setButtonSize(
                button,
                textWidth + (horizontalPadding * 2)
            );
        }
    }

    styleActionButtons();

    var compactMode = false;
    var compactClosing = false;
    var mainWindowLocation = null;

    function refreshEmetricWindow(targetWindow) {
        if (!targetWindow) return;

        try {
            if (
                targetWindow.layout &&
                targetWindow.layout.layout
            ) {
                targetWindow.layout.layout(true);
            }
        } catch (_) {}

        try {
            if (
                targetWindow.layout &&
                targetWindow.layout.resize
            ) {
                targetWindow.layout.resize();
            }
        } catch (_) {}

        try {
            targetWindow.update();
        } catch (_) {}
    }

    function compactLocationValue(
        targetWindow
    ) {
        try {
            return [
                Number(targetWindow.location[0]),
                Number(targetWindow.location[1])
            ];
        } catch (_) {
            return null;
        }
    }

    function validCompactLocation(
        value
    ) {
        return Boolean(
            value &&
            value.length >= 2 &&
            isFinite(Number(value[0])) &&
            isFinite(Number(value[1]))
        );
    }

    function ensurePresetUIState() {
        if (
            !presetStore.uiState ||
            typeof presetStore.uiState !==
                "object"
        ) {
            presetStore.uiState = {
                compactMode: false,
                mainLocation: null,
                compactLocation: null
            };
        }

        return presetStore.uiState;
    }

    function rememberCompactUIState(
        isCompact
    ) {
        var uiState =
            ensurePresetUIState();

        uiState.compactMode =
            Boolean(isCompact);

        if (isCompact) {
            var compactLocation =
                compactLocationValue(
                    compactWindow
                );

            if (compactLocation) {
                uiState.compactLocation =
                    compactLocation;
            }
        } else {
            var fullLocation =
                compactLocationValue(w);

            if (fullLocation) {
                uiState.mainLocation =
                    fullLocation;
            }
        }
    }

    function syncCompactPresetSelection() {
        if (!compactPresetDropdown) {
            return;
        }

        compactPresetDropdownIsUpdating =
            true;

        try {
            for (
                var itemIndex = 0;
                itemIndex <
                    compactPresetDropdown
                        .items.length;
                itemIndex++
            ) {
                var item =
                    compactPresetDropdown
                        .items[itemIndex];

                if (
                    item.presetId ===
                    currentPresetId
                ) {
                    compactPresetDropdown
                        .selection =
                        itemIndex;
                    break;
                }
            }
        } catch (_) {}

        compactPresetDropdownIsUpdating =
            false;
    }

    function syncCompactControls() {
        try {
            compactMetrics.text =
                fMetrics.text;
        } catch (_) {}

        try {
            compactColumns.text =
                fGridGroupH.text;
        } catch (_) {}

        try {
            compactRows.text =
                fGridGroupV.text;
        } catch (_) {}

        try {
            compactPreviewCheckbox.value =
                previewCheckbox.value;
        } catch (_) {}

        syncCompactPresetSelection();
    }

    function setCompactMode(
        value,
        suppressStateWrite
    ) {
        compactMode = Boolean(value);
        syncCompactControls();

        if (compactMode) {
            var mainLocation =
                compactLocationValue(w);

            if (mainLocation) {
                mainWindowLocation =
                    mainLocation;
            }

            // Compact View opens exactly where Full Settings was positioned.
            try {
                if (mainLocation) {
                    compactWindow.location =
                        mainLocation;
                }
            } catch (_) {}

            // Compact View is primarily a live layout-inspection mode.
            if (!previewCheckbox.value) {
                previewCheckbox.value = true;
                compactPreviewCheckbox.value =
                    true;
                previewFirstOpen = true;
                schedulePreviewUpdate(50);
            }

            try { w.hide(); } catch (_) {}

            if (
                !activeEmetricInputField()
            ) {
                setPrimaryCreateEnabled(true);
            }

            try {
                compactWindow.show();
            } catch (_) {}

            refreshEmetricWindow(
                compactWindow
            );

            try {
                compactMetrics.active = true;
                compactMetrics.selection = [
                    0,
                    String(
                        compactMetrics.text
                    ).length
                ];
            } catch (_) {}

            rememberCompactUIState(true);
        } else {
            var compactLocation =
                compactLocationValue(
                    compactWindow
                );

            try {
                compactWindow.hide();
            } catch (_) {}

            try {
                if (compactLocation) {
                    w.location =
                        compactLocation;
                } else if (
                    mainWindowLocation
                ) {
                    w.location =
                        mainWindowLocation;
                }
            } catch (_) {}

            if (
                !activeEmetricInputField()
            ) {
                setPrimaryCreateEnabled(true);
            }

            try {
                w.show();
            } catch (_) {}

            refreshEmetricWindow(w);
            restoreInputFocus();
            rememberCompactUIState(false);
        }

        if (
            !suppressStateWrite &&
            presetSystemReady
        ) {
            writePresetStore(false);
        }
    }

    var previewDocument = null;
    var previewIdleTask = null;
    var previewIsUpdating = false;
    var previewUpdatePending = false;
    var previewClosing = false;
    var previewFirstOpen = true;
    var PREVIEW_DELAY_MS = 400;
    var PREVIEW_IDLE_TASK_NAME = "Emetric Preview Update";

    var lastActiveInputIndex = 0;
    var lastActiveSelection = null;
    var lastActiveUIField = null;
    var focusRestoreIdleTask = null;
    var FOCUS_RESTORE_TASK_NAME = "Emetric Restore Input Focus";

    function presetTrim(value) {
        return String(value || "")
            .replace(/^\s+|\s+$/g, "");
    }

    function presetEscapeJSONString(value) {
        return String(value)
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\r/g, "\\r")
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t")
            .replace(/\f/g, "\\f")
            .replace(/\x08/g, "\\b");
    }

    function presetJSONStringify(value, stable) {
        if (
            !stable &&
            typeof JSON !== "undefined" &&
            JSON &&
            JSON.stringify
        ) {
            try {
                return JSON.stringify(value, null, 2);
            } catch (_) {}
        }

        function encode(item) {
            if (item === null) {
                return "null";
            }

            var itemType = typeof item;

            if (itemType === "string") {
                return '"' +
                    presetEscapeJSONString(item) +
                    '"';
            }

            if (itemType === "number") {
                return isFinite(item)
                    ? String(item)
                    : "null";
            }

            if (itemType === "boolean") {
                return item ? "true" : "false";
            }

            if (item instanceof Array) {
                var arrayItems = [];

                for (
                    var arrayIndex = 0;
                    arrayIndex < item.length;
                    arrayIndex++
                ) {
                    arrayItems.push(
                        encode(item[arrayIndex])
                    );
                }

                return "[" +
                    arrayItems.join(",") +
                    "]";
            }

            if (itemType === "object") {
                var keys = [];

                for (var key in item) {
                    if (
                        item.hasOwnProperty &&
                        !item.hasOwnProperty(key)
                    ) {
                        continue;
                    }

                    keys.push(key);
                }

                if (stable) {
                    keys.sort();
                }

                var properties = [];

                for (
                    var keyIndex = 0;
                    keyIndex < keys.length;
                    keyIndex++
                ) {
                    var propertyName =
                        keys[keyIndex];

                    if (
                        typeof item[propertyName] ===
                        "undefined"
                    ) {
                        continue;
                    }

                    properties.push(
                        '"' +
                        presetEscapeJSONString(
                            propertyName
                        ) +
                        '":' +
                        encode(
                            item[propertyName]
                        )
                    );
                }

                return "{" +
                    properties.join(",") +
                    "}";
            }

            return "null";
        }

        return encode(value);
    }

    function presetJSONParse(text) {
        if (
            typeof JSON !== "undefined" &&
            JSON &&
            JSON.parse
        ) {
            try {
                return JSON.parse(text);
            } catch (_) {}
        }

        // The file is written exclusively by Emetric. This fallback supports
        // older ExtendScript engines without a native JSON implementation.
        return eval("(" + String(text) + ")");
    }

    function clonePresetValue(value) {
        try {
            return presetJSONParse(
                presetJSONStringify(
                    value,
                    false
                )
            );
        } catch (_) {
            return value;
        }
    }

    function presetStableString(value) {
        return presetJSONStringify(
            value,
            true
        );
    }

    function presetSettingsEqual(a, b) {
        try {
            return (
                presetStableString(a) ===
                presetStableString(b)
            );
        } catch (_) {
            return false;
        }
    }

    function presetStorageFile(createFolder) {
        try {
            var baseFolder =
                Folder.userData;

            if (
                !baseFolder ||
                !baseFolder.exists
            ) {
                return null;
            }

            var folder =
                new Folder(
                    baseFolder.fullName +
                    "/" +
                    PRESET_FOLDER_NAME
                );

            if (
                createFolder &&
                !folder.exists
            ) {
                folder.create();
            }

            if (!folder.exists) {
                return null;
            }

            return new File(
                folder.fullName +
                "/" +
                PRESET_FILE_NAME
            );
        } catch (_) {
            return null;
        }
    }

    function normalizePresetStore(rawStore) {
        var normalized = {
            formatVersion:
                PRESET_FORMAT_VERSION,
            lastUsed: null,
            presets: [],
            uiState: {
                compactMode: false,
                mainLocation: null,
                compactLocation: null
            }
        };

        if (
            !rawStore ||
            typeof rawStore !== "object"
        ) {
            return normalized;
        }

        if (
            rawStore.lastUsed &&
            typeof rawStore.lastUsed ===
                "object"
        ) {
            normalized.lastUsed =
                rawStore.lastUsed;
        }

        if (
            rawStore.uiState &&
            typeof rawStore.uiState ===
                "object"
        ) {
            normalized.uiState.compactMode =
                Boolean(
                    rawStore.uiState
                        .compactMode
                );

            if (
                rawStore.uiState
                    .mainLocation &&
                rawStore.uiState
                    .mainLocation.length >= 2
            ) {
                normalized.uiState
                    .mainLocation = [
                        Number(
                            rawStore.uiState
                                .mainLocation[0]
                        ),
                        Number(
                            rawStore.uiState
                                .mainLocation[1]
                        )
                    ];
            }

            if (
                rawStore.uiState
                    .compactLocation &&
                rawStore.uiState
                    .compactLocation
                    .length >= 2
            ) {
                normalized.uiState
                    .compactLocation = [
                        Number(
                            rawStore.uiState
                                .compactLocation[0]
                        ),
                        Number(
                            rawStore.uiState
                                .compactLocation[1]
                        )
                    ];
            }
        }

        var seenNames = {};
        var rawPresets =
            rawStore.presets instanceof Array
                ? rawStore.presets
                : [];

        for (
            var presetIndex = 0;
            presetIndex < rawPresets.length;
            presetIndex++
        ) {
            var rawPreset =
                rawPresets[presetIndex];

            if (
                !rawPreset ||
                typeof rawPreset !== "object"
            ) {
                continue;
            }

            var presetName =
                presetTrim(rawPreset.name);

            if (
                !presetName ||
                !rawPreset.settings ||
                typeof rawPreset.settings !==
                    "object"
            ) {
                continue;
            }

            var normalizedName =
                presetName.toLowerCase();

            if (seenNames[normalizedName]) {
                continue;
            }

            seenNames[normalizedName] = true;

            normalized.presets.push({
                name: presetName,
                settings:
                    rawPreset.settings
            });
        }

        normalized.presets.sort(
            function (a, b) {
                var nameA =
                    String(a.name).toLowerCase();
                var nameB =
                    String(b.name).toLowerCase();

                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            }
        );

        return normalized;
    }

    function loadPresetStore() {
        var file =
            presetStorageFile(false);

        if (
            !file ||
            !file.exists
        ) {
            return normalizePresetStore(null);
        }

        try {
            file.encoding = "UTF-8";

            if (!file.open("r")) {
                return normalizePresetStore(null);
            }

            var contents = file.read();
            file.close();

            return normalizePresetStore(
                presetJSONParse(contents)
            );
        } catch (_) {
            try {
                if (file.opened) {
                    file.close();
                }
            } catch (__) {}

            return normalizePresetStore(null);
        }
    }

    function writePresetStore(showErrors) {
        var file =
            presetStorageFile(true);

        if (!file) {
            if (showErrors) {
                alert(
                    "Emetric could not access the preset folder.",
                    SCRIPT_NAME
                );
            }

            return false;
        }

        try {
            file.encoding = "UTF-8";
            file.lineFeed = "Unix";

            if (!file.open("w")) {
                throw new Error(
                    "The preset file could not be opened for writing."
                );
            }

            file.write(
                presetJSONStringify(
                    presetStore,
                    false
                )
            );
            file.close();
            return true;
        } catch (error) {
            try {
                if (file.opened) {
                    file.close();
                }
            } catch (_) {}

            reportDiagnosticError(
                "Save preset data",
                error,
                "The preset could not be saved.",
                Boolean(showErrors)
            );

            return false;
        }
    }

    function selectedDropdownText(dropdown) {
        try {
            return dropdown.selection
                ? String(
                    dropdown.selection.text
                )
                : "";
        } catch (_) {
            return "";
        }
    }

    function capturePresetSettings() {
        return {
            formatVersion:
                PRESET_FORMAT_VERSION,

            unitIndex:
                Number(currentUnitIndex),

            metricSourceKey:
                selectedMetricSourceKey(),

            fontFamily:
                selectedDropdownText(
                    fontFamilyDropdown
                ),
            fontStyle:
                selectedDropdownText(
                    fontStyleDropdown
                ),

            customMetric: {
                metrics:
                    String(
                        customRatioMetrics.text
                    ),
                ascender:
                    String(
                        customRatioAscender.text
                    ),
                capHeight:
                    String(
                        customRatioCapHeight.text
                    ),
                xHeight:
                    String(
                        customRatioXHeight.text
                    ),
                descender:
                    String(
                        customRatioDescender.text
                    )
            },

            typeSize: {
                metrics:
                    String(fMetrics.text),
                ratioMetrics:
                    String(
                        fMetricsLine.a.text
                    ),
                ratioLeading:
                    String(
                        fMetricsLine.b.text
                    ),
                exactLeadingMM:
                    exactLineSpaceMM === null ||
                    exactLineSpaceMM ===
                        undefined
                        ? null
                        : Number(
                            exactLineSpaceMM
                        )
            },

            rowGrid: {
                group:
                    String(
                        fVerticalGroup.text
                    ),
                offsetSource:
                    rowOffsetSource.selection
                        ? Number(
                            rowOffsetSource
                                .selection
                                .index
                        )
                        : 3,
                gridLines:
                    Boolean(
                        majorGridHorizontalCheckbox
                            .value
                    ),
                gutterGuides:
                    Boolean(
                        guideRowsCheckbox.value
                    )
            },

            columnGrid: {
                group:
                    String(
                        fHorizontalGroup.text
                    ),
                offsetSource:
                    columnOffsetSource.selection
                        ? Number(
                            columnOffsetSource
                                .selection
                                .index
                        )
                        : 3,
                gridLines:
                    Boolean(
                        majorGridVerticalCheckbox
                            .value
                    ),
                gutterGuides:
                    Boolean(
                        guideColumnsCheckbox.value
                    )
            },

            gridModules: {
                columns:
                    String(
                        fGridGroupH.text
                    ),
                rows:
                    String(
                        fGridGroupV.text
                    ),
                ratioHorizontal:
                    String(
                        fGridRatio.a.text
                    ),
                ratioVertical:
                    String(
                        fGridRatio.b.text
                    ),
                exactRows:
                    exactGridRows === null ||
                    exactGridRows === undefined
                        ? null
                        : Number(
                            exactGridRows
                        )
            },

            margins: {
                top:
                    String(
                        fMarginTop.factor.text
                    ),
                bottom:
                    String(
                        fMarginBottom.factor.text
                    ),
                left:
                    String(
                        fMarginLeft.factor.text
                    ),
                right:
                    String(
                        fMarginRight.factor.text
                    )
            },

            pageDimensions: {
                exactWidthMM:
                    exactPageWidthMM === null ||
                    exactPageWidthMM === undefined
                        ? null
                        : Number(
                            exactPageWidthMM
                        ),
                exactHeightMM:
                    exactPageHeightMM === null ||
                    exactPageHeightMM === undefined
                        ? null
                        : Number(
                            exactPageHeightMM
                        )
            },

            colors: {
                guides:
                    guideColorSelector.getHex(),
                margins:
                    marginColorSelector.getHex(),
                columns:
                    columnColorSelector.getHex(),
                baseline:
                    baselineGridColorSelector
                        .getHex(),
                document:
                    documentGridColorSelector
                        .getHex()
            },

            documentOptions: {
                facingPages:
                    Boolean(facingPages.value),
                anamorphicFormat:
                    Boolean(anamorphicFormat.value),
                lockFormatRatio:
                    Boolean(lockFormatRatio.value),
                useAMaster:
                    Boolean(useAMaster.value),
                indexPage:
                    Boolean(infoPage.value),
                placeholderText:
                    Boolean(
                        placeholderText.value
                    ),
                applyColumnGutters:
                    Boolean(
                        columnGuidesCheckbox
                            .value
                    ),
                snapToGrid:
                    Boolean(snapToGrid.value),
                snapToGuides:
                    Boolean(
                        snapToGuides.value
                    ),
                gridsInBack:
                    Boolean(gridsInBack.value)
            }
        };
    }

    function findMetricSourceIndex(sourceKey) {
        for (
            var sourceIndex = 0;
            sourceIndex <
                metricsSourceDropdown
                    .items.length;
            sourceIndex++
        ) {
            try {
                if (
                    metricsSourceDropdown
                        .items[sourceIndex]
                        .emetricSourceKey ===
                    sourceKey
                ) {
                    return sourceIndex;
                }
            } catch (_) {}
        }

        return 0;
    }

    function selectDropdownText(
        dropdown,
        requestedText
    ) {
        var target =
            String(
                requestedText || ""
            ).toLowerCase();

        if (!target) {
            return false;
        }

        for (
            var itemIndex = 0;
            itemIndex < dropdown.items.length;
            itemIndex++
        ) {
            try {
                if (
                    String(
                        dropdown
                            .items[itemIndex]
                            .text
                    ).toLowerCase() ===
                    target
                ) {
                    dropdown.selection =
                        itemIndex;
                    return true;
                }
            } catch (_) {}
        }

        return false;
    }

    function selectPresetFont(
        familyName,
        styleName
    ) {
        fontSelectionIsUpdating = true;

        try {
            selectDropdownText(
                fontFamilyDropdown,
                familyName
            );
        } catch (_) {}

        fontSelectionIsUpdating = false;
        populateFontStyles();
        fontSelectionIsUpdating = true;

        try {
            selectDropdownText(
                fontStyleDropdown,
                styleName
            );
        } catch (_) {}

        fontSelectionIsUpdating = false;
    }

    function matchingColorProfileIndex(
        colors
    ) {
        if (!colors) return -1;

        function normalized(value) {
            return normalizeHex(
                value,
                "#000000"
            );
        }

        for (
            var profileIndex = 0;
            profileIndex <
                COLOR_PROFILES.length;
            profileIndex++
        ) {
            var profile =
                COLOR_PROFILES[
                    profileIndex
                ];

            if (
                normalized(profile.guides) ===
                    normalized(
                        colors.guides
                    ) &&
                normalized(profile.margins) ===
                    normalized(
                        colors.margins
                    ) &&
                normalized(profile.columns) ===
                    normalized(
                        colors.columns
                    ) &&
                normalized(profile.baseline) ===
                    normalized(
                        colors.baseline
                    ) &&
                normalized(profile.document) ===
                    normalized(
                        colors.document
                    )
            ) {
                return profileIndex;
            }
        }

        return -1;
    }

    function applyPresetColors(colors) {
        if (!colors) return;

        applyingProfile = true;

        guideColorSelector.set(
            colors.guides
        );
        marginColorSelector.set(
            colors.margins
        );
        columnColorSelector.set(
            colors.columns
        );
        baselineGridColorSelector.set(
            colors.baseline
        );
        documentGridColorSelector.set(
            colors.document
        );

        removeCustomProfileStatus();

        var matchingIndex =
            matchingColorProfileIndex(colors);

        if (matchingIndex >= 0) {
            colorProfileDropdown.selection =
                matchingIndex;
        } else {
            customProfileItem =
                colorProfileDropdown.add(
                    "item",
                    "Custom Theme"
                );
            colorProfileDropdown.selection =
                customProfileItem;
        }

        applyingProfile = false;
    }

    function applyPresetSettings(
        settings,
        presetId
    ) {
        if (
            !settings ||
            typeof settings !== "object"
        ) {
            return false;
        }

        setDiagnosticAction(
            "Apply preset: " +
            String(
                presetId || "default"
            ),
            true
        );

        presetIsApplying = true;
        cancelPreviewUpdate();

        try {
            var requestedUnit =
                Number(settings.unitIndex);

            if (
                !(requestedUnit >= 0) ||
                requestedUnit >=
                    UNIT_OPTIONS.length
            ) {
                requestedUnit = 0;
            }

            currentUnitIndex =
                requestedUnit;
            unitDropdown.selection =
                requestedUnit;

            var custom =
                settings.customMetric || {};

            customRatioMetrics.text =
                String(
                    custom.metrics !==
                        undefined
                        ? custom.metrics
                        : "12"
                );
            customRatioAscender.text =
                String(
                    custom.ascender !==
                        undefined
                        ? custom.ascender
                        : "8"
                );
            customRatioCapHeight.text =
                String(
                    custom.capHeight !==
                        undefined
                        ? custom.capHeight
                        : "7"
                );
            customRatioXHeight.text =
                String(
                    custom.xHeight !==
                        undefined
                        ? custom.xHeight
                        : "5"
                );
            customRatioDescender.text =
                String(
                    custom.descender !==
                        undefined
                        ? custom.descender
                        : "-3"
                );

            selectPresetFont(
                settings.fontFamily,
                settings.fontStyle
            );

            var sourceKey =
                String(
                    settings
                        .metricSourceKey ||
                    "selectedFont"
                );

            if (
                sourceKey !== "selectedFont" &&
                sourceKey !== "decimal" &&
                sourceKey !== "dozenal" &&
                sourceKey !== "custom"
            ) {
                sourceKey = "selectedFont";
            }

            var sourceIndex =
                findMetricSourceIndex(
                    sourceKey
                );

            metricsSourceDropdown.selection =
                sourceIndex;
            lastValidMetricSourceIndex =
                sourceIndex;
            lastValidMetricSourceKey =
                sourceKey;

            if (
                sourceKey ===
                "selectedFont"
            ) {
                setFontControlsEnabled(true);
                setCustomRatioControlsEnabled(
                    false
                );
                activateSelectedFontMetrics(
                    false
                );
            } else if (
                sourceKey === "custom"
            ) {
                selectedFontMetrics = null;
                setFontControlsEnabled(false);
                setCustomRatioControlsEnabled(
                    true
                );
                setTypeRatios(
                    customRatiosFromFields()
                );
                fontMetricsStatus.text =
                    "Using Custom Metric";
            } else {
                activateEmetricSource(
                    sourceKey
                );
            }

            var typeSize =
                settings.typeSize || {};

            fMetrics.text =
                String(
                    typeSize.metrics !==
                        undefined
                        ? typeSize.metrics
                        : formatMeasureValue(
                            4,
                            currentUnitIndex
                        )
                );
            fMetricsLine.a.text =
                String(
                    typeSize.ratioMetrics !==
                        undefined
                        ? typeSize.ratioMetrics
                        : "4"
                );
            fMetricsLine.b.text =
                String(
                    typeSize.ratioLeading !==
                        undefined
                        ? typeSize.ratioLeading
                        : "5"
                );

            exactLineSpaceMM =
                typeSize.exactLeadingMM ===
                    null ||
                typeSize.exactLeadingMM ===
                    undefined
                    ? null
                    : Number(
                        typeSize
                            .exactLeadingMM
                    );

            var rowGrid =
                settings.rowGrid || {};
            var columnGrid =
                settings.columnGrid || {};
            var gridModules =
                settings.gridModules || {};
            var margins =
                settings.margins || {};
            var pageDimensions =
                settings.pageDimensions || {};
            var documentOptions =
                settings.documentOptions ||
                {};

            fVerticalGroup.text =
                String(
                    rowGrid.group !==
                        undefined
                        ? rowGrid.group
                        : "6"
                );
            fHorizontalGroup.text =
                String(
                    columnGrid.group !==
                        undefined
                        ? columnGrid.group
                        : "6"
                );

            var rowOffsetIndex =
                Number(
                    rowGrid.offsetSource !==
                        undefined
                        ? rowGrid.offsetSource
                        : 3
                );
            var columnOffsetIndex =
                Number(
                    columnGrid
                        .offsetSource !==
                        undefined
                        ? columnGrid
                            .offsetSource
                        : 3
                );

            if (
                !(rowOffsetIndex >= 0) ||
                rowOffsetIndex >=
                    rowOffsetSource.items.length
            ) {
                rowOffsetIndex = 3;
            }

            if (
                !(columnOffsetIndex >= 0) ||
                columnOffsetIndex >=
                    columnOffsetSource.items.length
            ) {
                columnOffsetIndex = 3;
            }

            rowOffsetSource.selection =
                rowOffsetIndex;
            columnOffsetSource.selection =
                columnOffsetIndex;

            fGridGroupH.text =
                String(
                    gridModules.columns !==
                        undefined
                        ? gridModules.columns
                        : "6"
                );
            fGridGroupV.text =
                String(
                    gridModules.rows !==
                        undefined
                        ? gridModules.rows
                        : "9"
                );
            fGridRatio.a.text =
                String(
                    gridModules
                        .ratioHorizontal !==
                        undefined
                        ? gridModules
                            .ratioHorizontal
                        : "2"
                );
            fGridRatio.b.text =
                String(
                    gridModules
                        .ratioVertical !==
                        undefined
                        ? gridModules
                            .ratioVertical
                        : "3"
                );

            exactGridRows =
                gridModules.exactRows ===
                    null ||
                gridModules.exactRows ===
                    undefined
                    ? null
                    : Number(
                        gridModules
                            .exactRows
                    );

            exactPageWidthMM =
                pageDimensions.exactWidthMM ===
                    null ||
                pageDimensions.exactWidthMM ===
                    undefined
                    ? null
                    : Number(
                        pageDimensions
                            .exactWidthMM
                    );
            exactPageHeightMM =
                pageDimensions.exactHeightMM ===
                    null ||
                pageDimensions.exactHeightMM ===
                    undefined
                    ? null
                    : Number(
                        pageDimensions
                            .exactHeightMM
                    );

            if (
                exactPageHeightMM !== null &&
                Boolean(
                    documentOptions
                        .anamorphicFormat
                )
            ) {
                exactLineSpaceMM = null;
            }

            fMarginTop.factor.text =
                String(
                    margins.top !== undefined
                        ? margins.top
                        : "1"
                );
            fMarginBottom.factor.text =
                String(
                    margins.bottom !==
                        undefined
                        ? margins.bottom
                        : "1"
                );
            fMarginLeft.factor.text =
                String(
                    margins.left !==
                        undefined
                        ? margins.left
                        : "1"
                );
            fMarginRight.factor.text =
                String(
                    margins.right !==
                        undefined
                        ? margins.right
                        : "1"
                );

            facingPages.value =
                Boolean(
                    documentOptions
                        .facingPages
                );
            anamorphicFormat.value =
                Boolean(
                    documentOptions
                        .anamorphicFormat
                );
            lockFormatRatio.value =
                Boolean(
                    documentOptions
                        .lockFormatRatio
                );
            if (!anamorphicFormat.value) {
                exactPageWidthMM = null;
                exactPageHeightMM = null;
            }
            updateAnamorphicFormatControls();
            useAMaster.value =
                documentOptions
                    .useAMaster ===
                    undefined
                    ? true
                    : Boolean(
                        documentOptions
                            .useAMaster
                    );
            infoPage.value =
                Boolean(
                    documentOptions
                        .indexPage
                );
            columnGuidesCheckbox.value =
                documentOptions
                    .applyColumnGutters ===
                    undefined
                    ? true
                    : Boolean(
                        documentOptions
                            .applyColumnGutters
                    );
            snapToGrid.value =
                documentOptions
                    .snapToGrid ===
                    undefined
                    ? true
                    : Boolean(
                        documentOptions
                            .snapToGrid
                    );
            snapToGuides.value =
                documentOptions
                    .snapToGuides ===
                    undefined
                    ? true
                    : Boolean(
                        documentOptions
                            .snapToGuides
                    );
            gridsInBack.value =
                documentOptions
                    .gridsInBack ===
                    undefined
                    ? true
                    : Boolean(
                        documentOptions
                            .gridsInBack
                    );

            majorGridHorizontalCheckbox.value =
                Boolean(
                    rowGrid.gridLines
                );
            guideRowsCheckbox.value =
                rowGrid.gutterGuides ===
                    undefined
                    ? true
                    : Boolean(
                        rowGrid
                            .gutterGuides
                    );
            majorGridVerticalCheckbox.value =
                Boolean(
                    columnGrid.gridLines
                );
            guideColumnsCheckbox.value =
                columnGrid.gutterGuides ===
                    undefined
                    ? true
                    : Boolean(
                        columnGrid
                            .gutterGuides
                    );

            updatePlaceholderTextAvailability();

            placeholderText.value =
                placeholderText.enabled &&
                Boolean(
                    documentOptions
                        .placeholderText
                );

            applyPresetColors(
                settings.colors
            );

            updateMarginLabels();
            updateUnitLabels();
            update();
            syncCompactControls();
            layoutMainWindow();

            currentPresetId =
                presetId || "default";
            currentPresetBaseline =
                capturePresetSettings();

            try {
                resetButton.enabled =
                    currentPresetId !==
                    "default";
            } catch (_) {}
        } catch (error) {
            presetIsApplying = false;

            reportDiagnosticError(
                diagnosticLastAction,
                error,
                "The preset could not be applied.",
                true
            );

            return false;
        }

        presetIsApplying = false;
        rebuildPresetDropdown(
            currentPresetId
        );
        updatePresetModifiedState();

        if (previewCheckbox.value) {
            updatePreviewDocument();
        }

        return true;
    }

    function presetByName(name) {
        var target =
            presetTrim(name).toLowerCase();

        for (
            var presetIndex = 0;
            presetIndex <
                presetStore.presets.length;
            presetIndex++
        ) {
            if (
                String(
                    presetStore
                        .presets[presetIndex]
                        .name
                ).toLowerCase() ===
                target
            ) {
                return presetStore
                    .presets[
                        presetIndex
                    ];
            }
        }

        return null;
    }

    function presetSettingsForId(
        presetId
    ) {
        if (presetId === "default") {
            return defaultPresetSettings;
        }

        if (presetId === "lastUsed") {
            return presetStore.lastUsed;
        }

        if (
            String(presetId).indexOf(
                "user:"
            ) === 0
        ) {
            var presetName =
                String(presetId)
                    .substring(5);
            var preset =
                presetByName(presetName);

            return preset
                ? preset.settings
                : null;
        }

        return null;
    }

    function currentUserPresetName() {
        if (
            String(currentPresetId)
                .indexOf("user:") === 0
        ) {
            return String(
                currentPresetId
            ).substring(5);
        }

        return "";
    }

    function rebuildCompactPresetDropdown(
        selectedId
    ) {
        compactPresetDropdownIsUpdating =
            true;

        try {
            compactPresetDropdown
                .removeAll();

            var defaultItem =
                compactPresetDropdown.add(
                    "item",
                    "Default"
                );
            defaultItem.presetId =
                "default";
            defaultItem.presetBaseText =
                "Default";

            var lastUsedItem =
                compactPresetDropdown.add(
                    "item",
                    "Last Used"
                );
            lastUsedItem.presetId =
                "lastUsed";
            lastUsedItem.presetBaseText =
                "Last Used";

            try {
                lastUsedItem.enabled =
                    Boolean(
                        presetStore.lastUsed
                    );
            } catch (_) {}

            if (
                presetStore.presets.length >
                0
            ) {
                compactPresetDropdown.add(
                    "separator"
                );

                for (
                    var presetIndex = 0;
                    presetIndex <
                        presetStore.presets
                            .length;
                    presetIndex++
                ) {
                    var preset =
                        presetStore.presets[
                            presetIndex
                        ];
                    var item =
                        compactPresetDropdown.add(
                            "item",
                            preset.name
                        );

                    item.presetId =
                        "user:" +
                        preset.name;
                    item.presetBaseText =
                        preset.name;
                }
            }

            var desiredId =
                selectedId ||
                currentPresetId ||
                "default";

            for (
                var itemIndex = 0;
                itemIndex <
                    compactPresetDropdown
                        .items.length;
                itemIndex++
            ) {
                if (
                    compactPresetDropdown
                        .items[itemIndex]
                        .presetId ===
                    desiredId
                ) {
                    compactPresetDropdown
                        .selection =
                        itemIndex;
                    break;
                }
            }
        } catch (_) {}

        compactPresetDropdownIsUpdating =
            false;
    }

    function rebuildPresetDropdown(
        selectedId
    ) {
        presetDropdownIsUpdating = true;

        try {
            presetDropdown.removeAll();

            var defaultItem =
                presetDropdown.add(
                    "item",
                    "Default"
                );
            defaultItem.presetId =
                "default";
            defaultItem.presetBaseText =
                "Default";

            var lastUsedItem =
                presetDropdown.add(
                    "item",
                    "Last Used"
                );
            lastUsedItem.presetId =
                "lastUsed";
            lastUsedItem.presetBaseText =
                "Last Used";

            try {
                lastUsedItem.enabled =
                    Boolean(
                        presetStore
                            .lastUsed
                    );
            } catch (_) {}

            if (
                presetStore.presets.length >
                0
            ) {
                presetDropdown.add(
                    "separator"
                );

                for (
                    var presetIndex = 0;
                    presetIndex <
                        presetStore
                            .presets.length;
                    presetIndex++
                ) {
                    var preset =
                        presetStore
                            .presets[
                                presetIndex
                            ];
                    var item =
                        presetDropdown.add(
                            "item",
                            preset.name
                        );

                    item.presetId =
                        "user:" +
                        preset.name;
                    item.presetBaseText =
                        preset.name;
                }
            }

            var desiredId =
                selectedId ||
                currentPresetId ||
                "default";
            var selectedIndex = 0;

            for (
                var itemIndex = 0;
                itemIndex <
                    presetDropdown
                        .items.length;
                itemIndex++
            ) {
                try {
                    if (
                        presetDropdown
                            .items[itemIndex]
                            .presetId ===
                        desiredId
                    ) {
                        selectedIndex =
                            itemIndex;
                        break;
                    }
                } catch (_) {}
            }

            presetDropdown.selection =
                selectedIndex;

            currentPresetId =
                presetDropdown.selection &&
                presetDropdown.selection
                    .presetId
                    ? presetDropdown
                        .selection
                        .presetId
                    : "default";
        } catch (_) {}

        presetDropdownIsUpdating = false;

        rebuildCompactPresetDropdown(
            currentPresetId
        );
        updatePresetDeleteButton();
    }

    function updatePresetDeleteButton() {
        try {
            presetDeleteButton.enabled =
                String(currentPresetId)
                    .indexOf("user:") ===
                0;
        } catch (_) {}

        if (
            !presetDeleteButton.enabled
        ) {
            presetDeleteButton
                .emetricHovered = false;
            presetDeleteButton
                .emetricPressed = false;
        }

        refreshPresetIconControl(
            presetDeleteButton
        );
    }

    function updatePresetModifiedState() {
        if (
            !presetSystemReady ||
            presetIsApplying ||
            !currentPresetBaseline
        ) {
            return;
        }

        var modified =
            !presetSettingsEqual(
                capturePresetSettings(),
                currentPresetBaseline
            );

        function setModifiedText(
            dropdown
        ) {
            try {
                var selectedItem =
                    dropdown.selection;

                if (
                    selectedItem &&
                    selectedItem.presetId
                ) {
                    var baseText =
                        selectedItem
                            .presetBaseText ||
                        selectedItem.text;

                    selectedItem.text =
                        modified
                            ? baseText +
                                " — Modified"
                            : baseText;
                }
            } catch (_) {}
        }

        setModifiedText(
            presetDropdown
        );
        setModifiedText(
            compactPresetDropdown
        );

        try {
            resetButton.enabled =
                modified ||
                currentPresetId !==
                    "default";
        } catch (_) {}
    }

    function removePresetLastUsedIdleTask() {
        if (!presetLastUsedIdleTask) {
            return;
        }

        try {
            presetLastUsedIdleTask
                .removeEventListener(
                    IdleEvent.ON_IDLE,
                    handlePresetLastUsedIdle
                );
        } catch (_) {
            try {
                presetLastUsedIdleTask
                    .removeEventListener(
                        "onIdle",
                        handlePresetLastUsedIdle
                    );
            } catch (__) {}
        }

        try {
            if (
                presetLastUsedIdleTask
                    .isValid
            ) {
                presetLastUsedIdleTask
                    .remove();
            }
        } catch (_) {}

        presetLastUsedIdleTask = null;
    }

    function saveLastUsedPresetNow(
        showErrors
    ) {
        removePresetLastUsedIdleTask();

        if (
            !presetSystemReady ||
            presetIsApplying
        ) {
            return false;
        }

        var settings =
            capturePresetSettings();

        presetStore.lastUsed =
            clonePresetValue(settings);

        var saved =
            writePresetStore(
                Boolean(showErrors)
            );

        if (
            saved &&
            currentPresetId ===
                "lastUsed"
        ) {
            currentPresetBaseline =
                capturePresetSettings();
            updatePresetModifiedState();
        }

        return saved;
    }

    function handlePresetLastUsedIdle(
        event
    ) {
        saveLastUsedPresetNow(false);
    }

    function scheduleLastUsedPresetSave() {
        if (
            !presetSystemReady ||
            presetIsApplying
        ) {
            return;
        }

        removePresetLastUsedIdleTask();

        try {
            presetLastUsedIdleTask =
                app.idleTasks.add({
                    name:
                        PRESET_LAST_USED_IDLE_NAME,
                    sleep: 750
                });

            try {
                presetLastUsedIdleTask
                    .addEventListener(
                        IdleEvent.ON_IDLE,
                        handlePresetLastUsedIdle
                    );
            } catch (_) {
                presetLastUsedIdleTask
                    .addEventListener(
                        "onIdle",
                        handlePresetLastUsedIdle
                    );
            }
        } catch (_) {
            presetLastUsedIdleTask = null;
        }
    }

    function promptPresetName(
        initialName
    ) {
        var dialog =
            new Window(
                "dialog",
                "Save Preset"
            );

        dialog.orientation = "column";
        dialog.alignChildren =
            ["fill", "top"];
        dialog.spacing = 10;
        dialog.margins = 14;

        var row =
            dialog.add("group");
        row.orientation = "row";
        row.alignChildren =
            ["left", "center"];
        row.spacing = 8;

        row.add(
            "statictext",
            undefined,
            "Name:"
        );

        var nameField =
            row.add(
                "edittext",
                undefined,
                String(
                    initialName || ""
                )
            );
        nameField.characters = 30;
        nameField.active = true;

        try {
            nameField.selection = [
                0,
                nameField.text.length
            ];
        } catch (_) {}

        var buttons =
            dialog.add("group");
        buttons.alignment =
            ["right", "center"];

        buttons.add(
            "button",
            undefined,
            "Cancel",
            { name: "cancel" }
        );

        buttons.add(
            "button",
            undefined,
            "Save",
            { name: "ok" }
        );

        if (dialog.show() !== 1) {
            return null;
        }

        return presetTrim(
            nameField.text
        );
    }

    function saveCurrentPreset() {
        setDiagnosticAction(
            "Save preset",
            true
        );

        var suggestedName =
            currentUserPresetName();

        var name =
            promptPresetName(
                suggestedName
            );

        if (name === null) {
            return;
        }

        if (!name) {
            alert(
                "Enter a name for the preset.",
                SCRIPT_NAME
            );
            return;
        }

        var normalizedName =
            name.toLowerCase();

        if (
            normalizedName ===
                "default" ||
            normalizedName ===
                "last used"
        ) {
            alert(
                "Default and Last Used are reserved names.",
                SCRIPT_NAME
            );
            return;
        }

        var existing =
            presetByName(name);

        if (
            existing &&
            !confirm(
                'Replace the preset "' +
                existing.name +
                '"?'
            )
        ) {
            return;
        }

        var settings =
            capturePresetSettings();

        if (existing) {
            existing.name = name;
            existing.settings =
                clonePresetValue(settings);
        } else {
            presetStore.presets.push({
                name: name,
                settings:
                    clonePresetValue(
                        settings
                    )
            });
        }

        presetStore.presets.sort(
            function (a, b) {
                var nameA =
                    String(a.name)
                        .toLowerCase();
                var nameB =
                    String(b.name)
                        .toLowerCase();

                if (nameA < nameB) {
                    return -1;
                }

                if (nameA > nameB) {
                    return 1;
                }

                return 0;
            }
        );

        presetStore.lastUsed =
            clonePresetValue(settings);

        if (!writePresetStore(true)) {
            return;
        }

        currentPresetId =
            "user:" + name;
        currentPresetBaseline =
            capturePresetSettings();

        rebuildPresetDropdown(
            currentPresetId
        );
        updatePresetModifiedState();
    }

    function deleteCurrentPreset() {
        setDiagnosticAction(
            "Delete preset",
            true
        );

        var presetName =
            currentUserPresetName();

        if (!presetName) {
            return;
        }

        if (
            !confirm(
                'Delete the preset "' +
                presetName +
                '"?'
            )
        ) {
            return;
        }

        var normalizedName =
            presetName.toLowerCase();
        var retained = [];

        for (
            var presetIndex = 0;
            presetIndex <
                presetStore.presets.length;
            presetIndex++
        ) {
            if (
                String(
                    presetStore
                        .presets[presetIndex]
                        .name
                ).toLowerCase() !==
                normalizedName
            ) {
                retained.push(
                    presetStore
                        .presets[
                            presetIndex
                        ]
                );
            }
        }

        presetStore.presets =
            retained;
        presetStore.lastUsed =
            clonePresetValue(
                capturePresetSettings()
            );

        if (!writePresetStore(true)) {
            return;
        }

        currentPresetId =
            "lastUsed";
        currentPresetBaseline =
            capturePresetSettings();

        rebuildPresetDropdown(
            currentPresetId
        );
        updatePresetModifiedState();
    }

    function initializePresetSystem() {
        presetStore =
            loadPresetStore();

        presetSystemReady = false;
        reset();

        defaultPresetSettings =
            capturePresetSettings();
        currentPresetId =
            "default";
        currentPresetBaseline =
            clonePresetValue(
                defaultPresetSettings
            );

        presetSystemReady = true;
        rebuildPresetDropdown(
            "default"
        );

        if (presetStore.lastUsed) {
            applyPresetSettings(
                presetStore.lastUsed,
                "lastUsed"
            );
        } else {
            updatePresetModifiedState();
        }
    }

    function markDirty() {
        try {
            resetButton.enabled = true;
        } catch (_) {}

        if (
            presetSystemReady &&
            !presetIsApplying
        ) {
            updatePresetModifiedState();
            scheduleLastUsedPresetSave();
        }
    }

    function updateUnitLabels() {
        var fields = [
            fMetrics,
            oAscender, oUppercase, oLowercase, oDescender, oLineSpace,
            oVerticalLine, oVerticalGridline, oVerticalOffset,
            oHorizontalLine, oHorizontalGridline, oHorizontalOffset,
            oGridMarginH, oGridMarginV, oGutterH, oGutterV,
            oGridWidth, oGridHeight,
            fMarginTop.result, fMarginBottom.result,
            fMarginLeft.result, fMarginRight.result,
            oTypeWidth, oTypeHeight, oIntersectionW, oIntersectionH,
            oPageWidth, oPageHeight, oSpread
        ];

        for (var i = 0; i < fields.length; i++) {
            try {
                if (fields[i].unitLabel) {
                    fields[i].unitLabel.text = "";
                }
            } catch (_) {}
        }
    }

    unitDropdown.onChange = function () {
        if (!unitDropdown.selection) return;

        var oldIndex = currentUnitIndex;
        var newIndex = unitDropdown.selection.index;

        if (newIndex !== oldIndex) {
            var currentMetricsMM =
                unitToMM(
                    parseMeasureInput(fMetrics.text, oldIndex, 4),
                    oldIndex
                );

            currentUnitIndex = newIndex;
            fMetrics.text =
                formatMeasureValue(currentMetricsMM, currentUnitIndex);

            updateUnitLabels();
            update();
            syncCompactControls();
            markDirty();
            updatePreviewDocument();
        }

        // Release the dropdown immediately and return to the last input field.
        try { unitDropdown.active = false; } catch (_) {}
        try {
            if (w.update) w.update();
        } catch (_) {}

        restoreInputFocus();
    };


    function cloneDefaultTypeRatios() {
        return {
            ascender: DOZENAL_TYPE_RATIOS.ascender,
            capHeight: DOZENAL_TYPE_RATIOS.capHeight,
            xHeight: DOZENAL_TYPE_RATIOS.xHeight,
            descender: DOZENAL_TYPE_RATIOS.descender
        };
    }

    function cloneDecimalTypeRatios() {
        return {
            ascender: DECIMAL_TYPE_RATIOS.ascender,
            capHeight: DECIMAL_TYPE_RATIOS.capHeight,
            xHeight: DECIMAL_TYPE_RATIOS.xHeight,
            descender: DECIMAL_TYPE_RATIOS.descender
        };
    }

    function setTypeRatios(ratios) {
        activeTypeRatios = {
            ascender: Number(ratios.ascender),
            capHeight: Number(ratios.capHeight),
            xHeight: Number(ratios.xHeight),
            descender: Number(ratios.descender)
        };
    }

    function applyFontToText(textObject, record, pointSize) {
        try {
            textObject.appliedFont = record.font;
        } catch (_) {
            try {
                textObject.appliedFont = record.family;
                textObject.fontStyle = record.style;
            } catch (__) {
                throw new Error(
                    "InDesign could not apply the selected font."
                );
            }
        }

        textObject.pointSize = pointSize;
        textObject.leading = pointSize * 1.2;
        textObject.baselineShift = 0;
        textObject.horizontalScale = 100;
        textObject.verticalScale = 100;
    }

    function createMetricFrame(doc, contents, record, firstBaselineOption) {
        var page = doc.pages[0];
        var frame = page.textFrames.add();

        frame.geometricBounds = [0, 0, 200, 300];
        frame.contents = contents;

        var preferences = frame.textFramePreferences;
        preferences.insetSpacing = [0, 0, 0, 0];
        preferences.verticalJustification =
            VerticalJustification.TOP_ALIGN;
        preferences.firstBaselineOffset = firstBaselineOption;
        preferences.minimumFirstBaselineOffset = 0;

        applyFontToText(frame.texts[0], record, 100);

        try { frame.parentStory.recompose(); } catch (_) {}
        try { doc.recompose(); } catch (_) {}

        if (frame.lines.length === 0) {
            throw new Error(
                "InDesign could not compose the metric sample."
            );
        }

        return frame;
    }

    function measureFirstBaselineMetric(
        doc,
        record,
        firstBaselineOption,
        sampleText
    ) {
        var frame = createMetricFrame(
            doc,
            sampleText,
            record,
            firstBaselineOption
        );

        try {
            var baseline = Number(frame.lines[0].baseline);
            var top = Number(frame.geometricBounds[0]);
            var value = baseline - top;

            if (!(value > 0)) {
                throw new Error(
                    "InDesign returned an invalid baseline metric."
                );
            }

            return value;
        } finally {
            try { frame.remove(); } catch (_) {}
        }
    }

    function outlineBottom(pageItem) {
        var bottom = null;

        try {
            var bounds = pageItem.geometricBounds;
            bottom = Number(bounds[2]);
        } catch (_) {}

        try {
            if (pageItem.pageItems && pageItem.pageItems.length > 0) {
                for (var i = 0; i < pageItem.pageItems.length; i++) {
                    var childBottom =
                        outlineBottom(pageItem.pageItems[i]);

                    if (
                        childBottom !== null &&
                        (bottom === null || childBottom > bottom)
                    ) {
                        bottom = childBottom;
                    }
                }
            }
        } catch (_) {}

        return bottom;
    }

    function measureDescender(doc, record) {
        var frame = createMetricFrame(
            doc,
            "gjpqy",
            record,
            FirstBaseline.FIXED_HEIGHT
        );

        var baseline = null;
        var outlines = null;

        try {
            frame.textFramePreferences.minimumFirstBaselineOffset = 100;
            try { frame.parentStory.recompose(); } catch (_) {}
            try { doc.recompose(); } catch (_) {}

            baseline = Number(frame.lines[0].baseline);

            try {
                outlines = frame.texts[0].createOutlines(false);
            } catch (_) {
                try {
                    outlines = frame.parentStory.createOutlines(false);
                } catch (__) {
                    outlines = null;
                }
            }

            if (!outlines) {
                throw new Error(
                    "InDesign could not create temporary outlines " +
                    "for the descender measurement."
                );
            }

            if (!(outlines instanceof Array)) {
                outlines = [outlines];
            }

            var lowestBottom = null;

            for (var i = 0; i < outlines.length; i++) {
                var bottom = outlineBottom(outlines[i]);

                if (
                    bottom !== null &&
                    (lowestBottom === null || bottom > lowestBottom)
                ) {
                    lowestBottom = bottom;
                }
            }

            if (lowestBottom === null) {
                throw new Error(
                    "InDesign could not measure the outlined descenders."
                );
            }

            var descender = baseline - lowestBottom;

            if (!(descender < 0)) {
                throw new Error(
                    "The measured descender was not below the baseline."
                );
            }

            return descender;
        } finally {
            if (outlines) {
                try {
                    if (!(outlines instanceof Array)) {
                        outlines = [outlines];
                    }

                    for (var j = outlines.length - 1; j >= 0; j--) {
                        try { outlines[j].remove(); } catch (_) {}
                    }
                } catch (_) {}
            }

            try { frame.remove(); } catch (_) {}
        }
    }

    function binaryByte(data, index) {
        return data.charCodeAt(index) & 255;
    }

    function binaryUInt16BE(data, index) {
        return (
            binaryByte(data, index) * 256 +
            binaryByte(data, index + 1)
        );
    }

    function binaryUInt32BE(data, index) {
        return (
            (
                (
                    binaryByte(data, index) * 256 +
                    binaryByte(data, index + 1)
                ) * 256 +
                binaryByte(data, index + 2)
            ) * 256 +
            binaryByte(data, index + 3)
        );
    }

    function binaryTag(data, index) {
        return String.fromCharCode(
            binaryByte(data, index),
            binaryByte(data, index + 1),
            binaryByte(data, index + 2),
            binaryByte(data, index + 3)
        );
    }

    function readBinaryRange(file, offset, length) {
        if (
            !file ||
            !(offset >= 0) ||
            !(length >= 0)
        ) {
            return null;
        }

        try {
            if (!file.seek(offset, 0)) {
                return null;
            }

            var data = file.read(length);

            if (
                !data ||
                data.length < length
            ) {
                return null;
            }

            return data;
        } catch (_) {
            return null;
        }
    }

    function readSfntDirectory(file, directoryOffset) {
        var header =
            readBinaryRange(
                file,
                directoryOffset,
                12
            );

        if (!header) {
            return null;
        }

        var numberOfTables =
            binaryUInt16BE(header, 4);

        if (
            numberOfTables < 1 ||
            numberOfTables > 4096
        ) {
            return null;
        }

        var recordsData =
            readBinaryRange(
                file,
                directoryOffset + 12,
                numberOfTables * 16
            );

        if (!recordsData) {
            return null;
        }

        var tables = {};

        for (var i = 0; i < numberOfTables; i++) {
            var recordOffset = i * 16;
            var tag =
                binaryTag(
                    recordsData,
                    recordOffset
                );

            tables[tag] = {
                offset:
                    binaryUInt32BE(
                        recordsData,
                        recordOffset + 8
                    ),
                length:
                    binaryUInt32BE(
                        recordsData,
                        recordOffset + 12
                    )
            };
        }

        return {
            offset: directoryOffset,
            tables: tables
        };
    }

    function readSfntUnitsPerEm(file, directory) {
        if (
            !directory ||
            !directory.tables ||
            !directory.tables.head
        ) {
            return null;
        }

        var headTable = directory.tables.head;

        if (
            headTable.length < 20 ||
            !(headTable.offset >= 0)
        ) {
            return null;
        }

        var unitsData =
            readBinaryRange(
                file,
                headTable.offset + 18,
                2
            );

        if (!unitsData) {
            return null;
        }

        var unitsPerEm =
            binaryUInt16BE(unitsData, 0);

        if (
            unitsPerEm < 16 ||
            unitsPerEm > 16384
        ) {
            return null;
        }

        return unitsPerEm;
    }

    function decodeOpenTypeName(data, platformID) {
        var result = "";

        if (
            platformID === 0 ||
            platformID === 3
        ) {
            for (
                var i = 0;
                i + 1 < data.length;
                i += 2
            ) {
                result += String.fromCharCode(
                    binaryUInt16BE(data, i)
                );
            }

            return result;
        }

        // PostScript names are restricted to a compact ASCII-compatible
        // character set. This also works for the relevant Mac name records.
        for (var j = 0; j < data.length; j++) {
            result += String.fromCharCode(
                binaryByte(data, j)
            );
        }

        return result;
    }

    function normalizePostScriptName(value) {
        return String(value || "")
            .replace(/^\//, "")
            .replace(/\s+/g, "")
            .toLowerCase();
    }

    function readSfntPostScriptNames(file, directory) {
        var names = [];

        if (
            !directory ||
            !directory.tables ||
            !directory.tables.name
        ) {
            return names;
        }

        var nameTable = directory.tables.name;

        if (
            nameTable.length < 6 ||
            !(nameTable.offset >= 0)
        ) {
            return names;
        }

        var header =
            readBinaryRange(
                file,
                nameTable.offset,
                6
            );

        if (!header) {
            return names;
        }

        var recordCount =
            binaryUInt16BE(header, 2);
        var stringStorageOffset =
            binaryUInt16BE(header, 4);

        if (
            recordCount < 1 ||
            recordCount > 8192
        ) {
            return names;
        }

        var recordsData =
            readBinaryRange(
                file,
                nameTable.offset + 6,
                recordCount * 12
            );

        if (!recordsData) {
            return names;
        }

        for (var i = 0; i < recordCount; i++) {
            var recordOffset = i * 12;
            var platformID =
                binaryUInt16BE(
                    recordsData,
                    recordOffset
                );
            var nameID =
                binaryUInt16BE(
                    recordsData,
                    recordOffset + 6
                );

            if (nameID !== 6) {
                continue;
            }

            var stringLength =
                binaryUInt16BE(
                    recordsData,
                    recordOffset + 8
                );
            var stringOffset =
                binaryUInt16BE(
                    recordsData,
                    recordOffset + 10
                );

            if (
                stringLength < 1 ||
                stringStorageOffset +
                    stringOffset +
                    stringLength >
                    nameTable.length
            ) {
                continue;
            }

            var stringData =
                readBinaryRange(
                    file,
                    nameTable.offset +
                        stringStorageOffset +
                        stringOffset,
                    stringLength
                );

            if (!stringData) {
                continue;
            }

            var decoded =
                decodeOpenTypeName(
                    stringData,
                    platformID
                );

            if (decoded) {
                names.push(decoded);
            }
        }

        return names;
    }

    function directoryMatchesPostScriptName(
        file,
        directory,
        postScriptName
    ) {
        var target =
            normalizePostScriptName(
                postScriptName
            );

        if (!target) {
            return false;
        }

        var names =
            readSfntPostScriptNames(
                file,
                directory
            );

        for (var i = 0; i < names.length; i++) {
            if (
                normalizePostScriptName(
                    names[i]
                ) === target
            ) {
                return true;
            }
        }

        return false;
    }

    function fontRecordCacheKey(record) {
        return (
            String(
                record && record.location
                    ? record.location
                    : ""
            ) +
            "|" +
            String(
                record && record.postScriptName
                    ? record.postScriptName
                    : ""
            )
        );
    }

    function readFontUnitsPerEm(record) {
        var cacheKey =
            fontRecordCacheKey(record);

        if (
            cacheKey &&
            fontUnitsPerEmCache.hasOwnProperty(
                cacheKey
            )
        ) {
            return fontUnitsPerEmCache[cacheKey];
        }

        var result = null;
        var location =
            record && record.location
                ? String(record.location)
                : "";

        if (!location) {
            if (cacheKey) {
                fontUnitsPerEmCache[cacheKey] =
                    null;
            }

            return null;
        }

        var file = new File(location);

        try {
            if (!file.exists) {
                if (cacheKey) {
                    fontUnitsPerEmCache[cacheKey] =
                        null;
                }

                return null;
            }

            if (!file.open("r")) {
                if (cacheKey) {
                    fontUnitsPerEmCache[cacheKey] =
                        null;
                }

                return null;
            }

            // Set after open(), because open() performs its own encoding
            // detection and may otherwise replace the requested value.
            file.encoding = "BINARY";

            var signature =
                readBinaryRange(file, 0, 4);

            if (!signature) {
                return null;
            }

            if (
                binaryTag(signature, 0) ===
                "ttcf"
            ) {
                var collectionHeader =
                    readBinaryRange(file, 0, 12);

                if (!collectionHeader) {
                    return null;
                }

                var fontCount =
                    binaryUInt32BE(
                        collectionHeader,
                        8
                    );

                if (
                    fontCount < 1 ||
                    fontCount > 4096
                ) {
                    return null;
                }

                var offsetsData =
                    readBinaryRange(
                        file,
                        12,
                        fontCount * 4
                    );

                if (!offsetsData) {
                    return null;
                }

                var targetPostScriptName =
                    record &&
                    record.postScriptName
                        ? record.postScriptName
                        : "";

                var uniqueUnits = {};
                var firstValidUnits = null;

                for (
                    var i = 0;
                    i < fontCount;
                    i++
                ) {
                    var directoryOffset =
                        binaryUInt32BE(
                            offsetsData,
                            i * 4
                        );

                    var directory =
                        readSfntDirectory(
                            file,
                            directoryOffset
                        );

                    if (!directory) {
                        continue;
                    }

                    var unitsPerEm =
                        readSfntUnitsPerEm(
                            file,
                            directory
                        );

                    if (!unitsPerEm) {
                        continue;
                    }

                    if (firstValidUnits === null) {
                        firstValidUnits =
                            unitsPerEm;
                    }

                    uniqueUnits[
                        String(unitsPerEm)
                    ] = true;

                    if (
                        targetPostScriptName &&
                        directoryMatchesPostScriptName(
                            file,
                            directory,
                            targetPostScriptName
                        )
                    ) {
                        result = unitsPerEm;
                        break;
                    }
                }

                if (result === null) {
                    var uniqueCount = 0;
                    var uniqueValue = null;

                    for (var key in uniqueUnits) {
                        if (
                            uniqueUnits.hasOwnProperty(
                                key
                            )
                        ) {
                            uniqueCount++;
                            uniqueValue =
                                Number(key);
                        }
                    }

                    // A collection frequently shares the same UPM across all
                    // faces. Use it only when the value is unambiguous.
                    if (uniqueCount === 1) {
                        result = uniqueValue;
                    }
                }
            } else {
                var standaloneDirectory =
                    readSfntDirectory(
                        file,
                        0
                    );

                result =
                    readSfntUnitsPerEm(
                        file,
                        standaloneDirectory
                    );
            }
        } catch (_) {
            result = null;
        } finally {
            try {
                if (file.opened) {
                    file.close();
                }
            } catch (_) {}
        }

        if (cacheKey) {
            fontUnitsPerEmCache[cacheKey] =
                result;
        }

        return result;
    }

    function readMetricsWithInDesign(record) {
        var doc = null;
        var previousInteractionLevel = null;

        try {
            try {
                previousInteractionLevel =
                    app.scriptPreferences.userInteractionLevel;
                app.scriptPreferences.userInteractionLevel =
                    UserInteractionLevels.NEVER_INTERACT;
            } catch (_) {}

            try {
                doc = app.documents.add(false);
            } catch (_) {
                doc = app.documents.add();
            }

            try {
                doc.viewPreferences.horizontalMeasurementUnits =
                    MeasurementUnits.POINTS;
                doc.viewPreferences.verticalMeasurementUnits =
                    MeasurementUnits.POINTS;
                doc.documentPreferences.pageWidth = 300;
                doc.documentPreferences.pageHeight = 200;
            } catch (_) {}

            var ascent = measureFirstBaselineMetric(
                doc,
                record,
                FirstBaseline.ASCENT_OFFSET,
                "Hdx"
            );

            var capHeight = measureFirstBaselineMetric(
                doc,
                record,
                FirstBaseline.CAP_HEIGHT,
                "H"
            );

            var xHeight = measureFirstBaselineMetric(
                doc,
                record,
                FirstBaseline.X_HEIGHT,
                "x"
            );

            var descender = measureDescender(doc, record);
            var fontUnitsPerEm =
                readFontUnitsPerEm(record);

            return {
                // InDesign's temporary metric sample is measured at 100 pt.
                unitsPerEm: 100,
                // The font's native design-space UPM, read from the OpenType
                // head table when the source file is accessible.
                fontUnitsPerEm: fontUnitsPerEm,
                ascender: ascent,
                capHeight: capHeight,
                xHeight: xHeight,
                descender: descender,
                source: "InDesign composition"
            };
        } finally {
            try {
                if (doc && doc.isValid) {
                    doc.close(SaveOptions.NO);
                }
            } catch (_) {}

            try {
                if (previousInteractionLevel !== null) {
                    app.scriptPreferences.userInteractionLevel =
                        previousInteractionLevel;
                }
            } catch (_) {}
        }
    }

    function findPreferredFontFamilyIndex() {
        var preferredFamilies = ["Afacad", "Afacad Flux"];

        for (var p = 0; p < preferredFamilies.length; p++) {
            var preferred =
                String(preferredFamilies[p]).toLowerCase();

            for (var i = 0; i < installedFontFamilies.length; i++) {
                if (
                    String(installedFontFamilies[i]).toLowerCase() ===
                    preferred
                ) {
                    return i;
                }
            }
        }

        return 0;
    }

    function selectRegularFontStyle() {
        try {
            if (!fontStyleDropdown.items.length) return;

            var regularIndex = 0;

            for (var i = 0; i < fontStyleDropdown.items.length; i++) {
                if (
                    String(fontStyleDropdown.items[i].text)
                        .toLowerCase() === "regular"
                ) {
                    regularIndex = i;
                    break;
                }
            }

            fontStyleDropdown.selection = regularIndex;
        } catch (_) {}
    }

    function buildInstalledFontRecords() {
        installedFontRecords = [];
        installedFontFamilies = [];

        var familyMap = {};
        var fonts = [];

        try {
            fonts = app.fonts.everyItem().getElements();
        } catch (_) {
            fonts = [];
        }

        for (var i = 0; i < fonts.length; i++) {
            var font = fonts[i];
            var family = "";
            var style = "";
            var location = "";
            var postScriptName = "";

            try { family = String(font.fontFamily || ""); } catch (_) {}
            try { style = String(font.fontStyleName || "Regular"); } catch (_) {}
            try { location = String(font.location || ""); } catch (_) {}
            try {
                postScriptName =
                    String(font.postscriptName || "");
            } catch (_) {}

            if (!family) continue;

            var record = {
                family: family,
                style: style || "Regular",
                location: location,
                postScriptName: postScriptName,
                font: font
            };

            installedFontRecords.push(record);

            if (!familyMap[family]) {
                familyMap[family] = true;
                installedFontFamilies.push(family);
            }
        }

        installedFontFamilies.sort();

        fontSelectionIsUpdating = true;
        try {
            fontFamilyDropdown.removeAll();

            if (installedFontFamilies.length === 0) {
                fontFamilyDropdown.add("item", "No fonts found");
                fontFamilyDropdown.selection = 0;
            } else {
                for (var f = 0; f < installedFontFamilies.length; f++) {
                    fontFamilyDropdown.add(
                        "item",
                        installedFontFamilies[f]
                    );
                }

                fontFamilyDropdown.selection =
                    findPreferredFontFamilyIndex();
            }
        } catch (_) {}
        fontSelectionIsUpdating = false;
    }

    function recordsForSelectedFamily() {
        var records = [];

        if (!fontFamilyDropdown.selection) return records;

        var family = String(fontFamilyDropdown.selection.text);

        for (var i = 0; i < installedFontRecords.length; i++) {
            if (installedFontRecords[i].family === family) {
                records.push(installedFontRecords[i]);
            }
        }

        records.sort(function (a, b) {
            return a.style < b.style ? -1 : a.style > b.style ? 1 : 0;
        });

        return records;
    }

    function populateFontStyles() {
        var records = recordsForSelectedFamily();

        fontSelectionIsUpdating = true;
        try {
            fontStyleDropdown.removeAll();

            if (records.length === 0) {
                fontStyleDropdown.add("item", "—");
                fontStyleDropdown.selection = 0;
            } else {
                for (var i = 0; i < records.length; i++) {
                    var item =
                        fontStyleDropdown.add("item", records[i].style);
                    item.vtiFontRecord = records[i];
                }
                fontStyleDropdown.selection = 0;
                selectRegularFontStyle();
            }
        } catch (_) {}
        fontSelectionIsUpdating = false;
    }

    function selectedFontRecord() {
        try {
            if (
                fontStyleDropdown.selection &&
                fontStyleDropdown.selection.vtiFontRecord
            ) {
                return fontStyleDropdown.selection.vtiFontRecord;
            }
        } catch (_) {}

        return null;
    }

    function setFontControlsEnabled(enabled) {
        try { fontFamilyDropdown.enabled = enabled; } catch (_) {}
        try { fontStyleDropdown.enabled = enabled; } catch (_) {}
    }

    var customRatiosExpanded = false;

    function layoutMainWindow() {
        try {
            // Release cached heights before one consolidated layout pass.
            pType.minimumSize.height = 0;
            pType.preferredSize.height = -1;
            col1.minimumSize.height = 0;
            col1.preferredSize.height = -1;
            columns.minimumSize.height = 0;
            columns.preferredSize.height = -1;
        } catch (_) {}

        try {
            // A single top-level layout/resize pass avoids the visible
            // repaint sequence caused by updating each nested container.
            w.layout.layout(true);
            w.layout.resize();
        } catch (_) {}
    }

    function setCustomRatiosExpanded(expanded) {
        customRatiosExpanded = Boolean(expanded);

        try {
            if (customRatiosExpanded) {
                customRatioContainer.visible = true;
                customRatioContainer.minimumSize.height = 0;
                customRatioContainer.maximumSize.height = 10000;
                customRatioContainer.preferredSize.height = -1;
            } else {
                customRatioContainer.visible = false;
                customRatioContainer.minimumSize.height = 0;
                customRatioContainer.maximumSize.height = 0;
                customRatioContainer.preferredSize.height = 0;
            }
        } catch (_) {}

        layoutMainWindow();
    }

    function setCustomRatioControlsEnabled(enabled) {
        var controls = [
            customRatioMetrics,
            customRatioAscender,
            customRatioCapHeight,
            customRatioXHeight,
            customRatioDescender
        ];

        for (var i = 0; i < controls.length; i++) {
            try {
                controls[i].enabled =
                    Boolean(enabled);
            } catch (_) {}
        }

        // Custom Metric fields are shown automatically while the source
        // is selected and hidden for every other metric source.
        setCustomRatiosExpanded(Boolean(enabled));
    }

    function customRatiosFromFields() {
        var metricsBase =
            parseNumber(customRatioMetrics.text, 12);

        positive(metricsBase, "Custom Ratios – Metrics");

        return {
            ascender:
                parseNumber(customRatioAscender.text, 8) /
                metricsBase,
            capHeight:
                parseNumber(customRatioCapHeight.text, 7) /
                metricsBase,
            xHeight:
                parseNumber(customRatioXHeight.text, 5) /
                metricsBase,
            descender:
                parseNumber(customRatioDescender.text, -3) /
                metricsBase
        };
    }

    function roundFontDesignUnit(value) {
        var numericValue = Number(value);

        if (!isFinite(numericValue)) {
            return numericValue;
        }

        // Round halves away from zero so positive and negative font units
        // behave symmetrically.
        return numericValue < 0
            ? -Math.round(-numericValue)
            : Math.round(numericValue);
    }

    function setCustomMetricFieldValues(
        metricsBase,
        ascenderValue,
        capHeightValue,
        xHeightValue,
        descenderValue
    ) {
        customRatioMetrics.text =
            formatInputNumber(metricsBase);
        customRatioAscender.text =
            formatInputNumber(ascenderValue);
        customRatioCapHeight.text =
            formatInputNumber(capHeightValue);
        customRatioXHeight.text =
            formatInputNumber(xHeightValue);
        customRatioDescender.text =
            formatInputNumber(descenderValue);
    }

    function inheritCustomMetricFromSource(sourceKey) {
        if (
            sourceKey === "selectedFont" &&
            selectedFontMetrics
        ) {
            var nativeUnitsPerEm =
                Number(
                    selectedFontMetrics
                        .fontUnitsPerEm
                );

            if (
                nativeUnitsPerEm >= 16 &&
                nativeUnitsPerEm <= 16384
            ) {
                setCustomMetricFieldValues(
                    nativeUnitsPerEm,
                    roundFontDesignUnit(
                        activeTypeRatios.ascender *
                            nativeUnitsPerEm
                    ),
                    roundFontDesignUnit(
                        activeTypeRatios.capHeight *
                            nativeUnitsPerEm
                    ),
                    roundFontDesignUnit(
                        activeTypeRatios.xHeight *
                            nativeUnitsPerEm
                    ),
                    roundFontDesignUnit(
                        activeTypeRatios.descender *
                            nativeUnitsPerEm
                    )
                );
                return;
            }

            // The file may be unavailable for some managed, protected or
            // legacy fonts. Preserve the measured proportions on the prior
            // 12-based fallback scale in that case.
            var fallbackBase = 12;

            setCustomMetricFieldValues(
                fallbackBase,
                activeTypeRatios.ascender *
                    fallbackBase,
                activeTypeRatios.capHeight *
                    fallbackBase,
                activeTypeRatios.xHeight *
                    fallbackBase,
                activeTypeRatios.descender *
                    fallbackBase
            );
            return;
        }

        if (sourceKey === "decimal") {
            setCustomMetricFieldValues(
                10,
                8,
                7,
                5,
                -2
            );
            return;
        }

        if (sourceKey === "dozenal") {
            setCustomMetricFieldValues(
                12,
                8,
                7,
                5,
                -3
            );
            return;
        }

        // Fallback: preserve the currently active proportions using the
        // existing Custom Metric base value.
        var metricsBase =
            parseNumber(customRatioMetrics.text, 12);

        if (!(metricsBase > 0)) {
            metricsBase = 12;
        }

        setCustomMetricFieldValues(
            metricsBase,
            activeTypeRatios.ascender * metricsBase,
            activeTypeRatios.capHeight * metricsBase,
            activeTypeRatios.xHeight * metricsBase,
            activeTypeRatios.descender * metricsBase
        );
    }

    function activateCustomRatios() {
        selectedFontMetrics = null;
        setFontControlsEnabled(false);
        setCustomRatioControlsEnabled(true);

        try {
            setTypeRatios(customRatiosFromFields());
            fontMetricsStatus.text = "Using Custom Metric";
        } catch (_) {}

        update();
        syncCompactControls();
        markDirty();
        updatePreviewDocument();
    }

    function updatePlaceholderTextAvailability() {
        var selectedFontActive =
            Boolean(
                selectedMetricSourceKey() === "selectedFont" &&
                selectedFontRecord()
            );

        try {
            placeholderText.enabled = selectedFontActive;

            if (!selectedFontActive) {
                placeholderText.value = false;
            }
        } catch (_) {}
    }

    function activateEmetricSource(sourceKey) {
        selectedFontMetrics = null;
        setCustomRatioControlsEnabled(false);

        if (sourceKey === "decimal") {
            setTypeRatios(cloneDecimalTypeRatios());
            fontMetricsStatus.text = "Using Emetric Decimal";
        } else {
            setTypeRatios(cloneDefaultTypeRatios());
            fontMetricsStatus.text = "Using Emetric Dozenal";
        }

        setFontControlsEnabled(false);
        update();
        syncCompactControls();
        markDirty();
        updatePreviewDocument();
    }

    function activateSelectedFontMetrics(showErrors) {
        setCustomRatioControlsEnabled(false);
        var record = selectedFontRecord();

        if (!record) {
            if (showErrors) {
                alert(
                    "No installed font is selected.",
                    SCRIPT_NAME
                );
            }
            return false;
        }

        try {
            fontMetricsStatus.text =
                "Measuring " + record.family + " — " + record.style + "…";
            try { w.update(); } catch (_) {}

            var data = readMetricsWithInDesign(record);
            var emSize = Number(data.unitsPerEm);

            selectedFontMetrics = data;
            setTypeRatios({
                ascender: Number(data.ascender) / emSize,
                capHeight: Number(data.capHeight) / emSize,
                xHeight: Number(data.xHeight) / emSize,
                descender: Number(data.descender) / emSize
            });

            fontMetricsStatus.text =
                record.family + " — " + record.style +
                " · measured by InDesign";

            update();
            syncCompactControls();
            markDirty();
            updatePreviewDocument();
            return true;
        } catch (e) {
            selectedFontMetrics = null;
            setTypeRatios(cloneDefaultTypeRatios());
            fontMetricsStatus.text = "Font metrics unavailable";

            reportDiagnosticError(
                "Measure selected font",
                e,
                "InDesign could not measure the selected font.",
                Boolean(showErrors)
            );

            update();
            syncCompactControls();
            return false;
        }
    }

    buildInstalledFontRecords();
    populateFontStyles();
    metricsSourceDropdown.selection = 0;
    lastValidMetricSourceIndex = 0;
    lastValidMetricSourceKey = "selectedFont";
    setCustomRatioControlsEnabled(false);
    setFontControlsEnabled(true);
    activateSelectedFontMetrics(false);
    updatePlaceholderTextAvailability();

    metricsSourceDropdown.onChange = function () {
        if (fontSelectionIsUpdating) return;

        var selection =
            metricsSourceDropdown.selection;

        if (
            !selection ||
            selection.emetricSeparator ||
            !selection.emetricSourceKey
        ) {
            fontSelectionIsUpdating = true;

            try {
                metricsSourceDropdown.selection =
                    lastValidMetricSourceIndex;
            } catch (_) {}

            fontSelectionIsUpdating = false;
            return;
        }

        var previousSourceKey =
            lastValidMetricSourceKey;

        lastValidMetricSourceIndex =
            selection.index;

        var sourceKey =
            selection.emetricSourceKey;

        if (sourceKey === "selectedFont") {
            setFontControlsEnabled(true);
            activateSelectedFontMetrics(true);
        } else if (sourceKey === "custom") {
            inheritCustomMetricFromSource(
                previousSourceKey
            );
            activateCustomRatios();
        } else {
            activateEmetricSource(sourceKey);
        }

        lastValidMetricSourceKey =
            sourceKey;

        updatePlaceholderTextAvailability();
    };

    fontFamilyDropdown.onChange = function () {
        if (fontSelectionIsUpdating) return;

        populateFontStyles();

        if (
            selectedMetricSourceKey() === "selectedFont"
        ) {
            activateSelectedFontMetrics(false);
        }

        updatePlaceholderTextAvailability();
    };

    fontStyleDropdown.onChange = function () {
        if (fontSelectionIsUpdating) return;

        if (
            selectedMetricSourceKey() === "selectedFont"
        ) {
            activateSelectedFontMetrics(true);
        }

        updatePlaceholderTextAvailability();
    };

    var inputFields = [
        customRatioMetrics, customRatioAscender,
        customRatioCapHeight, customRatioXHeight,
        customRatioDescender,
        fMetrics, oAscender, oUppercase, oLowercase, oDescender,
        oLineSpace, fMetricsLine.a, fMetricsLine.b,
        fVerticalGroup, fHorizontalGroup,
        fGridGroupH, fGridGroupV, fGridRatio.a, fGridRatio.b,
        oPageWidth, oPageHeight,
        fMarginTop.factor, fMarginBottom.factor,
        fMarginLeft.factor, fMarginRight.factor
    ];

    function rememberInputFocus(index) {
        lastActiveInputIndex = index;

        try {
            var selection = inputFields[index].selection;
            if (selection && selection.length >= 2) {
                lastActiveSelection = [
                    Number(selection[0]),
                    Number(selection[1])
                ];
            } else {
                lastActiveSelection = null;
            }
        } catch (_) {
            lastActiveSelection = null;
        }
    }

    function captureCurrentInputFocus() {
        if (compactMode && lastActiveUIField) {
            return;
        }

        for (var i = 0; i < inputFields.length; i++) {
            try {
                if (inputFields[i].active) {
                    lastActiveUIField = inputFields[i];
                    rememberInputFocus(i);
                    return;
                }
            } catch (_) {}
        }
    }

    function removeFocusRestoreIdleTask() {
        if (!focusRestoreIdleTask) return;

        try {
            focusRestoreIdleTask.removeEventListener(
                IdleEvent.ON_IDLE,
                handleFocusRestoreIdle
            );
        } catch (_) {
            try {
                focusRestoreIdleTask.removeEventListener(
                    "onIdle",
                    handleFocusRestoreIdle
                );
            } catch (__) {}
        }

        try {
            if (focusRestoreIdleTask.isValid) {
                focusRestoreIdleTask.remove();
            }
        } catch (_) {}

        focusRestoreIdleTask = null;
    }

    function currentlyActiveInputField() {
        var fields = inputFields;

        try {
            if (
                compactMode &&
                typeof compactInputFields !== "undefined" &&
                compactInputFields
            ) {
                fields = compactInputFields;
            }
        } catch (_) {}

        for (var i = 0; i < fields.length; i++) {
            try {
                if (fields[i].active) {
                    return fields[i];
                }
            } catch (_) {}
        }

        return null;
    }

    function restoreInputFocus() {
        removeFocusRestoreIdleTask();

        if (
            emetricInputExplicitlyClosed
        ) {
            return;
        }

        var targetWindow = compactMode ? compactWindow : w;
        var field = lastActiveUIField;

        if (!field) {
            if (
                lastActiveInputIndex >= 0 &&
                lastActiveInputIndex < inputFields.length
            ) {
                field = inputFields[lastActiveInputIndex];
            } else {
                return;
            }
        }

        var activeField =
            currentlyActiveInputField();

        // Respect native Tab navigation. If the user has already moved to
        // another input field, do not pull focus back after Preview updates.
        if (
            activeField &&
            activeField !== field
        ) {
            lastActiveUIField = activeField;
            return;
        }

        try {
            // Bring the existing palette forward without showing it again.
            // Calling show() here triggers w.onShow and re-centers the window.
            targetWindow.active = true;
        } catch (_) {}

        try {
            field.active = true;

            // Mark the entire most recently used value so the user can
            // immediately type a replacement after Preview has updated.
            field.selection = [0, field.text.length];
        } catch (_) {}
    }

    function handleFocusRestoreIdle(event) {
        restoreInputFocus();
    }

    function scheduleInputFocusRestore() {
        removeFocusRestoreIdleTask();

        try {
            focusRestoreIdleTask = app.idleTasks.add({
                name: FOCUS_RESTORE_TASK_NAME,
                sleep: 100
            });

            try {
                focusRestoreIdleTask.addEventListener(
                    IdleEvent.ON_IDLE,
                    handleFocusRestoreIdle
                );
            } catch (_) {
                focusRestoreIdleTask.addEventListener(
                    "onIdle",
                    handleFocusRestoreIdle
                );
            }
        } catch (_) {
            focusRestoreIdleTask = null;
            restoreInputFocus();
        }
    }

    function installInputFocusTracking(fields) {
        for (var i = 0; i < fields.length; i++) {
            (function (index) {
                try {
                    fields[index].onActivate = function () {
                        lastActiveUIField =
                            fields[index];
                        rememberInputFocus(index);
                        beginEmetricInputEditing(
                            fields[index]
                        );
                    };

                    fields[index].onDeactivate = function () {
                        finishEmetricInputEditing(
                            fields[index]
                        );
                    };
                } catch (_) {}
            })(i);
        }
    }

    installInputFocusTracking(inputFields);

    function activeAnamorphicMode() {
        try {
            return Boolean(anamorphicFormat.value);
        } catch (_) {
            return false;
        }
    }

    function activeFormatRatioLock() {
        try {
            return activeAnamorphicMode() && Boolean(lockFormatRatio.value);
        } catch (_) {
            return false;
        }
    }

    function readValues() {
        return {
            metrics: unitToMM(parseMeasureInput(fMetrics.text, currentUnitIndex, 4), currentUnitIndex),
            typeRatios: activeTypeRatios,
            lineSpaceOverride: exactLineSpaceMM,
            metricsRatio: parseNumber(fMetricsLine.a.text, 4),
            lineRatio: parseNumber(fMetricsLine.b.text, 5),

            verticalGroup: parseNumber(fVerticalGroup.text, 6),
            horizontalGroup: parseNumber(fHorizontalGroup.text, 9),

            rowOffsetSourceIndex:
                rowOffsetSource.selection
                    ? rowOffsetSource.selection.index
                    : 3,
            columnOffsetSourceIndex:
                columnOffsetSource.selection
                    ? columnOffsetSource.selection.index
                    : 3,

            gridGroupHorizontal: parseNumber(fGridGroupH.text, 6),
            gridGroupVertical: parseNumber(fGridGroupV.text, 9),
            gridRowsOverride: exactGridRows,
            gridRatioHorizontal: parseNumber(fGridRatio.a.text, 2),
            gridRatioVertical: parseNumber(fGridRatio.b.text, 3),

            marginTopFactor: parseNumber(fMarginTop.factor.text, 2),
            marginBottomFactor: parseNumber(fMarginBottom.factor.text, 4),
            marginLeftFactor: parseNumber(fMarginLeft.factor.text, 2),
            marginRightFactor: parseNumber(fMarginRight.factor.text, 2),

            pageWidthOverride: activeAnamorphicMode()
                ? exactPageWidthMM
                : null,
            pageHeightOverride: activeAnamorphicMode()
                ? exactPageHeightMM
                : null
        };
    }

    var currentValues = null;
    var currentResult = null;
    var exactLineSpaceMM = null;
    var exactGridRows = null;
    var exactPageWidthMM = null;
    var exactPageHeightMM = null;

    function update() {
        try {
            currentValues = readValues();
            currentResult = calculate(currentValues);
            updateAnamorphicFormatControls();

            if (
                activeAnamorphicMode() &&
                exactPageHeightMM !== null &&
                exactPageHeightMM !== undefined
            ) {
                fMetrics.text =
                    formatMeasureValue(
                        currentResult.metrics,
                        currentUnitIndex
                    );
            }

            setMeasureField(oAscender, currentResult.ascender);
            setMeasureField(oUppercase, currentResult.uppercase);
            setMeasureField(oLowercase, currentResult.lowercase);
            setMeasureField(oDescender, currentResult.descender);
            setMeasureField(oLineSpace, currentResult.lineSpace);

            setMeasureField(oVerticalLine, currentResult.verticalLine);
            setMeasureField(oVerticalGridline, currentResult.verticalGridline);
            setMeasureField(oVerticalOffset, currentResult.offsetGridVertical);

            setMeasureField(oHorizontalLine, currentResult.horizontalLine);
            setMeasureField(oHorizontalGridline, currentResult.horizontalGridline);
            setMeasureField(oHorizontalOffset, currentResult.offsetGridHorizontal);

            setMeasureField(oGridMarginH, currentResult.gridMarginHorizontal);
            setMeasureField(oGridMarginV, currentResult.gridMarginVertical);
            setMeasureField(oGutterH, currentResult.gridGutterHorizontal);
            setMeasureField(oGutterV, currentResult.gridGutterVertical);
            setField(fGridGroupV, currentResult.gridGroupVertical);
            setMeasureField(oGridWidth, currentResult.gridWidth);
            setMeasureField(oGridHeight, currentResult.gridHeight);

            setMeasureField(fMarginTop.result, currentResult.marginTop);
            setMeasureField(fMarginBottom.result, currentResult.marginBottom);
            setMeasureField(fMarginLeft.result, currentResult.marginLeft);
            setMeasureField(fMarginRight.result, currentResult.marginRight);

            setMeasureField(oTypeWidth, currentResult.typeAreaWidth);
            setMeasureField(oTypeHeight, currentResult.typeAreaHeight);
            setMeasureField(oIntersectionW, currentResult.intersectionWidth);
            setMeasureField(oIntersectionH, currentResult.intersectionHeight);

            setMeasureField(oPageWidth, currentResult.pageWidth);
            setMeasureField(oPageHeight, currentResult.pageHeight);
            setMeasureField(oSpread, currentResult.spread);
            setField(oFormatRatio.a, currentResult.formatRatioHorizontal);
            setField(oFormatRatio.b, currentResult.formatRatioVertical);

            createButton.enabled = true;
        } catch (e) {
            createButton.enabled = false;
            currentResult = null;
        }
    }

    function reset() {
        currentUnitIndex = 0;
        unitDropdown.selection = 0;
        metricsSourceDropdown.selection = 0;
        lastValidMetricSourceIndex = 0;
        lastValidMetricSourceKey = "selectedFont";
        setCustomRatioControlsEnabled(false);
        setFontControlsEnabled(true);
        selectedFontMetrics = null;
        activateSelectedFontMetrics(false);
        exactLineSpaceMM = null;
        exactGridRows = null;
        exactPageWidthMM = null;
        exactPageHeightMM = null;
        customRatioMetrics.text = "12";
        customRatioAscender.text = "8";
        customRatioCapHeight.text = "7";
        customRatioXHeight.text = "5";
        customRatioDescender.text = "-3";
        fMetrics.text = formatMeasureValue(4, 0);
        fMetricsLine.a.text = "4";
        fMetricsLine.b.text = "5";
        fVerticalGroup.text = "6";
        fHorizontalGroup.text = "6";
        rowOffsetSource.selection = 3;
        columnOffsetSource.selection = 3;
        fGridGroupH.text = "6";
        fGridGroupV.text = "9";
        fGridRatio.a.text = "2";
        fGridRatio.b.text = "3";
        fMarginTop.factor.text = "1";
        fMarginBottom.factor.text = "1";
        fMarginLeft.factor.text = "1";
        fMarginRight.factor.text = "1";
        closePreviewDocument();
        previewCheckbox.value = true;
        try { compactPreviewCheckbox.value = true; } catch (_) {}
        facingPages.value = false;
        anamorphicFormat.value = false;
        lockFormatRatio.value = false;
        updateAnamorphicFormatControls();
        updateMarginLabels();
        useAMaster.value = true;
        infoPage.value = false;
        placeholderText.value = false;
        updatePlaceholderTextAvailability();
        snapToGrid.value = true;
        snapToGuides.value = true;
        gridsInBack.value = true;
        guideRowsCheckbox.value = true;
        guideColumnsCheckbox.value = true;
        columnGuidesCheckbox.value = true;
        majorGridHorizontalCheckbox.value = false;
        majorGridVerticalCheckbox.value = false;
        applyingProfile = true;
        removeCustomProfileStatus();
        colorProfileDropdown.selection = 0;
        applyColorProfile(0);

        try {
            if (colorPanel.window && colorPanel.window.update) {
                colorPanel.window.update();
            }
        } catch (_) {}

        applyingProfile = false;
        updateUnitLabels();
        update();
        syncCompactControls();

        try {
            resetButton.active = false;
            cancelButton.active = false;
        } catch (_) {}

        try {
            fMetrics.active = true;
            fMetrics.selection = [0, String(fMetrics.text).length];
        } catch (_) {}

        resetButton.enabled = false;

        if (
            presetSystemReady &&
            !presetIsApplying
        ) {
            currentPresetId =
                "default";
            currentPresetBaseline =
                defaultPresetSettings
                    ? clonePresetValue(
                        defaultPresetSettings
                      )
                    : capturePresetSettings();

            rebuildPresetDropdown(
                "default"
            );
            updatePresetModifiedState();
            scheduleLastUsedPresetSave();
        }

        try {
            if (w.update) w.update();
        } catch (_) {}
    }

    // ---------- Anamorphic format controls ----------

    function updateAnamorphicFormatControls() {
        var enabled = activeAnamorphicMode();

        try { oPageWidth.enabled = enabled; } catch (_) {}
        try { oPageHeight.enabled = enabled; } catch (_) {}
        try { lockFormatRatio.enabled = enabled; } catch (_) {}

        if (!enabled) {
            try { lockFormatRatio.value = false; } catch (_) {}
        }

        try {
            oPageWidth.helpTip = enabled
                ? "Editing Width changes Column Leading while preserving the current horizontal page grid steps."
                : "Enable Anamorphic Format in Page to edit Width.";
            oPageHeight.helpTip = enabled
                ? "Editing Height changes Row Leading while preserving the current vertical page grid steps."
                : "Enable Anamorphic Format in Page to edit Height.";
            lockFormatRatio.helpTip = enabled
                ? "Keeps the current page width/height ratio when either dimension is edited."
                : "Enable Anamorphic Format to lock the page ratio.";
        } catch (_) {}
    }

    function formatRatioLockChanged() {
        setDiagnosticAction(
            activeFormatRatioLock()
                ? "Enable Format Ratio Lock"
                : "Disable Format Ratio Lock",
            true
        );

        if (!activeAnamorphicMode()) {
            try { lockFormatRatio.value = false; } catch (_) {}
        }

        if (
            activeFormatRatioLock() &&
            currentResult
        ) {
            exactPageWidthMM = currentResult.pageWidth;
            exactPageHeightMM = currentResult.pageHeight;
            exactLineSpaceMM = null;
        }

        updateAnamorphicFormatControls();
        update();
        syncCompactControls();
        markDirty();
        updatePreviewDocument();
    }

    function anamorphicFormatChanged() {
        setDiagnosticAction(
            activeAnamorphicMode()
                ? "Enable Anamorphic Format"
                : "Disable Anamorphic Format",
            true
        );

        if (!activeAnamorphicMode()) {
            exactPageWidthMM = null;
            exactPageHeightMM = null;
            try { lockFormatRatio.value = false; } catch (_) {}
        } else if (
            activeFormatRatioLock() &&
            currentResult
        ) {
            exactPageWidthMM = currentResult.pageWidth;
            exactPageHeightMM = currentResult.pageHeight;
            exactLineSpaceMM = null;
        }

        updateAnamorphicFormatControls();
        update();
        syncCompactControls();
        markDirty();
        updatePreviewDocument();
    }

    // ---------- Editable anamorphic page dimensions ----------

    function isPageDimensionField(field) {
        return (
            field === oPageWidth ||
            field === oPageHeight
        );
    }

    function pageDimensionFallbackMM(field) {
        if (currentResult) {
            return field === oPageWidth
                ? currentResult.pageWidth
                : currentResult.pageHeight;
        }

        return field === oPageWidth
            ? 210
            : 297;
    }

    function parsePageDimensionMM(field) {
        var fallbackMM = pageDimensionFallbackMM(field);
        var fallbackInCurrentUnit =
            mmToUnit(fallbackMM, currentUnitIndex);

        return unitToMM(
            parseMeasureInput(
                field.text,
                currentUnitIndex,
                fallbackInCurrentUnit
            ),
            currentUnitIndex
        );
    }

    function updateFromPageDimension(field) {
        if (!activeAnamorphicMode()) {
            updateAnamorphicFormatControls();
            update();
            return;
        }

        // Page dimensions are anamorphic drivers, not structural grid inputs.
        // Preserve both Grid Group values exactly as entered while Width or
        // Height recalculates the corresponding line measure from the current
        // page grid-step structure, including the active margins.
        var preservedRowGridGroup =
            String(fVerticalGroup.text);
        var preservedColumnGridGroup =
            String(fHorizontalGroup.text);

        try {
            var targetDimensionMM =
                positive(
                    parsePageDimensionMM(field),
                    field === oPageWidth
                        ? "Page Width"
                        : "Page Height"
                );

            var lockRatio =
                activeFormatRatioLock() &&
                currentResult &&
                currentResult.pageWidth > 0 &&
                currentResult.pageHeight > 0;

            if (field === oPageWidth) {
                exactPageWidthMM =
                    targetDimensionMM;

                if (lockRatio) {
                    exactPageHeightMM =
                        targetDimensionMM *
                        currentResult.pageHeight /
                        currentResult.pageWidth;

                    // Locked ratio means Width also derives a new Height,
                    // which changes Row Leading.
                    exactLineSpaceMM = null;
                }
            } else {
                exactPageHeightMM =
                    targetDimensionMM;

                // Page Height changes Leading through the unchanged Row Grid
                // Group. It supersedes an explicitly edited Leading value.
                exactLineSpaceMM = null;

                if (lockRatio) {
                    exactPageWidthMM =
                        targetDimensionMM *
                        currentResult.pageWidth /
                        currentResult.pageHeight;
                }
            }

            update();

            // Do not let a page-dimension edit rewrite the grid structure.
            fVerticalGroup.text =
                preservedRowGridGroup;
            fHorizontalGroup.text =
                preservedColumnGridGroup;

            syncCompactControls();
            markDirty();
            updatePreviewDocument();
        } catch (_) {
            fVerticalGroup.text =
                preservedRowGridGroup;
            fHorizontalGroup.text =
                preservedColumnGridGroup;
            update();
        }
    }

    var pageDimensionFields = [
        oPageWidth,
        oPageHeight
    ];

    for (var pageDimensionIndex = 0;
         pageDimensionIndex < pageDimensionFields.length;
         pageDimensionIndex++) {
        (function (field) {
            field.onChanging = function () {
                // Preserve a partially typed measurement. The dimension is
                // fixed only after editing has been committed.
                markDirty();
            };

            field.onChange = function () {
                normalizeEditableMeasureField(
                    field,
                    mmToUnit(
                        pageDimensionFallbackMM(field),
                        currentUnitIndex
                    )
                );

                updateFromPageDimension(field);
            };
        })(pageDimensionFields[pageDimensionIndex]);
    }

    function isLinkedTypeSizeField(field) {
        return (
            field === fMetrics ||
            field === oAscender ||
            field === oUppercase ||
            field === oLowercase ||
            field === oDescender ||
            field === oLineSpace
        );
    }

    function metricsFromLinkedTypeSizeField(field) {
        var fallbackMetricsMM = currentResult
            ? currentResult.metrics
            : unitToMM(4, currentUnitIndex);

        var ratio = 1;

        if (field === oAscender) {
            ratio = activeTypeRatios.ascender;
        } else if (field === oUppercase) {
            ratio = activeTypeRatios.capHeight;
        } else if (field === oLowercase) {
            ratio = activeTypeRatios.xHeight;
        } else if (field === oDescender) {
            ratio = activeTypeRatios.descender;
        }

        var fallbackValueMM = fallbackMetricsMM * ratio;
        var fallbackInCurrentUnit =
            mmToUnit(fallbackValueMM, currentUnitIndex);

        var editedValueMM = unitToMM(
            parseMeasureInput(
                field.text,
                currentUnitIndex,
                fallbackInCurrentUnit
            ),
            currentUnitIndex
        );

        if (field === fMetrics) {
            return Math.abs(editedValueMM);
        }

        if (!ratio) {
            throw new Error("The selected font metric ratio is zero.");
        }

        return Math.abs(editedValueMM / ratio);
    }

    function updateLinkedTypeSizeFromField(field) {
        try {
            exactLineSpaceMM = null;
            exactPageHeightMM = null;
            var metricsMM = metricsFromLinkedTypeSizeField(field);

            if (!(metricsMM > 0)) return;

            fMetrics.text =
                formatMeasureValue(metricsMM, currentUnitIndex);

            update();
            syncCompactControls();
            markDirty();
            updatePreviewDocument();
        } catch (_) {}
    }

    var linkedTypeSizeFields = [
        fMetrics,
        oAscender,
        oUppercase,
        oLowercase,
        oDescender,
        oLineSpace
    ];

    for (var linkedIndex = 0;
         linkedIndex < linkedTypeSizeFields.length;
         linkedIndex++) {
        (function (field) {
            field.onChanging = function () {
                // Keep the text untouched while typing. Recalculation happens
                // when editing is complete, preventing partial values from
                // immediately overwriting the field.
                markDirty();
            };

            field.onChange = function () {
                var linkedFallback = field === fMetrics
                    ? 4
                    : mmToUnit(
                        currentResult
                            ? (
                                field === oAscender
                                    ? currentResult.ascender
                                    : field === oUppercase
                                    ? currentResult.uppercase
                                    : field === oLowercase
                                    ? currentResult.lowercase
                                    : field === oDescender
                                    ? currentResult.descender
                                    : currentResult.lineSpace
                              )
                            : unitToMM(4, currentUnitIndex),
                        currentUnitIndex
                    );

                normalizeEditableMeasureField(
                    field,
                    linkedFallback
                );

                if (field === oLineSpace) {
                    try {
                        exactPageHeightMM = null;

                        var fallbackLineSpaceMM = currentResult
                            ? currentResult.lineSpace
                            : unitToMM(5, currentUnitIndex);

                        exactLineSpaceMM = unitToMM(
                            parseMeasureInput(
                                oLineSpace.text,
                                currentUnitIndex,
                                mmToUnit(
                                    fallbackLineSpaceMM,
                                    currentUnitIndex
                                )
                            ),
                            currentUnitIndex
                        );

                        if (!(exactLineSpaceMM > 0)) {
                            exactLineSpaceMM = fallbackLineSpaceMM;
                        }

                        var metricsMM = unitToMM(
                            parseMeasureInput(
                                fMetrics.text,
                                currentUnitIndex,
                                4
                            ),
                            currentUnitIndex
                        );

                        var metricsRatio =
                            parseNumber(fMetricsLine.a.text, 4);

                        var derivedLineRatio =
                            exactLineSpaceMM *
                            metricsRatio /
                            metricsMM;

                        fMetricsLine.b.text =
                            formatNumber(derivedLineRatio);

                        update();
                        syncCompactControls();
                        markDirty();
                        updatePreviewDocument();
                    } catch (_) {}
                    return;
                }

                updateLinkedTypeSizeFromField(field);
            };
        })(linkedTypeSizeFields[linkedIndex]);
    }

    for (var ii = 0; ii < inputFields.length; ii++) {
        (function (field) {
            if (
                isLinkedTypeSizeField(field) ||
                isPageDimensionField(field)
            ) return;

            field.onChanging = function () {
                if (
                    field === fMetricsLine.a ||
                    field === fMetricsLine.b
                ) {
                    exactLineSpaceMM = null;
                }

                if (
                    field === fGridGroupH ||
                    field === fGridRatio.a ||
                    field === fGridRatio.b
                ) {
                    exactGridRows = null;
                }

                if (
                    field === customRatioMetrics ||
                    field === customRatioAscender ||
                    field === customRatioCapHeight ||
                    field === customRatioXHeight ||
                    field === customRatioDescender
                ) {
                    try {
                        setTypeRatios(customRatiosFromFields());
                    } catch (_) {}
                }

                // Preserve raw typing in Rows until editing is complete.
                if (field !== fGridGroupV) {
                    update();
                    syncCompactControls();
                }

                markDirty();
            };

            field.onChange = function () {
                if (
                    field === fMetricsLine.a ||
                    field === fMetricsLine.b
                ) {
                    exactLineSpaceMM = null;
                }

                if (
                    field === fGridGroupH ||
                    field === fGridRatio.a ||
                    field === fGridRatio.b
                ) {
                    exactGridRows = null;
                }

                var normalizedValue =
                    normalizeArithmeticNumberField(
                        field,
                        parseNumber(field.text, 1)
                    );

                if (
                    field === customRatioMetrics ||
                    field === customRatioAscender ||
                    field === customRatioCapHeight ||
                    field === customRatioXHeight ||
                    field === customRatioDescender
                ) {
                    setTypeRatios(customRatiosFromFields());
                }

                if (field === fGridGroupV) {
                    exactGridRows = normalizedValue;

                    // Keep Module Ratio synchronized with directly edited Rows.
                    var columns =
                        parseNumber(fGridGroupH.text, 6);
                    var ratioHorizontal =
                        parseNumber(fGridRatio.a.text, 2);

                    if (
                        columns > 0 &&
                        ratioHorizontal > 0 &&
                        exactGridRows > 0
                    ) {
                        fGridRatio.b.text =
                            formatInputNumber(
                                exactGridRows *
                                ratioHorizontal /
                                columns
                            );
                    }
                }

                update();
                syncCompactControls();
                markDirty();
                updatePreviewDocument();
            };
        })(inputFields[ii]);
    }

    function getDocumentOptions() {
        return {
            facingPages: facingPages.value,
            anamorphicFormat: activeAnamorphicMode(),
            lockFormatRatio: activeFormatRatioLock(),
            useAMaster: useAMaster.value,
            addInformationPage: infoPage.value,
            addPlaceholderText: placeholderText.value,
            snapToGrid: snapToGrid.value,
            snapToGuides: snapToGuides.value,
            gridsInBack: gridsInBack.value,
            createRows: guideRowsCheckbox.value,
            createColumns: guideColumnsCheckbox.value,
            createColumnGuides: columnGuidesCheckbox.value,
            createMajorGridHorizontal: majorGridHorizontalCheckbox.value,
            createMajorGridVertical: majorGridVerticalCheckbox.value,
            unitIndex: currentUnitIndex,
            metricSourceIndex:
                metricsSourceDropdown.selection
                    ? metricsSourceDropdown.selection.index
                    : 0,
            metricSourceKey:
                selectedMetricSourceKey(),
            metricSourceName:
                selectedMetricSourceName(),
            customRatioText:
                customRatioMetrics.text + ":" +
                customRatioAscender.text + ":" +
                customRatioCapHeight.text + ":" +
                customRatioXHeight.text + ":" +
                customRatioDescender.text,
            rowOffsetSourceName:
                rowOffsetSource.selection
                    ? rowOffsetSource.selection.text
                    : "x-Height",
            columnOffsetSourceName:
                columnOffsetSource.selection
                    ? columnOffsetSource.selection.text
                    : "x-Height",
            usesSelectedFont:
                Boolean(
                    selectedMetricSourceKey() ===
                    "selectedFont"
                ),
            selectedFontRecord: selectedFontRecord(),
            guideColor: guideColorSelector.getValue(),
            marginColor: marginColorSelector.getValue(),
            columnColor: columnColorSelector.getValue(),
            baselineGridColor: baselineGridColorSelector.getValue(),
            documentGridColor: documentGridColorSelector.getValue()
        };
    }

    function removePreviewIdleTask() {
        if (!previewIdleTask) return;

        try {
            previewIdleTask.removeEventListener(
                IdleEvent.ON_IDLE,
                handlePreviewIdle
            );
        } catch (_) {
            try {
                previewIdleTask.removeEventListener(
                    "onIdle",
                    handlePreviewIdle
                );
            } catch (__) {}
        }

        try {
            if (previewIdleTask.isValid) {
                previewIdleTask.remove();
            }
        } catch (_) {}

        previewIdleTask = null;
    }

    function cancelPreviewUpdate() {
        previewUpdatePending = false;
        removePreviewIdleTask();
    }

    function closePreviewDocument() {
        cancelPreviewUpdate();
        removeFocusRestoreIdleTask();

        if (previewIsUpdating) {
            previewClosing = true;
            return;
        }

        try {
            if (previewDocument && previewDocument.isValid) {
                previewDocument.close(SaveOptions.NO);
            }
        } catch (_) {}

        previewDocument = null;
        previewClosing = false;
        previewFirstOpen = true;
    }

    function createPreviewIdleTask(delay) {
        removePreviewIdleTask();

        try {
            previewIdleTask = app.idleTasks.add({
                name: PREVIEW_IDLE_TASK_NAME,
                sleep: delay || PREVIEW_DELAY_MS
            });

            try {
                previewIdleTask.addEventListener(
                    IdleEvent.ON_IDLE,
                    handlePreviewIdle
                );
            } catch (_) {
                previewIdleTask.addEventListener(
                    "onIdle",
                    handlePreviewIdle
                );
            }

            return true;
        } catch (_) {
            previewIdleTask = null;
            return false;
        }
    }

    function schedulePreviewUpdate(delay) {
        if (!previewCheckbox.value) return;

        previewUpdatePending = true;

        if (previewIsUpdating) return;

        if (!createPreviewIdleTask(delay || PREVIEW_DELAY_MS)) {
            // Fallback for InDesign versions where IdleTask is unavailable.
            performPreviewUpdate();
        }
    }

    function handlePreviewIdle(event) {
        removePreviewIdleTask();

        if (!previewCheckbox.value || !previewUpdatePending) return;
        performPreviewUpdate();
    }

    function performPreviewUpdate() {
        setDiagnosticAction(
            "Update Preview",
            false
        );

        if (!previewCheckbox.value) return;

        if (previewIsUpdating) {
            previewUpdatePending = true;
            return;
        }

        captureCurrentInputFocus();

        previewIsUpdating = true;
        previewUpdatePending = false;

        var oldPreview = previewDocument;
        var newPreview = null;
        var oldRedraw = true;

        try {
            update();
            if (!currentResult) return;

            try {
                oldRedraw = app.scriptPreferences.enableRedraw;
                app.scriptPreferences.enableRedraw = false;
            } catch (_) {}

            // Build the replacement completely before closing the old preview.
            // This prevents other handlers from referencing an already closed doc.
            newPreview = createDocument(
                currentValues,
                currentResult,
                getDocumentOptions()
            );

            try {
                newPreview.label = "Emetric Preview";
            } catch (_) {}

            previewDocument = newPreview;

            if (oldPreview && oldPreview.isValid && oldPreview !== newPreview) {
                try {
                    oldPreview.close(SaveOptions.NO);
                } catch (_) {}
            }

            // Show the A-Parent in Preview when that option is active.
            // LayoutWindow.activeSpread accepts either a Spread or MasterSpread.
            try {
                if (
                    previewDocument.windows.length > 0 &&
                    previewDocument.windows[0].isValid
                ) {
                    var previewWindow = previewDocument.windows[0];

                    if (placeholderText.value) {
                        try {
                            var placeholderFrame =
                                previewDocument.textFrames.itemByName(
                                    "Placeholder Text"
                                );

                            if (
                                placeholderFrame &&
                                placeholderFrame.isValid &&
                                placeholderFrame.parentPage &&
                                placeholderFrame.parentPage.isValid
                            ) {
                                try {
                                    previewWindow.activePage =
                                        placeholderFrame.parentPage;
                                } catch (_) {
                                    try {
                                        previewWindow.activeSpread =
                                            placeholderFrame.parentPage.parent;
                                    } catch (__) {}
                                }
                            }
                        } catch (_) {}
                    } else if (
                        useAMaster.value &&
                        previewDocument.masterSpreads.length > 0 &&
                        previewDocument.masterSpreads[0].isValid
                    ) {
                        try {
                            previewWindow.activeSpread =
                                previewDocument.masterSpreads[0];
                        } catch (_) {}
                    }

                    // Center the complete spread when Facing Pages is active.
                    // Otherwise fit the single displayed page in the window.
                    try {
                        previewWindow.zoom(
                            facingPages.value
                                ? ZoomOptions.FIT_SPREAD
                                : ZoomOptions.FIT_PAGE
                        );
                    } catch (_) {}
                }
            } catch (_) {}

            previewFirstOpen = false;
        } catch (e) {
            try {
                if (newPreview && newPreview.isValid) {
                    newPreview.close(SaveOptions.NO);
                }
            } catch (_) {}

            previewDocument =
                oldPreview && oldPreview.isValid ? oldPreview : null;

            previewCheckbox.value = false;
            compactPreviewCheckbox.value = false;
            cancelPreviewUpdate();

            reportDiagnosticError(
                "Update Preview",
                e,
                "Preview could not be updated.",
                true
            );
        } finally {
            try {
                app.scriptPreferences.enableRedraw = oldRedraw;
            } catch (_) {}

            previewIsUpdating = false;

            if (previewCheckbox.value && !previewClosing) {
                scheduleInputFocusRestore();
            }

            if (previewClosing) {
                previewClosing = false;
                closePreviewDocument();
                return;
            }

            if (previewCheckbox.value && previewUpdatePending) {
                schedulePreviewUpdate(PREVIEW_DELAY_MS);
            }
        }
    }

    resetButton.onClick = function () {
        reset();

        if (previewCheckbox.value) {
            previewFirstOpen = true;
            schedulePreviewUpdate(50);
        }
    };

    function updatePreviewDocument() {
        schedulePreviewUpdate(PREVIEW_DELAY_MS);
    }

    previewCheckbox.onClick = function () {
        setDiagnosticAction(
            previewCheckbox.value
                ? "Enable Preview"
                : "Disable Preview",
            true
        );

        compactPreviewCheckbox.value = previewCheckbox.value;

        if (previewCheckbox.value) {
            previewFirstOpen = true;
            schedulePreviewUpdate(50);
        } else {
            closePreviewDocument();
        }
    };

    compactPreviewCheckbox.onClick = function () {
        previewCheckbox.value = compactPreviewCheckbox.value;
        previewCheckbox.onClick();
    };


    function syncCompactFieldToMain(
        compactField,
        mainField,
        fieldRole,
        commit
    ) {
        mainField.text =
            compactField.text;

        if (fieldRole === "metrics") {
            exactLineSpaceMM = null;
            exactPageHeightMM = null;

            if (commit) {
                normalizeEditableMeasureField(
                    mainField,
                    4
                );
                compactField.text =
                    mainField.text;
            }
        } else {
            var normalizedValue =
                parseNumber(
                    compactField.text,
                    1
                );

            if (commit) {
                compactField.text =
                    formatInputNumber(
                        normalizedValue
                    );
                mainField.text =
                    compactField.text;
            }

            if (fieldRole === "columns") {
                exactGridRows = null;
            }

            if (fieldRole === "rows") {
                exactGridRows =
                    normalizedValue;

                var columns =
                    parseNumber(
                        fGridGroupH.text,
                        6
                    );
                var ratioHorizontal =
                    parseNumber(
                        fGridRatio.a.text,
                        2
                    );

                if (
                    columns > 0 &&
                    ratioHorizontal > 0 &&
                    exactGridRows > 0
                ) {
                    fGridRatio.b.text =
                        formatInputNumber(
                            exactGridRows *
                            ratioHorizontal /
                            columns
                        );
                }
            }
        }

        update();
        markDirty();
    }

    function connectCompactField(
        compactField,
        mainField,
        fieldRole
    ) {
        compactField.onChanging =
            function () {
                syncCompactFieldToMain(
                    compactField,
                    mainField,
                    fieldRole,
                    false
                );
            };

        compactField.onChange =
            function () {
                syncCompactFieldToMain(
                    compactField,
                    mainField,
                    fieldRole,
                    true
                );
                syncCompactControls();
                updatePreviewDocument();
            };
    }

    connectCompactField(
        compactMetrics,
        fMetrics,
        "metrics"
    );
    connectCompactField(
        compactColumns,
        fGridGroupH,
        "columns"
    );
    connectCompactField(
        compactRows,
        fGridGroupV,
        "rows"
    );

    var compactInputFields = [
        compactMetrics,
        compactColumns,
        compactRows
    ];

    for (
        var compactFieldIndex = 0;
        compactFieldIndex <
            compactInputFields.length;
        compactFieldIndex++
    ) {
        (function (field) {
            try {
                field.onActivate =
                    function () {
                        lastActiveUIField =
                            field;
                        beginEmetricInputEditing(
                            field
                        );

                        try {
                            lastActiveSelection = [
                                0,
                                field.text.length
                            ];
                        } catch (_) {}
                    };

                field.onDeactivate =
                    function () {
                        finishEmetricInputEditing(
                            field
                        );
                    };
            } catch (_) {}
        })(
            compactInputFields[
                compactFieldIndex
            ]
        );
    }

    presetDropdown.onChange = function () {
        if (
            presetDropdownIsUpdating ||
            !presetDropdown.selection
        ) {
            return;
        }

        var selectedItem =
            presetDropdown.selection;
        var presetId =
            selectedItem.presetId;

        if (!presetId) {
            rebuildPresetDropdown(
                currentPresetId
            );
            return;
        }

        var settings =
            presetSettingsForId(
                presetId
            );

        if (!settings) {
            rebuildPresetDropdown(
                currentPresetId
            );
            return;
        }

        applyPresetSettings(
            clonePresetValue(settings),
            presetId
        );
    };

    presetSaveButton.onClick =
        saveCurrentPreset;

    presetDeleteButton.onClick =
        deleteCurrentPreset;

    compactPresetDropdown.onChange =
        function () {
            if (
                compactPresetDropdownIsUpdating ||
                !compactPresetDropdown
                    .selection
            ) {
                return;
            }

            var selectedItem =
                compactPresetDropdown
                    .selection;
            var presetId =
                selectedItem.presetId;

            if (!presetId) {
                rebuildCompactPresetDropdown(
                    currentPresetId
                );
                return;
            }

            var settings =
                presetSettingsForId(
                    presetId
                );

            if (!settings) {
                rebuildCompactPresetDropdown(
                    currentPresetId
                );
                return;
            }

            applyPresetSettings(
                clonePresetValue(
                    settings
                ),
                presetId
            );
        };

    compactViewButton.onClick =
        function () {
            setDiagnosticAction(
                "Open Compact View",
                true
            );
            setCompactMode(true);
        };

    compactFullSettingsButton.onClick =
        function () {
            setDiagnosticAction(
                "Open Full Settings",
                true
            );
            setCompactMode(false);
        };

    compactCreateButton.onClick = function () {
        if (
            primaryCreateIsBlocked()
        ) {
            commitActiveEmetricInput();
            return;
        }

        try {
            createButton.notify("onClick");
        } catch (_) {
            createButton.onClick();
        }
    };

    function optionChanged() {
        markDirty();
        updatePreviewDocument();
    }

    facingPages.onClick = function () {
        updateMarginLabels();
        optionChanged();
    };
    lockFormatRatio.onClick = formatRatioLockChanged;
    anamorphicFormat.onClick = anamorphicFormatChanged;
    useAMaster.onClick = optionChanged;
    infoPage.onClick = optionChanged;
    placeholderText.onClick = optionChanged;
    snapToGrid.onClick = optionChanged;
    snapToGuides.onClick = optionChanged;
    gridsInBack.onClick = optionChanged;
    guideRowsCheckbox.onClick = optionChanged;
    guideColumnsCheckbox.onClick = optionChanged;
    function offsetSourceChanged() {
        update();
        syncCompactControls();
        markDirty();
        updatePreviewDocument();
    }

    rowOffsetSource.onChange = offsetSourceChanged;
    columnOffsetSource.onChange = offsetSourceChanged;
    columnGuidesCheckbox.onClick = optionChanged;
    majorGridHorizontalCheckbox.onClick = optionChanged;
    majorGridVerticalCheckbox.onClick = optionChanged;

    cancelButton.onClick = function () {
        saveLastUsedPresetNow(false);
        removePresetLastUsedIdleTask();
        compactClosing = true;
        cancelPreviewUpdate();
        removeFocusRestoreIdleTask();
        previewCheckbox.value = false;
        compactPreviewCheckbox.value = false;
        closePreviewDocument();

        try { compactWindow.close(); } catch (_) {}
        try { w.close(0); } catch (_) {}
    };

    createButton.onClick = function () {
        if (
            primaryCreateIsBlocked()
        ) {
            commitActiveEmetricInput();
            return;
        }

        setDiagnosticAction(
            "Create Document",
            true
        );

        saveLastUsedPresetNow(false);
        removePresetLastUsedIdleTask();
        cancelPreviewUpdate();
        removeFocusRestoreIdleTask();
        update();
        if (!currentResult) return;

        try {

            closePreviewDocument();

            createDocument(
                currentValues,
                currentResult,
                getDocumentOptions()
            );

            compactClosing = true;
            try { compactWindow.close(); } catch (_) {}
            w.close(1);
        } catch (e) {
            reportDiagnosticError(
                "Create Document",
                e,
                "The document could not be created.",
                true
            );
        }
    };

    function centerVTIWindow() {
        try {
            w.layout.layout(true);

            var screenBounds = null;
            try {
                if ($.screens && $.screens.length > 0) {
                    screenBounds =
                        $.screens[0].visibleBounds ||
                        $.screens[0].bounds ||
                        $.screens[0];
                }
            } catch (_) {}

            if (screenBounds && screenBounds.length >= 4) {
                var left = Number(screenBounds[0]);
                var top = Number(screenBounds[1]);
                var right = Number(screenBounds[2]);
                var bottom = Number(screenBounds[3]);

                var x = Math.round(left + (right - left - w.size.width) / 2);
                var y = Math.round(top + (bottom - top - w.size.height) / 2);
                w.location = [x, y];
            } else {
                w.center();
            }
        } catch (_) {
            try { w.center(); } catch (__) {}
        }
    }

    try {
        setDiagnosticAction(
            "Initialize Emetric",
            false
        );
        initializePresetSystem();
    } catch (initializationError) {
        reportDiagnosticError(
            "Initialize Emetric",
            initializationError,
            "Emetric could not be initialized.",
            true
        );
        return;
    }

    writeDiagnosticInfo(
        "Session started"
    );

    w.onClose = function () {
        writeDiagnosticInfo(
            "Session closed"
        );

        rememberCompactUIState(
            compactMode
        );
        saveLastUsedPresetNow(false);
        removePresetLastUsedIdleTask();

        try {
            previewCheckbox.value = false;
            compactPreviewCheckbox.value = false;
            cancelPreviewUpdate();
            closePreviewDocument();
        } catch (_) {}

        if (!compactClosing) {
            compactClosing = true;
            try { compactWindow.close(); } catch (_) {}
        }

        try {
            if ($.global.__EMETRIC_WINDOW__ === w) {
                $.global.__EMETRIC_WINDOW__ = null;
            }
        } catch (_) {}
    };

    compactWindow.onClose = function () {
        if (compactClosing) return;

        rememberCompactUIState(true);
        saveLastUsedPresetNow(false);
        removePresetLastUsedIdleTask();

        compactClosing = true;

        try {
            previewCheckbox.value = false;
            compactPreviewCheckbox.value = false;
            cancelPreviewUpdate();
            closePreviewDocument();
        } catch (_) {}

        try { w.close(0); } catch (_) {}
    };

    var emetricInitialShowHandled = false;

    w.onShow = function () {
        if (emetricInitialShowHandled) {
            return;
        }

        emetricInitialShowHandled = true;
    };

    var storedUIState =
        ensurePresetUIState();

    if (
        storedUIState.compactMode &&
        validCompactLocation(
            storedUIState
                .compactLocation
        )
    ) {
        try {
            w.location = [
                Number(
                    storedUIState
                        .compactLocation[0]
                ),
                Number(
                    storedUIState
                        .compactLocation[1]
                )
            ];
        } catch (_) {
            centerVTIWindow();
        }
    } else if (
        validCompactLocation(
            storedUIState.mainLocation
        )
    ) {
        try {
            w.location = [
                Number(
                    storedUIState
                        .mainLocation[0]
                ),
                Number(
                    storedUIState
                        .mainLocation[1]
                )
            ];
        } catch (_) {
            centerVTIWindow();
        }
    } else {
        centerVTIWindow();
    }

    emetricInitialShowHandled = true;

    if (
        !activeEmetricInputField()
    ) {
        setPrimaryCreateEnabled(true);
    }

    w.show();
    refreshEmetricWindow(w);

    if (previewCheckbox.value) {
        previewFirstOpen = true;
        schedulePreviewUpdate(50);
    }

    if (storedUIState.compactMode) {
        setCompactMode(
            true,
            true
        );
    }

})();
