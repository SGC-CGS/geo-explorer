import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

export default Core.Templatable("App.Widgets.Basemap", class Basemap extends Templated {
	
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
	
	static Nls() {
		return {
			"Basemap_Title" : {
				"en": "Change basemap",
				"fr": "Changer de fond de carte"
			}
		}
	}
	
	constructor(container, options) {	
		super(container, options);
	}
	
	Template() {
		return "<div handle='content'></div>";
	}
})