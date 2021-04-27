import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Basemap widget module
 * @module widgets/basemap
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Basemap", class Basemap extends Templated {
	
	/** 
	 * Set the basemap widget
	 * @type {object} 
	*/
	set Map(value) { 
		this.map = value; 
		
		var basemap = new ESRI.widgets.BasemapGallery({
		  view: this.map.view,
		  container: this.Elem("content"),
		  source: {
			portal: {
			  url: "https://www.arcgis.com",
			  useVectorBasemaps: true // Load vector tile basemaps
			}
		  }
		});
		
		// this.map.view.ui.add(basemap, "bottom-left");
	}
	
	/**
	 * Return basemap button title in both languages
	 * @returns {object.<string, string>} Basemap titles for each language
	 */
	static Nls(nls) {
		nls.Add("Basemap_Title", "en", "Change basemap");
		nls.Add("Basemap_Title", "fr", "Changer de fond de carte");
	}
	
	/**
	 * Call constructor of base class (Templated)
	 * @param {object} container - div.basemap and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)
	 * @returns {void}
	 */
	constructor(container, options) {	
		super(container, options);
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */
	Template() {
		return "<div handle='content'></div>";
	}
})