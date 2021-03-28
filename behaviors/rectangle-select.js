 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';
import Behavior from './behavior.js';

export default class RectangleSelectBehavior extends Behavior { 

	get layer() { return this._map.Layer('selection'); }

	get graphics() { return this.layer.graphics; }

	get target() { return this._options.target; }

	set target(value) { 
		this._options.target = value;
		
		this.Clear();
	}

	get field() { return this._options.field; }

	set field(value) { this._options.field = value; }

	get symbol() { return this._options.symbol; }

	set symbol(value) { this._options.symbol = value; }

	constructor(map, options) {	
		super();
		
		this._options = {};
		this._map = map;
		this._draw = new ESRI.views.draw.Draw({ view : this._map.view });
		this._action = null;
		
		this._map.AddGraphicsLayer('selection');
		
		this._handlers = {"cursor-update": null, "draw-complete": null};
	}

	Deactivate(){
		this.Clear();
		
		this._handlers["cursor-update"].remove();
		this._handlers["draw-complete"].remove();	
	}

	Activate(){		
		this._action = this._draw.create("rectangle", { mode: "click" });
		
		this._handlers["cursor-update"] = this._action.on(["cursor-update"], this.OnDraw_CursorUpdate.bind(this));
		this._handlers["draw-complete"] = this._action.on(["draw-complete"], this.OnDraw_Complete.bind(this));
	}
	
	Clear() {
		this.layer.removeAll();
		this._map.view.graphics.removeAll();
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

		this._map.view.graphics.removeAll();
		
		var geometry = this.VerticesToPolygon(ev.vertices, this._map.view.spatialReference);
		var outline = { color: [200, 20, 0], width: 1 }
		var symbol = { type: "simple-fill", color: [200, 20, 0, 0.3], style: "solid", outline: outline }
		
		this._map.view.graphics.add(new ESRI.Graphic({ geometry: geometry, symbol: symbol }));
	}
	
	OnDraw_Complete(ev) {
		this.Emit("Busy");
		
		this._map.view.graphics.removeAll();
		
		if (ev.vertices.length < 2) return;
		
		var geometry = this.VerticesToPolygon(ev.vertices, this._map.view.spatialReference);
		
		var p = Requests.QueryGeometry(this.target, geometry);
		
		p.then(this.OnDraw_QueryComplete.bind(this), error => this.OnDraw_QueryError.bind(this));
	}
	
	OnDraw_QueryComplete(results) {		
		results.features.forEach(f => {
			var exists = this.layer.graphics.find(g => g.attributes[this.field] == f.attributes[this.field]);
			
			if (exists) this.layer.remove(exists);
			
			else {
				f.symbol = this.symbol;
				
				this.layer.graphics.add(f);
			}
		});
		
		this.Emit("Idle");
		
		this.Emit("Change", { selection:this.layer.graphics });

		this.Activate();
	}
	
	OnDraw_QueryError(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}