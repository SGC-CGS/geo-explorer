import Widget from '../../geo-explorer-api/components/base/widget.js';
import Select from '../../geo-explorer-api/ui/select.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';
import Requests from '../../geo-explorer-api/tools/requests.js';
import Opacity from '../../geo-explorer-api/widgets/opacity.js';
import LabelToggle from '../../geo-explorer-api/widgets/label-toggle.js';
import ColorSchemes from '../../geo-explorer-api/widgets/color-schemes.js';
import LegendEditable from '../../geo-explorer-api/widgets/legend/legend-editable.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Styler", class Styler extends Widget {

	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Styler_Title") }
	
	get renderer() { return this._renderer; }
	
	set renderer(value) { this._renderer = value; }
	
	/**
	 * Get/set opacity
	 */
	set opacity(value) {
		this.Elem('opacity').value = value;
	}
	
	get opacity() {
		return this.Elem('opacity').value;
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize styler widget
	 * @param {object} container - div styler container and properties
	 * @returns {void}
	 */	
	constructor(container) {
		super(container);

		this.Elem('sMethod').Add(this.Nls("Styler_Method_Equal"), this.Nls("Styler_Method_Info_Equal"), { id:1, algo:"esriClassifyEqualInterval" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Natural"),this.Nls("Styler_Method_Info_Natural"), { id:2, algo:"esriClassifyNaturalBreaks" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Quantile"), this.Nls("Styler_Method_Info_Quantile"), { id:3, algo:"esriClassifyQuantile" });
		
		this.Node('sMethod').On("Change", this.onMethod_Change.bind(this));

		var handler = function(ev) { this.onIBreaks_Change(ev); }.bind(this);

		this.Node('iBreaks').On("change", Core.Debounce(handler, 350));

		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));
		
		// Make into a ui component
		this.Elem("dropdownBtn").addEventListener("click", function (ev) {
			this.Elem("content").classList.toggle("active");

			if (ev.target.className == "collapsedDropdown") ev.target.className = "expandedDropdown";

			else ev.target.className = "collapsedDropdown";
		}.bind(this));

		this.Node('opacity').On("change", this.OnOpacity_Changed.bind(this));
		this.Node('label-toggle').On("change", this.OnLabelChk_Changed.bind(this));
		this.Node('color-schemes').On("change", this.OnColorSchemes_Changed.bind(this));
	}
	
	Configure(config, context) {
		this.context = context;
		
		this.Elem('opacity').value = config.opacity;
	}

	Localize(nls) {
		nls.Add("Styler_Title", "en", "Map Legend");
		nls.Add("Styler_Title", "fr", "Légende cartographique");
		nls.Add("Styler_Method", "en", "Classification by");
		nls.Add("Styler_Method", "fr", "Classification par");
		nls.Add("Styler_Method_Info", "en", "Classification methods help organize data thematically.");
		nls.Add("Styler_Method_Info", "fr", "Les méthodes de classification aident à organiser les données de manière thématique.");
		nls.Add("Styler_Breaks", "en", "Number of breaks");
		nls.Add("Styler_Breaks", "fr", "Nombre de bornes");
		nls.Add("Styler_Breaks_Info", "en", "The number of breaks are used for dividing features in a classification.");
		nls.Add("Styler_Breaks_Info", "fr", "Le nombre de coupures est utilisé pour diviser les entités dans une classification.");
		nls.Add("Styler_Method_Equal", "en", "Equal intervals");
		nls.Add("Styler_Method_Equal", "fr", "Intervalles égaux");
		nls.Add("Styler_Method_Info_Equal", "en", "Data range is divided equally between the maximum and minimum by the # of classes.");
		nls.Add("Styler_Method_Info_Equal", "fr", "la plage de données est divisée également entre le maximum et le minimum par le nombre de classes.");
		nls.Add("Styler_Method_Natural", "en", "Natural breaks");
		nls.Add("Styler_Method_Natural", "fr", "Bornes naturelles");
		nls.Add("Styler_Method_Info_Natural", "en", "Complex approach to cluster data as accurately as possible.");
		nls.Add("Styler_Method_Info_Natural", "fr", "Approche complexe pour regrouper les données aussi précisément que possible.");
		nls.Add("Styler_Method_Quantile", "en", "Quantiles");
		nls.Add("Styler_Method_Quantile", "fr", "Quantiles");
		nls.Add("Styler_Method_Info_Quantile", "en", "Classifies data by an equal number of units for each category.");
		nls.Add("Styler_Method_Info_Quantile", "fr", "Classe les données par un nombre égal d'unités pour chaque catégorie.");
		nls.Add("Styler_Button_Apply", "en", "Apply");
		nls.Add("Styler_Button_Apply", "fr", "Appliquer");		
		nls.Add("Styler_Button_Close", "en", "Cancel");
		nls.Add("Styler_Button_Close", "fr", "Annuler");
	}

	CloneRenderer(renderer) {		
		return ESRI.renderers.support.jsonUtils.fromJSON(renderer.toJSON());
	}

	/**
	 * Load class method, breaks, and colours to styler widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {
		this.context = context;
		
		this.renderer = this.CloneRenderer(context.sublayer.renderer);

		this.Elem("sMethod").value = this.Elem('sMethod').FindIndex(i => i.algo === context.metadata.breaks.algo);
		this.Elem("iBreaks").value = context.metadata.breaks.n;
		
		this.Elem("styler-breaks").Update(this.renderer);
	}

	/**
	 * Change number of breaks when up or down arrows are clicked or new number is entered
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	onIBreaks_Change(ev) {		
		this.context.metadata.breaks.n = ev.target.value;
		
		this.Refresh();
	}

	/**
	 * Change classification method
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	onMethod_Change(ev) {		
		this.context.metadata.breaks.algo = ev.target.selected.algo;
		
		this.Refresh();
	}

	/**
	 * Respond to change in opacity slider
	 * @param {object} ev - Event received from opacity slider
	 * @returns {void}
	 */
	OnColorSchemes_Changed(ev) {
		this.scheme = ev.scheme;
		
		this.FixRendererColors(this.renderer, this.scheme);
		
		this.Elem("styler-breaks").Update(this.renderer);
	}

	/**
	 * Update map when apply button is clicked on styler widget
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnApply_Click(ev) {		
		this.context.Commit();
		
		this.renderer = this.CloneRenderer(this.renderer);
		
		this.FixRendererBreaks(this.renderer, this.Elem("styler-breaks").breaks);
		
		this.Emit("Change", { renderer:this.renderer });
	}

	/**
	 * Close styler widget when Cancel button is clicked
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnClose_Click(ev) {
		this.context.Revert();

		this.Emit("Close");

		this.Update(this.context);
	}
	
	/**
	 * Respond to change in opacity slider
	 * @param {object} ev - Event received from opacity slider
	 * @returns {void}
	 */
	OnOpacity_Changed(ev) {
		this.Emit("Opacity", { opacity:ev.opacity });
	}

	/**
	 * Respond to change in label toggle
	 * @param {object} ev - Event received from label toggle
	 * @returns {void}
	 */
	OnLabelChk_Changed(ev) {
		this.Emit("LabelName", { checked:ev.checked });	
	}

	/**
	 * Refresh class breaks based on currently selected options
	 * @returns {void}
	 */
	Refresh() {
		this.Emit("Busy");

		Requests.Renderer(this.context).then(sublayer => {
			this.renderer = sublayer.renderer;
			
			this.FixRendererColors(this.renderer, this.scheme);
			
			this.Elem("styler-breaks").Update(this.renderer);
		
			this.Emit("Idle");
		}, error => this.OnRequests_Error(error));
	}

	FixRendererColors(renderer, scheme) {
		if (!scheme) return;
		
		var palette = scheme[this.context.metadata.breaks.n];
		
		for (let i = 0; i < palette.length; i++) {
			let rgba = Core.HexToRgb(palette[i], 1);

			renderer.classBreakInfos[i].symbol.color = new ESRI.Color(rgba);
		}
	}
	
	FixRendererBreaks(renderer, breaks) {
		renderer.classBreakInfos.forEach((c, i) => { 
			var b = breaks[i];
			
			c.label = `${b.lMin} - ${b.lMax}`;
			c.minValue = b.min;
			c.maxValue = b.max;
		});
	}

	/**
	 * Emits error when there is a problem loading class breaks
	 * @param {object} error - Error object
	 * @returns {void}
	 */
	OnRequests_Error (error) {
		this.Emit("Error", { error:error });
	}

	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	HTML() {
		return	"<div handle='styler-breaks' class='styler-breaks-widget' widget='Api.Widgets.LegendEditable'></div>" +
				"<hr>" + 
				"<h2 handle='collapsible' class='collapsible active'>Change Map Style" +
					"<i handle='dropdownBtn' class='collapsedDropdown'></i>" +
				"</h2>" +

				"<div handle='content' class='content'>" +
					"<label style='display: inline;'>nls(Styler_Method)" +
						"<i class='fa fa-info-circle' style='display: inline;'><span class='tooltipText tooltip-bottom'>nls(Styler_Method_Info)</span></i>" +
						"<div handle='sMethod' widget='Api.Components.Select' style='display: inline; margin-left: 15px;'></div>" +
					"</label>" +
					
					"<div style='margin-bottom: 15px;'></div>"+

					"<label style='display: inline;'>nls(Styler_Breaks)" +
						"<i class='fa fa-info-circle' style='display: inline;'><span class='tooltipText tooltip-bottom'>nls(Styler_Breaks_Info)</span></i>" +
						"<input handle='iBreaks' type='number' min='3' max='8' style='display: inline; margin-left: 40px;'/>" +
					"</label>" +

					"<div handle='color-schemes' widget='Api.Widgets.ColorSchemes'></div>" +
					"<div handle='opacity' widget='Api.Widgets.Opacity'></div>" +
					"<div handle='label-toggle' widget='Api.Widgets.LabelToggle'></div>" +
				"</div>"+

				"<div class='button-container'>" +
					"<button handle='bApply' class='button-label button-apply'>nls(Styler_Button_Apply)</button>" +
					"<button handle='bClose' class='button-label button-close'>nls(Styler_Button_Close)</button>" +
				"</div>";
	}
})
