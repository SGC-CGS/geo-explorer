import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from '../../geo-explorer-api/tools/core.js';

/**
 * Search widget module
 * @module widgets/search
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Navbar", class wNavbar extends Widget {

	/**
	 * Get/set the map
	 * @type {object}
	 */
	set map(value) { this._map = value; }
	get map() { return this._map; }
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Zoom_In", "en", "Zoom in");
		nls.Add("Zoom_In", "fr", "Zoom avant");
		nls.Add("Zoom_Out", "en", "Zoom out");
		nls.Add("Zoom_Out", "fr", "Zoom arrière");
		nls.Add("Fullscreen_Title", "en", "Fullscreen");
		nls.Add("Fullscreen_Title", "fr", "Plein écran");
		nls.Add("Home_Title", "en", "Default map view");
		nls.Add("Home_Title", "fr", "Vue cartographique par défaut");					
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @param {string} locale - The app's current language 
	 * @returns {void}
	 */
	Configure(map) {
		this.map = map;
		
		this.home = new ESRI.widgets.Home({ view: this.map.view });
		this.fullscreen = new ESRI.widgets.Fullscreen({ view: this.map.view });

		this.map.view.ui.add(this.home, "top-left");
		this.map.view.ui.add(this.fullscreen, "top-left");
		
		// TODO: Keeping this around for a bit, until we figure out if intl is sufficient.
		/*
		this.map.view.when(d => {	
			// Workaround to allow nls use on button title.
			this.map.view.container.querySelector(".esri-fullscreen").title = this.Nls("Fullscreen_Title"); 
			this.map.view.container.querySelector(".esri-home").title = this.Nls("Home_Title"); 	
			
			var zooms = this.map.view.container.querySelectorAll(".esri-zoom .esri-interactive");
			
			zooms[0].title = this.Nls("Zoom_In"); 
			zooms[1].title = this.Nls("Zoom_Out"); 
		}, error => this.OnApplication_Error(error));
		*/
	}
})