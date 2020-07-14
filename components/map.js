 'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from '../tools/net.js';
import Requests from '../tools/requests.js';
import Evented from './evented.js';

export default class Map extends Evented { 

	constructor(container) {
		super();
		
		this.layers = {};
		this.behaviors = {};
		
		this.map = new ESRI.Map({ basemap: "streets" });
		
		this.view = new ESRI.views.MapView({
			animation : false,
			center: [-100, 63], 
			container: container, 
			map: this.map,  
			zoom: 4 
		});
		
		this.view.on("click", this.OnMapView_Click.bind(this));
		
		var fullscreen = new ESRI.widgets.Fullscreen({ 
			view: this.view
		});
/*		
		var basemap = new ESRI.widgets.BasemapToggle({
		  view: this.view,
		  nextBasemap: "satellite"
		});
*/

/*		
		var basemap = new ESRI.widgets.BasemapGallery({
		  view: this.view,
		  source: {
			portal: {
			  url: "https://www.arcgis.com",
			  useVectorBasemaps: true // Load vector tile basemaps
			}
		  }
		});
*/

		this.view.ui.add(fullscreen, "top-left");
	}
	
	AddBehavior(id, behavior) {
		this.behaviors[id] = behavior;
		
		return behavior;
	}
	
	Behavior(id) {
		return this.behaviors[id] || null;
	}
	
	// NOTE : Test for spread operator in Rollup
	Place(elements, position) {
		elements.forEach(e => this.view.ui.add(e, position));
	}
	
	AddGraphicsLayer(id) {
		var layer = new ESRI.layers.GraphicsLayer();
		
		this.layers[id] = layer;
		
		this.map.add(layer);
	}
	
	AddMapImageLayer(id, url, opacity, dpi, format) {
		if (this.layers[id]) throw new Error("Layer already exists in map.");
		
		var layer = new ESRI.layers.MapImageLayer({
			url: url,
			imageFormat : format || 'png8',
			opacity : opacity || 1,
			dpi : dpi || 96,
			sublayers: []
		});
		
		this.layers[id] = layer;
		
		this.map.add(layer);
	}
	
	EmptyLayer(id) {
		this.Layer(id).sublayers.removeAll();
	}
	
	AddSubLayer(id, sublayer) {
		// debugger;
		// TODO : try After Add
		this.Layer(id).sublayers.add(sublayer);
	}
	
	AddSubLayers(id, sublayers) {
		this.Layer(id).sublayers.addMany(sublayer);
	}
	
	Layer(id) {
		return this.layers[id] || null;
	}
	
	Popup(location, content, title) {
		this.view.popup.open({
			title:title,
			content:content,
			location:location
		});
		
		this.view.popup.collapseEnabled = false;
	}
	
	Identify(layer, geometry) {
		var d = Core.Defer();
		
		Requests.Identify(layer, geometry).then(result => {
			d.Resolve(result);			
		}, error => this.OnMapView_Error(error));
		
		return d.promise;
	}
	
	GoTo(target) {
		this.view.goTo(target);
	}
	
	OnMapView_Click(ev) {		
		this.Emit("Click", ev);
	}
	
	OnMapView_Error(ev) {		
		this.Emit("Error", ev);
	}
}