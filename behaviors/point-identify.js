 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';
import Behavior from './behavior.js';

export default class PointIdentifyBehavior extends Behavior { 


	get layer() { return this._map.Layer("identify"); }

	get graphics() { return this.layer.graphics; }

	get target() { return this._options.target; }

	set target(value) { 
		this.Clear();
		
		this._options.target = value; 
	}

	get symbol() { return this._options.symbol; }

	set symbol(value) { this._options.symbol = value; }

	constructor(map, options) {	
		super();

		this._options = {};
		this._map = map;
		
		this._map.AddGraphicsLayer('identify');
		
		this.ClickHandler = this.OnMap_Click.bind(this);
	}

	/**
	 * @description
	 * Point identify is deactivated when rectangle select 
	 * is activated
	 */
	Deactivate(){
		this.Clear();

		this._map.Off("Click", this.ClickHandler);
	}

	/**
	 * @description
	 * By default, point identify is activated. Point identify
	 * is re-activated when rectangle select is deactivated.
	 */
	Activate(){
		this._map.On("Click", this.ClickHandler);
	}
	
	/**
	 * @description
	 * De-select the selected layers, remove highlight
	 * and hide popup.
	 */
	Clear() {
		this.layer.removeAll();

		this._map.popup.close();
	}
		
	/**
	 * @description
	 * Fires after the map is clicked with point-identify.
	 * mapPoint will indicate the point location of the click on the view
	 * so that the popup may appear on the selected target. The selected feature
	 * will also be outlined.
	 * @param {*} ev - event
	 */
	OnMap_Click(ev) {		
		this.Emit("Busy");
		
		this._map.Identify(this.target, ev.mapPoint).then((r) => {
			this.Emit("Idle");	
			
			this.layer.removeAll();
			
			r.feature.symbol = this.symbol;
			
			this.layer.add(r.feature);
			
			this.Emit("Change", { mapPoint:ev.mapPoint, feature:r.feature });
		}, error => this.OnIdentify_Error(error));
	}
	
	OnIdentify_Error(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}