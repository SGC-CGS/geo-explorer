 'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from '../tools/net.js';
import Requests from '../tools/requests.js';
import Evented from './evented.js';

export default class Map extends Evented { 

	get isDrawing() { return !!this.draw.activeAction; }

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
		
		var fullscreen = new ESRI.widgets.Fullscreen({ 
			view: this.view
		});

		this.view.ui.add(fullscreen, "top-left");
	
		this.draw = new ESRI.views.draw.Draw({ view : this.view });
		
		this.view.on("layerview-create", ev => this.StartSelect());
	}
	
	Place(element, position) {		
		this.view.ui.add(element, position);
	}
	
	AddGraphicsLayer(id) {
		var layer = new ESRI.layers.GraphicsLayer();
		
		this.layers[id] = layer;
		
		this.map.add(layer);
	}
		
	ClearGraphics(id) {
		this.Layer(id).removeAll();
	}
		
	AddGraphic(id, graphic, symbol) {
		if (symbol) graphic.symbol = symbol;
		
		this.Layer(id).add(graphic);
	}
	
	AddGraphics(id, graphics, symbol) {
		if (symbol) graphics.forEach(g => g.symbol = symbol);
		
		this.Layer(id).addMany(graphics);
	}
	
	RemoveGraphic(id, graphic) {
		this.Layer(id).remove(graphic);
	}
	
	RemoveGraphics(id, graphics) {
		this.Layer(id).removeMany(graphic);
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
	
	// TODO : Following three functions are for rectangle selection, maybe should 
	// be moved to dedicated component class
	StartSelect() {
		var action = this.draw.create("rectangle", { mode: "click" });
		
		action.on(["cursor-update"], this.OnDraw_CursorUpdate.bind(this));
		action.on(["draw-complete"], this.OnDraw_Complete.bind(this));
	}
	
	VerticesToPolygon(vertices, sref) {
		var p1 = vertices[0];
		var p2 = vertices[1];
		
		// points are [x, y] format
		var ring = [p1, [p2[0], p1[1]], p2, [p1[0], p2[1]], p1];
		
		return { type: "polygon", rings: [ring], spatialReference: sref };
	}
	
	OnDraw_CursorUpdate(ev) {
		if (ev.vertices.length < 2) return;

		this.view.graphics.removeAll();
		
		var geometry = this.VerticesToPolygon(ev.vertices, this.view.spatialReference);
		var outline = { color: [200, 20, 0], width: 1 }
		var symbol = { type: "simple-fill", color: [200, 20, 0, 0.3], style: "solid", outline: outline }
		
		this.view.graphics.add(new ESRI.Graphic({ geometry: geometry, symbol: symbol }));
	}
	
	OnDraw_Complete(ev) {
		this.view.graphics.removeAll();
		
		if (ev.vertices.length < 2) return;
		
		var geometry = this.VerticesToPolygon(ev.vertices, this.view.spatialReference);
		
		this.Emit("Select-Draw", { geometry:geometry });
		
		this.StartSelect();
	}
	
	OnMapView_Click(ev) {		
		this.Emit("Click", ev);
	}
	
	OnMapView_Error(ev) {		
		this.Emit("Error", ev);
	}
}