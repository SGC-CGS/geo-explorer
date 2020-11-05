 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';
import Behavior from './behavior.js';

export default class PointIdentifyBehavior extends Behavior { 

	get Layer() { return this.map.Layer("identify"); }

	get Graphics() { return this.Layer.graphics; }

	constructor(map, options) {	
		super();

		this.options = {};
		this.map = map;
		
		this.map.AddGraphicsLayer('identify');
		
		this.Reset(options);
		
		this.ClickHandler = this.OnMap_Click.bind(this);
	}

	Deactivate(){
		this.Clear();

		this.map.Off("Click", this.ClickHandler);
	}

	Activate(){
		this.map.On("Click", this.ClickHandler);
	}
	
	Reset(options) {
		this.Clear();
		
		if (options.layer) this.options.layer = options.layer;		// Layer to query when done selecting
		if (options.symbol) this.options.symbol = options.symbol;	// Symbol to draw the graphics with
	}
	
	Clear() {
		this.Layer.removeAll();

		this.map.Popup.close();
	}
	
	OnMap_Click(ev) {		
		this.Emit("Busy");
		
		this.map.Identify(this.options.layer, ev.mapPoint).then((r) => {
			this.Emit("Idle");	
			
			this.Layer.removeAll();
			
			r.feature.symbol = this.options.symbol;
			
			this.Layer.add(r.feature);

			this.map.Popup.open({
				title:r.title,
				content:r.content,
				location:ev.mapPoint
			});
			
			this.Emit("Change", { mapPoint:ev.mapPoint, results:r });
		}, error => this.OnIdentify_Error(error));
	}
	
	OnIdentify_Error(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}