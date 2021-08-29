'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Behavior from '../components/base/behavior.js';

export default class ClickSelectBehavior extends Behavior { 

	get selection() { return this._options.selection; }
	set selection(value) { this._options.selection = value; }

	get layer() { return this._options.layer; }
	set layer(value) { this._options.layer = value; }

	get target() { return this._options.target; }
	set target(value) { this._options.target = value; }

    get symbol() { return this._options.symbol; }
    set symbol(value) { this._options.symbol = value; }

	constructor(map, selection, layer, target, symbol) {	
		super(map);

		this.selection = selection;
		this.layer = layer;
		this.target = target;
		this.symbol = symbol;
		
		this.ClickHandler = this.OnMap_Click.bind(this);
		
		this._handlers = { "added":null, "removed":null};
	}

	Deactivate() {
		if (!this.active) return;
		
		super.Deactivate();
		
		this.map.Off("Click", this.ClickHandler);
		
		this.selection.Off("added", this._handlers["added"]);
		this.selection.Off("removed", this._handlers["removed"]);
	}

	/**
	 * Start listening for map click events
	 * @returns {void}
	 */
	Activate() {
		if (this.active) return;
		
		super.Activate();
		
		this.map.On("Click", this.ClickHandler);
		
		this._handlers["added"] = this.selection.On("added", ev => {
			ev.added.symbol = this.symbol;
			this.layer.add(ev.added)
		});
		
		this._handlers["removed"] = this.selection.On("removed", ev => this.layer.remove(ev.removed));
	}
	
	/**
	 * When map is clicked, find the polygon containing the selected point, select/deselect the feature,
     * and update the table.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnMap_Click(ev) {		
		this.Emit("Busy");
		
		this.map.Identify(this.target, ev.mapPoint).then((r) => {
			this.Emit("Idle");	
			
			if (!r.feature) return;
			
			this.selection.Toggle(r.feature);
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