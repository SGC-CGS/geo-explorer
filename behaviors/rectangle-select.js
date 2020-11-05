 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';
import Behavior from './behavior.js';

export default class RectangleSelectBehavior extends Behavior { 

	get Layer() { return this.map.Layer('selection'); }

	get Graphics() { return this.Layer.graphics; }

	constructor(map, options) {	
		super();
		
		this.options = {};
		this.map = map;
		this.draw = new ESRI.views.draw.Draw({ view : this.map.view });
		this.action = null;
		
		this.map.AddGraphicsLayer('selection');
		
		this.Reset(options);
	}

	Deactivate(){
		
	}

	Activate(){		
		this.action = this.draw.create("rectangle", { mode: "click" });
		
		this.action.on(["cursor-update"], this.OnDraw_CursorUpdate.bind(this));
		this.action.on(["draw-complete"], this.OnDraw_Complete.bind(this));
	}
	
	Reset(options) {
		this.Clear();
		
		if (options.layer) this.options.layer = options.layer;		// Layer to query when done selecting
		if (options.field) this.options.field = options.field;		// Field used to compare graphics
		if (options.symbol) this.options.symbol = options.symbol;	// Symbol to draw the graphics with
	}
	
	Clear() {
		this.Layer.removeAll();
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

		this.map.view.graphics.removeAll();
		
		var geometry = this.VerticesToPolygon(ev.vertices, this.map.view.spatialReference);
		var outline = { color: [200, 20, 0], width: 1 }
		var symbol = { type: "simple-fill", color: [200, 20, 0, 0.3], style: "solid", outline: outline }
		
		this.map.view.graphics.add(new ESRI.Graphic({ geometry: geometry, symbol: symbol }));
	}
	
	OnDraw_Complete(ev) {
		this.Emit("Busy");
		
		this.map.view.graphics.removeAll();
		
		if (ev.vertices.length < 2) return;
		
		var geometry = this.VerticesToPolygon(ev.vertices, this.map.view.spatialReference);
		
		var p = Requests.QueryGeometry(this.options.layer, geometry);
		
		p.then(this.OnDraw_QueryComplete.bind(this), error => this.OnDraw_QueryError.bind(this));
	}
	
	OnDraw_QueryComplete(results) {		
		results.features.forEach(f => {
			var exists = this.Layer.graphics.find(g => g.attributes[this.options.field] == f.attributes[this.options.field]);
			
			if (exists) this.Layer.remove(exists);
			
			else {
				f.symbol = this.options.symbol;
				
				this.Layer.graphics.add(f);
			}
		});
		
		this.Emit("Idle");
		
		this.Emit("Change", { selection:this.Layer.graphics });

		this.Activate();
	}
	
	OnDraw_QueryError(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}