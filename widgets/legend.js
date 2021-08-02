import BaseLegend from '../../geo-explorer-api/widgets/legend/legend.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';

/**
 * Legend widget module
 * @module widgets/legend/legend
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Legend", class Legend extends BaseLegend {

	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Legend_Title") }
	
	/**
	 * Call constructor of base class (Templated) and initialize legend widget
	 * @param {object} container - div legend container and properties
	 * @returns {void}
	 */	
	constructor(container) {	
		super(container);
		
		this.Node('sOpacity').On("change", this.OnOpacity_Changed.bind(this));

		this.Node('labelChk').On("click", ev => {
			this.Emit("LabelName", { checked: this.Elem('labelChk').checked });
		})
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(config) {
		this.config.opacity = config.opacity;
		
		this.Elem('sOpacity').value = this.config.opacity * 100;
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
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
	 * Load indicators and class breaks and clear any checked values on legend widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {	
		super.Update(context);
		
		this.LoadIndicators(context.IndicatorItems());

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
		var opacity = this.Elem('sOpacity').value / 100;
		
		this.Emit("Opacity", { opacity:opacity });
	}
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for legend widget
	 */	
	HTML() {
		return	"<div class='overlay-body' handle='body'>" + 
				"<label>nls(Legend_Indicators)</label>" +
				"<ul handle='indicators'></ul>" +
				"<label>nls(Legend_Title)</label>" +
				"<div handle='breaks' class='breaks-container'>" + 
					// Class breaks go here, dynamically created
				"</div>" +
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
