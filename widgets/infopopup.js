import Core from '../../geo-explorer-api/tools/core.js';
import Widget from '../../geo-explorer-api/components/base/widget.js';

/**
 * Info Popup widget for map
 * @module components/infopopup
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.InfoPopup", class InfoPopup extends Widget {

	/**
	 * Get/set the map object
	 */
	get map() { return this._map; }

	set map(value) { this._map = value; }

	/**
	 * Get/set the config json object
	 */
	get config() { return this._config; }

	set config(value) { this._config = value; }

	/**
	 * Get/set the context object
	 */
	get context() { return this._context; }

	set context(value) { this._context = value; }
	
	/**
	 * Constructor for the infopopup widget
	 * @param {object} map - the map json object for the infopopup
	 * @param {object} context - the context object for the infopopup
	 * @param {object} config - the configuration json for the component
	 * @param {object} nls - localized resources for multi lingual support
	 * @returns {void}
	 */
	constructor() {	
		super(null);
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @param {string} locale - The app's current language 
	 * @returns {void}
	 */
	Configure(config, map, context) {
		this.map = map;
		this.context = context;
		
		this.config.title = config.title[Core.locale];
		this.config.uom = config.uom[Core.locale];
		this.config.value = config.value[Core.locale];
		this.config.indicator = config.indicator[Core.locale];
		this.config.symbol = config.symbol[Core.locale];
		this.config.nulldesc = config.nulldesc[Core.locale];
		this.config.tableviewer = config.tableviewer[Core.locale];
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Indicator_Title", "en", "Selected indicators");
		nls.Add("Indicator_Title", "fr", "Indicateurs sélectionnés");
		nls.Add("TableViewer_Link", "en", "<b>Statistics Canada.</b> Table <a href='{0}' target='_blank'>{1}</a>");
		nls.Add("TableViewer_Link", "fr", "<b>Statistique Canada.</b> Tableau <a href='{0}' target='_blank'>{1}</a>");	
	}
	
	/**
	 * Show the info popup for the selected map point.
	 * @param {object} mapPoint - Object containing the coordinates of the selected map point
	 * @param {object} f - Layer containing the attributes of the selected polygon
	 * @returns {void}
	 */
	Show(mapPoint, f) {
		var uom = f.attributes[this.config.uom];
		var value = f.attributes[this.config.value]
		var symbol = f.attributes[this.config.symbol];
		var nulldesc = f.attributes[this.config.nulldesc] || '';
		
		// prevent F from displaying twice
		symbol = symbol && value != "F" ? symbol : ''; 
		
		var indicators = this.context.IndicatorItems().map(f => `<li>${f.label}</li>`).join("");
		
		var link = this.GetLink();
		
		var html = `<b>${uom}</b>: ${value}<sup>${symbol}</sup>` + 
				   `<br><br>` + 
				   `<div>` + 
					   `<b>${this.Nls("Indicator_Title")}</b>:` +
					   `<ul>${indicators}</ul>` +
					   `${link}` +
				   `</div>` + 
				   `<br>` +
				   `<sup>${symbol}</sup> ${nulldesc}`;
		
		this.map.popup.open({ location:mapPoint, title:f.attributes[this.config.title], content:html });
	}
	
	GetLink() {
		var prod = this.context.category.toString();

		if (prod.length != 8) return "";

		var url = this.config.tableviewer + this.context.category + "01";
		var prod = prod.replace(/(\d{2})(\d{2})(\d{4})/, "$1-$2-$3-01");
		
		return this.Nls('TableViewer_Link', [url, prod]);
	}
})