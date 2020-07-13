 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from './evented.js';

export default class PointIdentifyBehavior extends Evented { 

	get Layer() { return this.map.Layer("identify"); }

	get Graphics() { return this.Layer.graphics; }

	constructor(map, options) {	
		super();

		this.options = {};
		this.map = map;
		
		this.map.AddGraphicsLayer('identify');
		
		this.Reset(options);
		
		this.map.On("Click", this.OnMap_Click.bind(this));
	}
	
	Reset(options) {
		this.Clear();
		
		if (options.layer) this.options.layer = options.layer;		// Layer to query when done selecting
		if (options.symbol) this.options.symbol = options.symbol;	// Symbol to draw the graphics with
	}
	
	Clear() {
		this.Layer.removeAll();
	}
	
	OnMap_Click(ev) {		
		this.Emit("Busy");
		
		this.map.Identify(this.options.layer, ev.mapPoint).then((r) => {
			this.Emit("Idle");	
			
			this.Layer.removeAll();
			
			r.feature.symbol = this.options.symbol;
			
			this.Layer.add(r.feature);
					
			this.map.Popup(ev.mapPoint, r.content, r.title);
			
			this.Emit("Change", { mapPoint:ev.mapPoint, results:r });
		}, error => this.OnIdentify_Error(error));
	}
	
	OnIdentify_Error(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}