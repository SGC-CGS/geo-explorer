import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.Opacity", class wOpacity extends Widget {

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
	constructor(...config) {
		super(...config);

		this.Node('sOpacity').On("change", this.OnOpacity_Changed.bind(this));
	}

	Localize(nls) {	
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
