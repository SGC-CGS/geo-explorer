import Templated from '../../components/templated.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

import LegendBreak from './legend-break.js';

/**
 * Legend widget module
 * @module widgets/legend/legend
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Legend", class Legend extends Templated {
	
	/**
	 * Get/set opacity
	 */
	set Opacity(value) {
		this.Elem('sOpacity').value = value * 100;
	}
	
	get Opacity() {
		return this.Elem('sOpacity').value / 100;
	}
	
	/**
	 * Return text for legend widget in both languages
	 * @returns {object.<string, string>} Legend widget text for each language
	 */	
	static Nls(nls) {
		nls.Add("Legend_Title", "en", "Map legend");
		nls.Add("Legend_Title", "fr", "Légende de la carte");	
		nls.Add("Legend_Indicators", "en", "Selected indicators");
		nls.Add("Legend_Indicators", "fr", "Indicateurs sélectionnés");	
		nls.Add("Legend_Opacity", "en", "Opacity");
		nls.Add("Legend_Opacity", "fr", "Opacité");	
		nls.Add("Legend_Opacity_Less", "en", "Less");
		nls.Add("Legend_Opacity_Less", "fr", "Moins");	
		nls.Add("Legend_Opacity_More", "en", "More");
		nls.Add("Legend_Opacity_More", "fr", "Plus");	
		nls.Add("Legend_Context_Layers", "en", "Context layers");
		nls.Add("Legend_Context_Layers", "fr", "Données contextuelles");	
		nls.Add("Legend_Label_Name", "en", "Map labels");
		nls.Add("Legend_Label_Name", "fr", "Étiquettes sur la carte");	
		nls.Add("Legend_Show_label", "en", " Show label");
		nls.Add("Legend_Show_label", "fr", " Afficher les étiquettes");	
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize legend widget
	 * @param {object} container - div legend container and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)	  
	 * @returns {void}
	 */	
	constructor(container, options) {	
		super(container, options);
		
		this.Node('sOpacity').On("change", this.OnOpacity_Changed.bind(this));

		this.Node('labelChk').On("click", ev => {
			this.Emit("LabelName", { checked: this.Elem('labelChk').checked });
		})
	}
	
	/**
	 * Load indicators and class breaks and clear checked values on legend widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {	
		this.context = context;
		
		this.LoadIndicators(context.IndicatorItems());
		this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);

		this.Elem("labelChk").checked = false;
		this.Elem("labelChk").removeAttribute("checked");
		
	}
	
	/**
	 * Create list elements in Dom for selected indicators
	 * @param {object[]} indicators - List of indicator IDs and labels to load
	 * @returns {void}
	 */
	LoadIndicators(indicators) {
		Dom.Empty(this.Elem("indicators"));
		
		indicators.forEach((i) => {
			Dom.Create("li", { innerHTML:i.label }, this.Elem("indicators"));			
		});
	}
	
	/**
	 * Create legend break object from class break info
	 * @param {object[]} classBreakInfos - Object describing class breaks
	 * @returns {void}
	 */
	LoadClassBreaks(classBreakInfos) {
		Dom.Empty(this.Elem("breaks"));
		
		this.breaks = classBreakInfos.map((c, i) => {
			return new LegendBreak(this.Elem('breaks'), c);
		});
	}
	
	/**
	 * Add context layer information to Dom
	 * @param {string} label - Label for context layer
	 * @param {oject} data - Data to add to event listener (confirm)
	 * @param {string} checked - Value for checkbox (confirm)
	 * @returns {void}
	 */
	AddContextLayer(label, data, checked) {
		var div = Dom.Create("li", { className:"context-layer" }, this.Elem("cLayers"));
		var chk = Dom.Create("input", { id:Core.NextId(), className:"context-layer-check", type:"checkbox", checked: checked}, div);
		var lbl = Dom.Create("label", { htmlFor:chk.id, className:"context-layer-label", innerHTML:label }, div);

		chk.addEventListener("change", ev => {
			this.Emit("LayerVisibility", {data: data, checked:chk.checked});
		});
	}

	/**
	 * Respond to change in opacity slider
	 * @param {object} ev - Event received from opacity slider
	 * @returns {void}
	 */
	OnOpacity_Changed(ev) {
		this.Emit("Opacity", { opacity:this.Opacity });
	}
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for legend widget
	 */	
	Template() {
		return	"<div class='overlay-body' handle='body'>" + 
				"<label>nls(Legend_Indicators)</label>" +
				"<ul handle='indicators'></ul>" +
				"<label>nls(Legend_Title)</label>" +
				"<table handle='breaks' class='breaks-container'>" + 
					// Class breaks go here, dynamically created
				"</table>" +
				"<label>nls(Legend_Opacity)</label>" +
				"<div class='opacity-container'>" +
				   "<input handle='sOpacity' type='range' class='opacity' min=0 max=100 />" + 
				   "<div class='opacity-labels-container'>" +
					  "<label>nls(Legend_Opacity_Less)</label>" +
					  "<label>nls(Legend_Opacity_More)</label>" +
				   "</div>" +
				"</div>" +
				"<label>nls(Legend_Context_Layers)</label>" +
				"<ul handle='cLayers' class='context-layers-container'>" + 
				"</div>" +
				"<label>nls(Legend_Label_Name)</label>" +
				"<ul class='label-name-container'>" +
					"<li class='labelName'>" +
						"<input handle='labelChk' type=checkbox class='labelName-checkbox'>" + 
						"<label class='labelName-label'>nls(Legend_Show_label)</label>" + 
					"</li>" +
				"</ul>";
	}
})
