// Source: https://d3js.org/colorbrewer.v1.min.js
// Visual source: https://observablehq.com/@d3/color-schemes
// ColorBrewer: https://colorbrewer2.org/#type=sequential&scheme=YlOrBr&n=3
// Palette Generator: https://learnui.design/tools/data-color-picker.html
export default class Colors {
  static ColorSchemes() {
    return {
        ///////////////
        // Template //
        /////////////
        // Template: {
        //     "label": {
        //         "en": "",
        //         "fr": "",
        //     },
        //     3: [],
        //     4: [],
        //     5: [],
        //     6: [],
        //     7: [],
        //     8: []
        // },

        ///////////////////////////////
        //  Sequential (Single-Hue) //
        /////////////////////////////
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
		// Custom cyans //
        Turquoises: {
            "label": {
                "en": "Turquoises",
                "fr": "Turquoises",
            },
            3: ["#ddffff", "#7db3b5", "#096c72"],
            4: ["#ddffff", "#9dcccd", "#5d9b9e", "#096c72"],
            5: ["#ddffff", "#add8d9", "#7db3b5", "#4c8f93", "#096c72"],
            6: ["#ddffff", "#b6e0e1", "#90c2c4", "#6aa4a7", "#42888c", "#096c72"],
            7: ["#ddffff", "#bde5e6", "#9dcccd", "#7db3b5", "#5d9b9e", "#3b8388", "#096c72"],
            8: ["#ddffff", "#c1e9e9", "#a6d3d4", "#8bbebf", "#6fa9ab", "#539498", "#358085", "#096c72"]
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
		// Custom yellows //
        Yellows: {
            // Sequential 
            "label": {
                "en": "Yellows",
                "fr": "Jaunes",
            },
            3: ["#ffffb6", "#fad765", "#ffa600"],
            4: ["#ffffb6", "#fae580", "#fbc74a", "#ffa600"],
            5: ["#ffffb6", "#fbec8d", "#fad765", "#fcc03c", "#ffa600"],
            6: ["#ffffb6", "#fbf095", "#fadf75", "#fbce55", "#fcbb33", "#ffa600"],
            7: ["#ffffb6", "#fcf29b", "#fae580", "#fad765", "#fbc74a", "#fdb72d", "#ffa600"],
            8: ["#ffffb6", "#fcf49f", "#fbe987", "#fadd70", "#fad059", "#fbc342", "#fdb528", "#ffa600"]
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
		// Custom pinks //
        Pinks: {
            // Sequential 
            "label": {
                "en": "Pinks",
                "fr": "Roses",
            },
            3: ["#fde0dd", "#ee889f", "#c51b8a"],
            4: ["#fde0dd", "#f5a6ae", "#e36994", "#c51b8a"],
            5: ["#fde0dd", "#f8b5b8", "#ee889f", "#dd5990", "#c51b8a"],
            6: ["#fde0dd", "#f9bdbf", "#f29aa8", "#e87698", "#d94e8e", "#c51b8a"],
            7: ["#fde0dd", "#fac3c3", "#f5a6ae", "#ee889f", "#e36994", "#d6478d", "#c51b8a"],
            8: ["#fde0dd", "#fbc7c6", "#f7aeb4", "#f195a5", "#ea7b9a", "#e06091", "#d4428c", "#c51b8a"]
        },
		// Custom magentas //
        Magentas: {
            // Sequential 
            "label": {
                "en": "Magentas",
                "fr": "Magentas",
            },
            3: ["#fcd8f6", "#b87ab0", "#741a6e"],
            4: ["#fcd8f6", "#cf99c7", "#a15c99", "#741a6e"],
            5: ["#fcd8f6", "#daa8d2", "#b87ab0", "#964c8e", "#741a6e"],
            6: ["#fcd8f6", "#e1b2da", "#c68cbe", "#aa68a2", "#8f4388", "#741a6e"],
            7: ["#fcd8f6", "#e5b8de", "#cf99c7", "#b87ab0", "#a15c99", "#8b3d83", "#741a6e"],
            8: ["#fcd8f6", "#e9bde2", "#d5a2cd", "#c287ba", "#ae6da6", "#9b5393", "#883880", "#741a6e"]
        },
		// Custom browns //
        Browns: {
            // Sequential 
            "label": {
                "en": "Browns",
                "fr": "Bruns",
            },
            3: ["#ffeecf", "#b39771", "#6a481e"],
            4: ["#ffeecf", "#cbb48f", "#9a7c54", "#6a481e"],
            5: ["#ffeecf", "#d8c29f", "#b39771", "#8e6f46", "#6a481e"],
            6: ["#ffeecf", "#e0cba8", "#c1a883", "#a4875f", "#87673e", "#6a481e"],
            7: ["#ffeecf", "#e5d0ae", "#cbb48f", "#b39771", "#9a7c54", "#826138", "#6a481e"],
            8: ["#ffeecf", "#e9d5b3", "#d3bc98", "#bda37e", "#a88b64", "#93744c", "#7e5e35", "#6a481e"]
        },
		
        /////////////////////////////
        // Sequential (Multi-Hue) //
        ///////////////////////////
        BuGn: {
            "label": {
                "en": "Blue-Green",
                "fr": "Bleu-Vert",
            },
            3: ["#e5f5f9","#99d8c9","#2ca25f"],
            4: ["#edf8fb","#b2e2e2","#66c2a4","#238b45"],
            5: ["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
            6: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],
            7: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
            8: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"]
        },
        BuPu: {
            "label": {
                "en": "Blue-Purple",
                "fr": "Bleu-Violet",
            },
            3: ["#e0ecf4","#9ebcda","#8856a7"],
            4: ["#edf8fb","#b3cde3","#8c96c6","#88419d"],
            5: ["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],
            6: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8856a7","#810f7c"],
            7: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
            8: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"]
        },
        GnBu: {
            "label": {
                "en": "Green-Blue",
                "fr": "Vert-Bleu",
            },
            3: ["#e0f3db","#a8ddb5","#43a2ca"],
            4: ["#f0f9e8","#bae4bc","#7bccc4","#2b8cbe"],
            5: ["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],
            6: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],
            7: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
            8: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"]
        },
        OrRd: {
            "label": {
                "en": "Orange-Red",
                "fr": "Orange-Rouge",
            },
            3: ["#fee8c8","#fdbb84","#e34a33"],
            4: ["#fef0d9","#fdcc8a","#fc8d59","#d7301f"],
            5: ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],
            6: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"],
            7: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
            8: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"]
        },
        PuBu: {
            "label": {
                "en": "Purple-Blue",
                "fr": "Violet-Bleu",
            },
            3: ["#ece7f2","#a6bddb","#2b8cbe"],
            4: ["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],
            5: ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
            6: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],
            7: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
            8: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"]
        },
		PuRd: {
            "label": {
                "en": "Purple-Red",
                "fr": "Violet-Rouge",
            },
			3:["#e7e1ef","#c994c7","#dd1c77"],
			4:["#f1eef6","#d7b5d8","#df65b0","#ce1256"],
			5:["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],
			6:["#f1eef6","#d4b9da","#c994c7","#df65b0","#dd1c77","#980043"],
			7:["#f1eef6","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
			8:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
		},
        RdPu: {
            "label": {
                "en": "Red-Purple",
                "fr": "Rouge-Violet",
            },
            3: ["#fde0dd","#fa9fb5","#c51b8a"],
            4: ["#feebe2","#fbb4b9","#f768a1","#ae017e"],
            5: ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
            6: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],
            7: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
            8: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"]
        },
        YlGn: {
            "label": {
                "en": "Yellow-Green",
                "fr": "Jaune-Vert",
            },
            3: ["#f7fcb9","#addd8e","#31a354"],
            4: ["#ffffcc","#c2e699","#78c679","#238443"],
            5: ["#ffffcc","#c2e699","#78c679","#31a354","#006837"],
            6: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"],
            7: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
            8: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"]
        },
        YlGnBu: {
            "label": {
                "en": "Yellow-Green-Blue",
                "fr": "Jaune-Vert-Bleu",
            },
            3: ["#edf8b1","#7fcdbb","#2c7fb8"],
            4: ["#ffffcc","#a1dab4","#41b6c4","#225ea8"],
            5: ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
            6: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
            7: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
            8: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"]
        },
        YlOrBr: {
            "label": {
                "en": "Yellow-Orange-Brown",
                "fr": "Jaune-Orange-Brun",
            },
            3: ["#fff7bc","#fec44f","#d95f0e"],
            4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
            5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
            6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
            7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
            8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"]
        },
        // Plasma: {
        //     "label": {
        //         "en": "Plasma",
        //         "fr": "Plasma",
        //     },
        //     3: ["#0d0887","#cc4778","#f0f921"],
        //     4: ["#0d0887","#9c179e","#ed7953","#f0f921"],
        //     5: ["#0d0887","#7e03a8","#cc4778","#f89540","#f0f921"],
        //     6: ["#0d0887","#6a00a8","#b12a90","#e16462","#fca636","#f0f921"],
        //     7: ["#0d0887","#5c01a6","#9c179e","#cc4778","#ed7953","#fdb42f","#f0f921"],
        //     8: ["#0d0887","#5302a3","#8b0aa5","#b83289","#db5c68","#f48849","#febd2a","#f0f921"]
        // },
        // Warm: {
        //     "label": {
        //         "en": "Warm",
        //         "fr": "Chaud",
        //     },
        //     3: ["#6e40aa","#ff5e63","#aff05b"],
        //     4: ["#6e40aa","#ee4395","#ff8c38","#aff05b"],
        //     5: ["#6e40aa","#d23ea7","#ff5e63","#efa72f","#aff05b"],
        //     6: ["#6e40aa","#bf3caf","#fe4b83","#ff7847","#e2b72f","#aff05b"],
        //     7: ["#6e40aa","#b23cb2","#ee4395","#ff5e63","#ff8c38","#d9c231","#aff05b"],
        //     8: ["#6e40aa","#a83cb3","#df40a1","#ff507a","#ff704e","#f89b31","#d2c934","#aff05b"]
        // },
		// Custom warmer //
        Warmer: {
            "label": {
                "en": "Warmer",
                "fr": "+Chaud",
            },
            3: ["#ffeb89","#e58481","#6d4e7e"],
            4: ["#ffeb89","#faa27b","#c46c86","#6d4e7e"],
            5: ["#ffeb89","#ffb37a","#e58481","#b16386","#6d4e7e"],
            6: ["#ffeb89","#ffbe7b","#f3957d","#d37584","#a45e86","#6d4e7e"],
            7: ["#ffeb89","#ffc57c","#faa27b","#e58481","#c46c86","#9b5b86","#6d4e7e"],
            8: ["#ffeb89","#ffcb7d","#feac7b","#ef907e","#d87983","#b96786","#955985","#6d4e7e"]
        },		
        // Cool: {
        //     "label": {
        //         "en": "Cool",
        //         "fr": "Cool",
        //     },
        //     3: ["#6e40aa","#1ac7c2","#aff05b"],
        //     4: ["#6e40aa","#2f96e0","#28ea8d","#aff05b"],
        //     5: ["#6e40aa","#417de0","#1ac7c2","#40f373","#aff05b"],
        //     6: ["#6e40aa","#4c6edb","#23abd8","#1ddfa3","#52f667","#aff05b"],
        //     7: ["#6e40aa","#5465d6","#2f96e0","#1ac7c2","#28ea8d","#60f760","#aff05b"],
        //     8: ["#6e40aa","#585fd2","#3988e1","#1fb3d3","#1bd9ac","#34f07e","#6bf75c","#aff05b"]
        // },
		// Custom cooler //
        Cooler: {
            "label": {
                "en": "Cooler",
                "fr": "Frais",
            },
            3: ["#c4ffb3","#00abae","#02507a"],
            4: ["#c4ffb3","#4dc8b2","#008ca4","#02507a"],
            5: ["#c4ffb3","#6bd7b2","#00abae","#007d9c","#02507a"],
            6: ["#c4ffb3","#7cdfb2","#34bdb1","#0099a9","#007497","#02507a"],
            7: ["#c4ffb3","#88e5b2","#4dc8b2","#00abae","#008ca4","#006e93","#02507a"],
            8: ["#c4ffb3","#90e9b2","#5ed1b2","#28b8b0","#009eab","#0084a0","#006a90","#02507a"]
        },
		
        ////////////////
        // Diverging //
        //////////////
        
		// To reverse //
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
		// To reverse //
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
		// To reverse //		
        PiYG: {
            "label": {
                "en": "Pink-Yellow-Green",
                "fr": "Rose-Jaune-Vert",
            },
            3: ["#e9a3c9", "#f7f7f7", "#a1d76a"],
            4: ["#d01c8b", "#f1b6da", "#b8e186", "#4dac26"],
            5: ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26"],
            6: ["#c51b7d", "#e9a3c9", "#fde0ef", "#e6f5d0", "#a1d76a", "#4d9221"],
            7: ["#c51b7d", "#e9a3c9", "#fde0ef", "#f7f7f7", "#e6f5d0", "#a1d76a", "#4d9221"],
            8: ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"]
        },
        // Custom PiBu ////
        // To reverse //
		PiBu: {
            // Diverging 
            "label": {
                "en": "Pink-Blue",
                "fr": "Rose-Bleu",
            },
            3: ["#e9a3c9", "#f7f7f7", "#67a9cf"],
            4: ["#d01c8b", "#f1b6da", "#92c5de", "#0571b0"],
            5: ["#d01c8b", "#f1b6da", "#f7f7f7", "#92c5de", "#0571b0"],
            6: ["#c51b7d", "#e9a3c9", "#fde0ef", "#d1e5f0", "#67a9cf", "#2166ac"],
            7: ["#c51b7d", "#e9a3c9", "#fde0ef", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
            8: ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"]
        },
        // To reverse //
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
		// Custom Blue-Orange //
		BuOr: {
			// Diverging 
            "label": {
                "en": "Blue-Orange",
                "fr": "Bleu-Orange",
            },
            3: ["#9dceda", "#f9f9f9", "#ffcc8e"],
            4: ["#09a4bc", "#9dceda", "#ffcc8e", "#f8a108"],
            5: ["#09a4bc", "#9dceda", "#f9f9f9", "#ffcc8e", "#f8a108"],
            6: ["#09a4bc", "#7bc0d0", "#bddde5", "#ffdbb2", "#ffbe6a", "#f8a108"],
            7: ["#09a4bc", "#7bc0d0", "#bddde5", "#f9f9f9", "#ffdbb2", "#ffbe6a", "#f8a108"],
            8: ["#09a4bc", "#69b9cb", "#9dceda", "#cce4ea", "#ffe3c3", "#ffcc8e", "#ffb658", "#f8a108"]
        },
        // To reverse //
		RdYlBu: {
            "label": {
                "en": "Red-Yellow-Blue",
                "fr": "Rouge-Jaune-Bleu",
            },
			3:["#fc8d59","#ffffbf","#91bfdb"],
			4:["#d7191c","#fdae61","#abd9e9","#2c7bb6"],
			5:["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
			6:["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],
			7:["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],
			8:["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"]
        },
        // To reverse //
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
        },
		// To reverse //
		Spectral: {
            "label": {
                "en": "Spectral",
                "fr": "Spectral",
            },
			3:["#fc8d59","#ffffbf","#99d594"],
			4:["#d7191c","#fdae61","#abdda4","#2b83ba"],
			5:["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],
			6:["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"],
			7:["#d53e4f","#fc8d59","#fee08b","#ffffbf","#e6f598","#99d594","#3288bd"],
			8:["#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd"]
		},
        //////////////
        // Custom ////
        //////////////
	
    };
  }
}
