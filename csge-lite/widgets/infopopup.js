import Core from '../../csge-api/tools/core.js';
import Dom from '../../csge-api/tools/dom.js';
import CODR from '../../csge-api/tools/codr.js';
import Widget from '../../csge-api/components/base/widget.js';

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
	 * Constructor for the infopopup widget
	 * @param {object} map - the map json object for the infopopup
	 * @param {object} context - the context object for the infopopup
	 * @param {object} config - the configuration json for the component
	 * @param {object} nls - localized resources for multi lingual support
	 * @returns {void}
	 */
	constructor(...config) {	
		super(...config);
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @param {string} locale - The app's current language 
	 * @returns {void}
	 */
	Configure(map, config, metadata, codesets) {
		this.map = map;
		this.config = config;
		this.metadata = metadata;
		this.codesets = codesets;
	}
		
    Localize(nls) {
        nls.Add("ValueColumn", "en", "Value:");
        nls.Add("ValueColumn", "fr", "Valeur:");
        nls.Add("FreqColumn", "en", "Frequency:");
        nls.Add("FreqColumn", "fr", "Fréquence:");
        nls.Add("GeoVintageColumn", "en", "Geo Vintage:");
        nls.Add("GeoVintageColumn", "fr", "Vintage géo:");
        nls.Add("UomColumn", "en", "Unit of measure:");
        nls.Add("UomColumn", "fr", "Unité de mesure:");
        nls.Add("ScalarColumn", "en", "Scalar factor:");
        nls.Add("ScalarColumn", "fr", "Facteur scalaire:");
    }
	
	/**
	 * Show the info popup for the selected map point.
	 * @param {object} mapPoint - Object containing the coordinates of the selected map point
	 * @param {object} f - Layer containing the attributes of the selected polygon
	 * @returns {void}
	 */
	Show(mapPoint, f, data) {
        // Get the polygon name and id as the bubble title. For example: Ottawa(350421)
        var geo = CODR.GeoLookup(this.metadata.geoLevel);
        var identify = this.config.Identify(geo);
        var fid = f.attributes[identify.id];
        var member = this.metadata.geoMembers.find(dp => dp.code == fid);
        var geoVintage = member ? member.vintage : "";

        // Derive the DGUID from the vintage, type, schema and geographic feature id
        var dguid = CODR.GetDGUID(this.metadata.geoLevel, geoVintage, fid);
        var title = f.attributes[identify.name] + " (" + dguid + ")";

        // Get the value corresponding to the datapoint, properly formatted for French and English
        // Ex: French: 35 024, 56   -   English 35, 204.56        
        var content = this.GetPopupContent(data[fid], geoVintage);
		
		this.map.popup.open({ location:mapPoint, title:title, content:content });
	}
	
    /**
     * @description
     * Format a Datapoint description in html format - for a specific locale, including symbol, uom, etc.
     * @param {String} dp - Datapoint object
     * @param {String} geoVintage - Geography Vintage
     */
    GetPopupContent(dp, geoVintage) {
        var frequency = this.codesets.frequency(dp.frequency);
        var uom = this.codesets.uom(dp.uom);
        var scalar = this.codesets.scalar(dp.scalar);
        var value = this.codesets.GetFormattedDP(dp, Core.locale);

        var html = `<table class='popup-table'><tbody handle='body'>` +
					  `<tr><td>${this.Nls("ValueColumn")}</td><td>${value}</td></tr>` +
					  `<tr><td>${this.Nls("FreqColumn")}</td><td>${frequency || ""}</td></tr>` +
					  `<tr><td>${this.Nls("GeoVintageColumn")}</td><td>${geoVintage || ""}</td></tr>` +
					  `<tr><td>${this.Nls("UomColumn")}</td><td>${uom || ""}</td></tr>` +
					  `<tr><td>${this.Nls("ScalarColumn")}</td><td>${scalar || ""}</td></tr>` +
				   `</tbody></table>`;
		
		return Dom.Create("div", { innerHTML:html }).firstChild;
    }
})