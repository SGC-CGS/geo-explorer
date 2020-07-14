import Overlay from './overlay.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

export default Core.Templatable("App.Widgets.Basemap", class Waiting extends Overlay {
	
	set Map(value) { 
		this.map = value; 
		
		var basemap = new ESRI.widgets.BasemapGallery({
		  view: this.map.view,
		  container: this.Elem("body"),
		  source: {
			portal: {
			  url: "https://www.arcgis.com",
			  useVectorBasemaps: true // Load vector tile basemaps
			}
		  }
		});
		
		// this.map.view.ui.add(basemap, "bottom-left");
	}
	
	constructor(container, options) {	
		super(container, options);
	}
	
	Template() {
		return	  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'>nls(Basemap_Title)</h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
				  "<hr>" +
				  "<div class='overlay-body' handle='body'>" + 

				  "</div>";
	}
})