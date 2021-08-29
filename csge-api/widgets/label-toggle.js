import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.LabelToggle", class wLabelToggle extends Widget {

	/**
	 * Get/set opacity
	 */
	set checked(value) {
		this.Elem('labelChk').value = value;
	}
	
	get checked() {
		return this.Elem('labelChk').value;
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize styler widget
	 * @param {object} container - div styler container and properties
	 * @returns {void}
	 */	
	constructor(...config) {
		super(...config);

		this.Node('labelChk').On("change", this.OnLabelChk_Changed.bind(this));
	}

	Localize(nls) {
		nls.Add("Legend_Label_Name", "en", "Map labels");
		nls.Add("Legend_Label_Name", "fr", "Étiquettes sur la carte");	
		nls.Add("Legend_Show_label", "en", " Show label");
		nls.Add("Legend_Show_label", "fr", " Afficher les étiquettes");	
		nls.Add("Legend_label_Info", "en", " Show labels over the features in the map");
		nls.Add("Legend_label_Info", "fr", " Afficher des étiquettes sur les entités de la carte");	
	}

	/**
	 * Respond to change in label toggle
	 * @param {object} ev - Event received from label toggle
	 * @returns {void}
	 */
	OnLabelChk_Changed(ev) {
		this.Emit("change", { checked: this.Elem('labelChk').checked });
	}

	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	HTML() {
		return	"<div class='label-toggle'>" +
					"<label>nls(Legend_Label_Name)</label>" +
					"<i class='fa fa-info-circle'><span class='tooltipText tooltip-bottom'>nls(Legend_label_Info)</span></i>" +
					"<div class='label-name-container'>" +
						"<label>" + 
							"<input handle='labelChk' type=checkbox class='labelName-checkbox'>" + 
							"nls(Legend_Show_label)" + 
						"</label>" + 
					"</div>" +
				"</div>";
	}
})
