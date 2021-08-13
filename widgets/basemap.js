import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Basemap widget module
 * @module widgets/basemap
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.Basemap", class wBasemap extends Widget {
	
	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Basemap_Title") }
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(map) {				
		this._basemap = new ESRI.widgets.BasemapGallery({
			view: map.view,
			container: this.Elem("content")
		});
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Basemap_Title", "en", "Change basemap");
		nls.Add("Basemap_Title", "fr", "Changer de fond de carte");
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */
	HTML() {
		return "<div handle='content'></div>";
	}
})