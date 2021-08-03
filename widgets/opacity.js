import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.Opacity", class Opacity extends Widget {

	/**
	 * Get/set opacity
	 */
	set value(value) {
		this.Elem('sOpacity').value = value * 100;
	}
	
	get value() {
		return this.Elem('sOpacity').value / 100;
	}
	/**
	 * Call constructor of base class (Templated) and initialize styler widget
	 * @param {object} container - div styler container and properties
	 * @returns {void}
	 */	
	constructor(container) {
		super(container);

		this.Node('sOpacity').On("change", this.OnOpacity_Changed.bind(this));
	}

	Localize(nls) {
		nls.Add("Legend_Opacity", "en", "Opacity");
		nls.Add("Legend_Opacity", "fr", "Opacité");	
		nls.Add("Legend_Opacity_Info", "en", "Use the opacity bar to update the transparency of the features on the map. The closer the slider is to «Less», the lower the transparency value, and vice versa.");
		nls.Add("Legend_Opacity_Info", "fr", "Utilisez la barre d'opacité pour mettre à jour la transparence des entités sur la carte. Plus le curseur est proche de «Moins», plus la valeur de transparence est faible, et vice versa.");	
		nls.Add("Legend_Opacity_Less", "en", "Less");
		nls.Add("Legend_Opacity_Less", "fr", "Moins");	
		nls.Add("Legend_Opacity_More", "en", "More");
		nls.Add("Legend_Opacity_More", "fr", "Plus");
	}

	/**
	 * Respond to change in opacity slider
	 * @param {object} ev - Event received from opacity slider
	 * @returns {void}
	 */
	OnOpacity_Changed(ev) {
		this.Emit("change", { opacity:this.value });
	}

	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	HTML() {
		return	"<div class='opacity-slider'>" +
					"<label>nls(Legend_Opacity)</label>" +
					"<i class='fa fa-info-circle'><span class='tooltipText tooltip-bottom'>nls(Legend_Opacity_Info)</span></i>" +
					"<div class='opacity-container'>" +
						"<input handle='sOpacity' type='range' class='opacity' min=0 max=100 />" + 
						"<div class='opacity-labels-container'>" +
							"<label>nls(Legend_Opacity_Less)</label>" +
							"<label>nls(Legend_Opacity_More)</label>" +
						"</div>" +
					"</div>" +
				"</div>"
	}
})
