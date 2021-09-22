import BaseLegend from '../../csge-api/widgets/legend/legend.js';
import Core from '../../csge-api/tools/core.js';
import Dom from '../../csge-api/tools/dom.js';
import Legend from '../../csge-api/widgets/legend/legend.js';
import wStyler from './wStyler.js';

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
		
		this.Elem('btn-styler').addEventListener('click', this.ShowStyler.bind(this));
		
		this.Elem('styler').On('Close', this.ShowLegend.bind(this));
		this.Elem('styler').On('Change', this.ShowLegend.bind(this));
		this.Elem('styler').On('Change', ev => this.Update(this.context));
	}
	
	ShowLegend() {
		Dom.RemoveCss(this.Elem('legend-container'), 'hidden');
		Dom.AddCss(this.Elem('styler-container'), 'hidden');
	}
	
	ShowStyler() {
		Dom.RemoveCss(this.Elem('styler-container'), 'hidden');
		Dom.AddCss(this.Elem('legend-container'), 'hidden');
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(map, config, context) {
		this.map = map;
		this.context = context;
		
		this.Elem("styler").Configure(map, config, context);
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Title", "en", "Table of contents");
		nls.Add("Legend_Title", "fr", "Table de contenu");	
		nls.Add("Layer_Config_Title", "en", "Click to modify layer style");	
		nls.Add("Layer_Config_Title", "fr", "Cliquer pour modifier le style de la couche");	
		nls.Add("Thematic_Layer", "fr", "Couche thématique");	
		nls.Add("Thematic_Layer", "en", "Thematic layer");	
	}

	/**
	 * Load class method, breaks, and colours to styler widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {		
		this.context = context;
		
		this.renderer = context.sublayer.renderer;
		
		this.Elem("indicators-label").innerHTML = context.IndicatorsLabel();
		this.Elem("styler-breaks").Update(this.renderer);
		this.Elem("styler").Update(this.context);
	}
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for legend widget
	 */	
	HTML() {
		return	"<div class='legend'>" +
					"<div handle='legend-container' class='legend-container'>" +
						"<label handle='indicators-label' class='layer-row-title'></label>" + 
						"<div class='inner-container'>" + 
							"<div handle='styler-breaks' class='legend-widget indent' widget='Api.Widgets.Legend'></div>" +
							"<button handle='btn-styler' class='small-esri-icon esri-icon-settings2' title='nls(Layer_Config_Title)'></button>" + 
						"</div>" +
					"</div>" +
					"<div handle='styler-container' class='styler-container hidden'>" +
						"<div handle='styler' class='styler-widget' widget='App.Widgets.Styler'></div>" +
					"</div>" +
				"</div>";
	}
})
