 'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from '../tools/net.js';
import Requests from '../tools/requests.js';
import Evented from './evented.js';

export default class Map extends Evented { 

	get Popup() { return this.view.popup; }

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
		
		this.view.popup.collapseEnabled = false;

		this.view.on("click", this.OnMapView_Click.bind(this));
		
		var fullscreen = new ESRI.widgets.Fullscreen({ 
			view: this.view
		});

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

	AddFeatureLayer(id, url, labels, visibility){
		var layer = new ESRI.layers.FeatureLayer({
			url: url,
			fields:[{
				name: id,
				alias: labels
			}],
			visible: visibility
		});

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
		this.Layer(id).sublayers.add(sublayer);
	}
	
	AddSubLayers(id, sublayers) {
		this.Layer(id).sublayers.addMany(sublayer);
	}
	
	Layer(id) {
		return this.layers[id] || null;
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