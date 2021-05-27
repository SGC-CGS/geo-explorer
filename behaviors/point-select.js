'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';
import Behavior from './behavior.js';

/**
 * Point Select module
 * @module behaviors/point-select
 * @extends Behavior
 */
export default class PointIdentifyBehavior extends Behavior { 

	/**
	 * Get/set field name (ex. "GeographyReferenceId")
	 */	
     get field() { return this._options.field; }

     set field(value) { this._options.field = value; }

	/**
	 * Get point-select layer object
	 */	
	get layer() { return this._map.Layer("pointselect"); }

	/**
	 * Get layer vector graphics
	 */	
	get graphics() { return this.layer.graphics; }

	/**
	 * Get/set target object from layer
	 */	
	get target() { return this._options.target; }

	set target(value) { 
		this.Clear();
		
		this._options.target = value; 
	}

	/**
	 * Get/set symbol object for highlighting selection (type, color, style, outline)
	 */	
	get symbol() { return this._options.symbol; }

	set symbol(value) { this._options.symbol = value; }

	/**
	 * Call constructor of base class (Behavior) and initialize point-select class 
	 * Adds point-select graphics layer and click handler.
	 * @param {object} map - Map object
	 * @param {object} options - Map options (not generally used)
	 * @returns {void}
	 */	
	constructor(map, options) {	
		super();

		this._options = {};
		this._map = map;
		
		this._map.AddGraphicsLayer('pointselect');
		
		this.ClickHandler = this.OnMap_Click.bind(this);
	}

	/**
	 * Call clear function and stop listening for map click events
	 * @returns {void}
	 */
	Deactivate(){
		this.Clear();

		this._map.Off("Click", this.ClickHandler);
	}

	/**
	 * Start listening for map click events
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
	 * When map is clicked, find the polygon containing the selected point, select/deselect the feature,
     * and update the table.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnMap_Click(ev) {		
		this.Emit("Busy");
		
		// identify selected point within polygon, then update selection 
		this._map.Identify(this.target, ev.mapPoint).then((r) => {
			this.Emit("Idle");	
			
			if (r.feature) {
				r.feature.symbol = this.symbol; // selected polygon style
			
				// REVIEW: We should think of having a proper selection class to handle the following logic.
				// The team needs to talk about this, nothing to do for now.
				var exists = this.layer.graphics.find(g => g.attributes[this.field] == r.feature.attributes[this.field]);
				
				// REVIEW: Something to keep in mind. If/when we have a very large selection, 
				// hundreds of rows for example, rendering the whole table can be slow. In that
				// case, we may have to make a more intelligent pointselect behavior. I.E., it 
				// should say whether we are adding or removing from the selection and return
				// the feature added or removed. This won't be an issue if we make a paged table,
				// which is pretty likely. Nothing to do for now.
				if (exists) {
					this.layer.remove(exists);
					this.Emit("Change", { pointselect:this.graphics }); // for table				
				} 
				
				else {
					this.layer.add(r.feature);
					this.Emit("Change", { mapPoint:ev.mapPoint, feature:r.feature, pointselect:this.graphics }); // for popup + table
				}
			}
		}, error => this.OnIdentify_Error(error));
	}
	
	/**
	 * Emit error when there is a problem with the behavior
	 * @param {object} error - Error object
	 * @returns {void}
	 */	
	OnIdentify_Error(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}