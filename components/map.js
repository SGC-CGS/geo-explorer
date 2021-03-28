 'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from '../tools/net.js';
import Requests from '../tools/requests.js';
import Evented from './evented.js';

export default class Map extends Evented { 

	get popup() { return this._view.popup; }

	get view() { return this._view; }

	constructor(container) {
		super();
		
		this._layers = {};
		this._behaviors = {};
		
		this._map = new ESRI.Map({ basemap: "streets" });
		
		this._view = new ESRI.views.MapView({
			animation : false,
			center: [-100, 63], 
			container: container, 
			map: this._map,  
			zoom: 4 
		});
		
		this._view.popup.collapseEnabled = false;

		this._view.on("click", this.OnMapView_Click.bind(this));
		
		var fullscreen = new ESRI.widgets.Fullscreen({ 
			view: this._view
		});

		this._view.ui.add(fullscreen, "top-left");
	}
	
	AddBehavior(id, behavior) {
		this._behaviors[id] = behavior;
		
		return behavior;
	}
	
	Behavior(id) {
		return this._behaviors[id] || null;
	}
	
	// NOTE : Test for spread operator in Rollup
	Place(elements, position) {
		elements.forEach(e => this._view.ui.add(e, position));
	}
	
	AddGraphicsLayer(id) {
		var layer = new ESRI.layers.GraphicsLayer();
		
		this._layers[id] = layer;
		
		this._map.add(layer);
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

		this._layers[id] = layer;

		this._map.add(layer);
	}
	
	AddMapImageLayer(id, url, opacity, dpi, format) {
		if (this._layers[id]) throw new Error("Layer already exists in map.");
		
		var layer = new ESRI.layers.MapImageLayer({
			url: url,
			imageFormat : format || 'png8',
			opacity : opacity || 1,
			dpi : dpi || 96,
			sublayers: []
		});
		
		this._layers[id] = layer;
		
		this._map.add(layer);
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
		return this._layers[id] || null;
	}
	
	Identify(layer, geometry) {
		var d = Core.Defer();
		
		Requests.Identify(layer, geometry).then(result => {
			d.Resolve(result);			
		}, error => this.OnMapView_Error(error));
		
		return d.promise;
	}
	
	GoTo(target) {
		this._view.goTo(target);
	}
	
	OnMapView_Click(ev) {		
		this.Emit("Click", ev);
	}
	
	OnMapView_Error(error) {		
		this.Emit("Error", { error:error });
	}
}