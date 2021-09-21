import BaseLegend from '../../csge-api/widgets/legend/legend.js';
import Core from '../../csge-api/tools/core.js';
import Dom from '../../csge-api/tools/dom.js';
import Legend from '../../csge-api/widgets/legend/legend.js';

/**
 * Legend widget module
 * @module widgets/legend/legend
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Legend", class wLegend extends BaseLegend {

	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Legend_Title") }
	
	/**
	 * Call constructor of base class (Templated) and initialize legend widget
	 * @param {object} container - div legend container and properties
	 * @returns {void}
	 */	
	constructor(...config) {	
		super(...config);
		
		this.Node("styler-breaks").On("visibility", this.OnVisibility_Changed.bind(this));
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(config, context) {
		this.context = context;
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Title", "en", "Map legend");
		nls.Add("Legend_Title", "fr", "Légende de la carte");	
	}

	/**
	 * Load class method, breaks, and colours to styler widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {
		this.context = context;
		
		// Create a deep clone of the renderer
		this.renderer = context.sublayer.renderer.clone();
		
		this.Elem("styler-breaks").Update(this.renderer);
	}

	OnVisibility_Changed(ev) {
		let breaks = this.renderer.classBreakInfos;

		if (ev.breakIndex >= breaks.length) var color = this.renderer.defaultSymbol.color;

		else var color = breaks[ev.breakIndex].symbol.color;

		color.a = ev.checked ? 1 : 0;

		this.renderer = this.renderer.clone();

		this.Emit("Change", { renderer:this.renderer });
	}
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for legend widget
	 */	
	HTML() {
		return	"<div handle='styler-breaks' class='legend-widget indent' widget='Api.Widgets.Legend'></div>";
	}
})
