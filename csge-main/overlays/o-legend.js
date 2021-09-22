import Dom from '../../csge-api/tools/dom.js';
import Core from '../../csge-api/tools/core.js';
import Overlay from '../../csge-api/widgets/overlay.js';
import wLegend from '../widgets/wLegend.js'

/**
 * Overlay widget module
 * @module widgets/o-legend
 * @extends Widget
 */
export default class oLegend extends Overlay { 
	
	/**
	 * Call constructor of base class and initialize overlay
	 * @param {object} container - div.map-container and properties
	 * @returns {void}
	 */
	constructor(...config) {	
		super(...config);
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(config, context) {
		this.widget = new wLegend(config.legend, context);	
		this.header = this.widget.title;	
		this.css = "legend";	
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Overlay_Close", "en", "Close");
		nls.Add("Overlay_Close", "fr", "Fermer");		
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */
	HTML() {
		return	  "<div class='overlay esri-component'>" +
					  "<div class='overlay-header'>" +
						  "<h2 class='overlay-header' handle='header'></h2>" +
						  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
					  "</div>" +
					  "<div class='overlay-body' handle='body'></div>" +
				  "</div>";
	}
}