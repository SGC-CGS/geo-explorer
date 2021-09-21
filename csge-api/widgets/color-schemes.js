import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Colors from '../tools/colors.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.ColorSchemes", class wColorSchemes extends Widget {

	/**
	 * Call constructor of base class (Templated) and initialize styler widget
	 * @param {object} container - div styler container and properties
	 * @returns {void}
	 */	
	constructor(...config) {
		super(...config);
		
		Object.values(Colors.ColorSchemes()).forEach(scheme =>{
			let title = this.Nls("Styler_Color_Scheme_Info", [scheme.label[Core.locale]]);
			let palette = Dom.Create("span", { className:"palette", title:title }, this.Elem("scheme"));

			palette.addEventListener("click", () => this.Emit("change", { scheme:scheme }));

			// Add 5 swatches to the palette
			scheme[5].forEach(color => {
				let swatch = Dom.Create("span", { className:"swatch" }, palette);

				swatch.style.backgroundColor = color;
			});
		});
	}

	Localize(nls) {
		nls.Add("Styler_Color_Scheme_Info", "en", "Redraw the map using the '{0}' color scheme.");
		nls.Add("Styler_Color_Scheme_Info", "fr", "Redessiner la carte en utilisant le schéma de couleur '{0}'.");
	}

	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	HTML() {
		return  "<div class='color-schemes'>" +
					"<div handle='scheme' class='color-scheme-container'></div>" +
				"</div>";
	}
})
