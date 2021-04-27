 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';
import Behavior from './behavior.js';

/**
 * @module behaviors/point-identify
 * @extends Behavior
 */
export default class PointIdentifyBehavior extends Behavior { 

	/**
	 * Get layer object
	 */
	get layer() { return this._map.Layer("identify"); }

	/**
	 * Get layer vector graphics
	 */
	get graphics() { return this.layer.graphics; }

	/**
	 * Get/set target layer object
	 */
	get target() { return this._options.target; }

	set target(value) { 
		this.Clear();
		
		this._options.target = value; 
	}

	/**
	 * Get/set symbol object (color, outline, style, type)
	 */
	get symbol() { return this._options.symbol; }

	set symbol(value) { this._options.symbol = value; }

	/**
	 * Call constructor of base class (Behavior) and initialize point-identify class 
	 * @param {object} map - Map object
	 * @param {object} options - Map options (not generally used)
	 * @returns {void}
	 */
	constructor(map, options) {	
		super();

		this._options = {};
		this._map = map;
		
		this._map.AddGraphicsLayer('identify');
		
		this.ClickHandler = this.OnMap_Click.bind(this);
	}

	/**
	 * Call clear function and remove click handler from map click event
	 * @returns {void}
	 */
	Deactivate(){
		this.Clear();

		this._map.Off("Click", this.ClickHandler);
	}

	/**
	 * Attach click handler to map click event
	 * @returns {void}
	 */
	Activate(){
		this._map.On("Click", this.ClickHandler);
	}
	
	/**
	 * Clear selected layers and close popup
	 * @returns {void}
	 */
	Clear() {
		this.layer.removeAll();

		this._map.popup.close();
	}
		
	/**
	 * When map is clicked, identify point location and emit change event for map and layer.
	 * @param {object} ev - Event object
	 * @returns {void}
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
	
	/**
	 * Emit error on behavior
	 * @param {object} error - Error object
	 * @returns {void}
	 */
	OnIdentify_Error(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}