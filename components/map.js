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
		
		this.map = new ESRI.Map({ basemap: "streets" });
		
		this.view = new ESRI.views.MapView({
			animation : false,
			center: [-100, 63], 
			container: container, 
			map: this.map,  
			zoom: 4 
		});
		
		this.view.on("click", this.OnMapView_Click.bind(this));
	}
	
	AddGraphicsLayer(id) {
		var layer = new ESRI.layers.GraphicsLayer();
		
		this.layers[id] = layer;
		
		this.map.add(layer);
	}
	
	ClearGraphics(id) {
		this.Layer(id).removeAll();
	}
	
	AddGraphic(id, geometry, attributes, symbol) {
		var graphic = new ESRI.Graphic({
			geometry : geometry,
			attributes : attributes,
			symbol : symbol
		});
		
		this.Layer(id).add(graphic);
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
	
	Popup(location, content, title) {
		this.view.popup.open({
			title:title,
			content:content,
			location:location
		});
		
		this.view.popup.collapseEnabled = false;
	}
	
	GoTo(target) {
		this.view.goTo(target);
	}
	
	OnMapView_Click(ev) {		
		this.Emit("Click", ev);
	}
}