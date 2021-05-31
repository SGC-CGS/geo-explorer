// Source: https://d3js.org/colorbrewer.v1.min.js
export default class Colors {
  static ColorSchemes() {
    return {
        Blues: {
            "label": {
                "en": "Blues",
                "fr": "Bleus",
            },
            3: ["#deebf7", "#9ecae1", "#3182bd"],
            4: ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"],
            5: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
            6: ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
            7: ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
            8: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"]
        },
        Greens: {
            "label": {
                "en": "Greens",
                "fr": "Verts",
            },
            3: ["#e5f5e0", "#a1d99b", "#31a354"],
            4: ["#edf8e9", "#bae4b3", "#74c476", "#238b45"],
            5: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
            6: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c"],
            7: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
            8: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"]
        },
        Greys: {
            "label": {
                "en": "Greys",
                "fr": "Gris",
            },
            3: ["#f0f0f0", "#bdbdbd", "#636363"],
            4: ["#f7f7f7", "#cccccc", "#969696", "#525252"],
            5: ["#f7f7f7", "#cccccc", "#969696", "#636363", "#252525"],
            6: ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#636363", "#252525"],
            7: ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525"],
            8: ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525"]
        },
        Oranges: {
            "label": {
                "en": "Oranges",
                "fr": "Orange",
            },
            3: ["#fee6ce", "#fdae6b", "#e6550d"],
            4: ["#feedde", "#fdbe85", "#fd8d3c", "#d94701"],
            5: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
            6: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d", "#a63603"],
            7: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],
            8: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"]
        },
        Purples: {
            "label": {
                "en": "Purples",
                "fr": "Violets",
            },
            3: ["#efedf5", "#bcbddc", "#756bb1"],
            4: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#6a51a3"],
            5: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"],
            6: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
            7: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
            8: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"]
        },
        Reds: {
            "label": {
                "en": "Reds",
                "fr": "Rouges",
            },
            3: ["#fee0d2", "#fc9272", "#de2d26"],
            4: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
            5: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
            6: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"],
            7: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
            8: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"]
        },
        BrBG: {
            "label": {
                "en": "Brown-Blue-Green",
                "fr": "Marron-Bleu-Vert",
            },
            3: ["#d8b365", "#f5f5f5", "#5ab4ac"],
            4: ["#a6611a", "#dfc27d", "#80cdc1", "#018571"],
            5: ["#a6611a", "#dfc27d", "#f5f5f5", "#80cdc1", "#018571"],
            6: ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#01665e"],
            7: ["#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"],
            8: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e"]
        },
        PiYG: {
            "label": {
                "en": "Pink-Yellow-Green",
                "fr": "Rose-Juane-Vert",
            },
            3: ["#e9a3c9", "#f7f7f7", "#a1d76a"],
            4: ["#d01c8b", "#f1b6da", "#b8e186", "#4dac26"],
            5: ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26"],
            6: ["#c51b7d", "#e9a3c9", "#fde0ef", "#e6f5d0", "#a1d76a", "#4d9221"],
            7: ["#c51b7d", "#e9a3c9", "#fde0ef", "#f7f7f7", "#e6f5d0", "#a1d76a", "#4d9221"],
            8: ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"]
        },
        PRGn: {
            "label": {
                "en": "Purple-Red-Green",
                "fr": "Violet-Rouge-Vert",
            },
            3: ["#af8dc3", "#f7f7f7", "#7fbf7b"],
            4: ["#7b3294", "#c2a5cf", "#a6dba0", "#008837"],
            5: ["#7b3294", "#c2a5cf", "#f7f7f7", "#a6dba0", "#008837"],
            6: ["#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"],
            7: ["#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b", "#1b7837"],
            8: ["#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837"]
        },
        PuOr: {
            "label": {
                "en": "Purple-Orange",
                "fr": "Violet-Orange",
            },
            3: ["#f1a340", "#f7f7f7", "#998ec3"],
            4: ["#e66101", "#fdb863", "#b2abd2", "#5e3c99"],
            5: ["#e66101", "#fdb863", "#f7f7f7", "#b2abd2", "#5e3c99"],
            6: ["#b35806", "#f1a340", "#fee0b6", "#d8daeb", "#998ec3", "#542788"],
            7: ["#b35806", "#f1a340", "#fee0b6", "#f7f7f7", "#d8daeb", "#998ec3", "#542788"],
            8: ["#b35806", "#e08214", "#fdb863", "#fee0b6", "#d8daeb", "#b2abd2", "#8073ac", "#542788"]
        }, 
        RdBu: {
            "label": {
                "en": "Red-Blue",
                "fr": "Rouge-Bleu",
            },
            3: ["#ef8a62", "#f7f7f7", "#67a9cf"],
            4: ["#ca0020", "#f4a582", "#92c5de", "#0571b0"],
            5: ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
            6: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
            7: ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
            8: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"]
        },
        RdGy: {
            "label": {
                "en": "Red-Grey",
                "fr": "Rouge-Gris",
            },
            3: ["#ef8a62", "#ffffff", "#999999"],
            4: ["#ca0020", "#f4a582", "#bababa", "#404040"],
            5: ["#ca0020", "#f4a582", "#ffffff", "#bababa", "#404040"],
            6: ["#b2182b", "#ef8a62", "#fddbc7", "#e0e0e0", "#999999", "#4d4d4d"],
            7: ["#b2182b", "#ef8a62", "#fddbc7", "#ffffff", "#e0e0e0","#999999", "#4d4d4d"],
            8: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#e0e0e0", "#bababa", "#878787", "#4d4d4d"]
        },
        RdYlGn: {
            "label": {
                "en": "Red-Yellow-Green",
                "fr": "Rouge-Jaune-Vert",
            },
            3: ["#fc8d59", "#ffffbf", "#91cf60"],
            4: ["#d7191c", "#fdae61", "#a6d96a", "#1a9641"],
            5: ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"],
            6: ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"],
            7: ["#d73027", "#fc8d59", "#fee08b", "#ffffbf", "#d9ef8b", "#91cf60", "#1a9850"],
            8: ["#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850"]
        }
    };
  }
}
