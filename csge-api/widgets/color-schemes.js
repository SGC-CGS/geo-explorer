import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Tooltip from "../ui/tooltip.js";
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
		
		this.tooltip = new Tooltip();

		Object.values(Colors.ColorSchemes()).forEach(scheme =>{
			let palette = Dom.Create("span", { className:"palette" }, this.Elem("scheme"));

			palette.addEventListener("click", () => this.Emit("change", { scheme:scheme }));

			palette.addEventListener("mouseenter", () => {
				this.tooltip.content = `${this.Nls("Styler_Color_Scheme_Info")} ${scheme.label[Core.locale]}`;
			})

			palette.addEventListener("mousemove", (ev) => this.tooltip.Show(ev.pageX + 10 , ev.pageY - 28));
			palette.addEventListener("mouseleave", () => this.tooltip.Hide());
			
			// Add 5 swatches to the palette
			scheme[5].forEach(color => {
				let swatch = Dom.Create("span", { className:"swatch" }, palette);

				swatch.style.backgroundColor = color;
			});
		});
	}

	Localize(nls) {
		nls.Add("Styler_Color_Scheme", "en", "Color Schemes");
		nls.Add("Styler_Color_Scheme", "fr", "Gamme de schèmas");
		nls.Add("Styler_Color_Scheme_Info", "en", "Select a palette to update the map's color scheme. This palette is called: ");
		nls.Add("Styler_Color_Scheme_Info", "fr", "Sélectionnez une palette pour mettre à jour le schéma de couleurs de la carte. Cette palette s'appelle: ");
	}

	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	HTML() {
		return  "<div class='color-schemes'>" +
					"<label>nls(Styler_Color_Scheme)</label>" +
					"<div handle='scheme' class='color-scheme-container'></div>" +
				"</div>";
	}
})
