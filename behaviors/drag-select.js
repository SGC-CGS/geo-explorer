 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Behavior from '../components/base/behavior.js';

export default class RectangleSelectBehavior extends Behavior { 

	get selection() { return this._options.selection; }
	set selection(value) { this._options.selection = value; }

	get layer() { return this._options.layer; }
	set layer(value) { this._options.layer = value; }

	get target() { return this._options.target; }
	set target(value) { this._options.target = value; }

    get symbol() { return this._options.symbol; }
    set symbol(value) { this._options.symbol = value; }

	constructor(map, selection, layer, target, symbol) {
		// TODO MAYBE: This whole class would be maybe simpler if we didn't use the ESRI draw mechanism		
		super(map);
		
		this.selection = selection;
		this.layer = layer;
		this.target = target;
		this.symbol = symbol;
		
		this._draw = new ESRI.views.draw.Draw({ view : this.map.view });
		this._action = null;
		
		this._handlers = {"cursor-update": null, "draw-complete": null, "added":null, "removed":null};
	}

	/**
	 * Clear selection and remove drawing event hanlders
	 * @returns {void}
	 */
	Deactivate() {	
		if (!this.active) return;
		
		super.Deactivate();
		
		this._handlers["cursor-update"].remove();
		this._handlers["draw-complete"].remove();
		
		this.selection.Off("added", this._handlers["added"]);
		this.selection.Off("removed", this._handlers["removed"]);
		
		this.map.view.graphics.removeAll();
	}

	/**
	 * Setup rectangle drawing and bind drawing event handlers
	 * @returns {void}
	 */
	Activate() {
		if (this.active) return;
		
		super.Activate();
		
		// Whenever activated, we need to start listening to the selection object. 
		// Maybe the selection should handleEvent drawing selected objects
		this._handlers["added"] = this.selection.On("added", ev => {
			ev.added.symbol = this.symbol;
			this.layer.add(ev.added)
		});
		
		this._handlers["removed"] = this.selection.On("removed", ev => this.layer.remove(ev.removed));
		
		this.Start();
	}
	
	Start() {
		// Generate new action object, we have to listen to the new object
		this._action = this._draw.create("rectangle", { mode: "click" });
		
		this._handlers["cursor-update"] = this._action.on(["cursor-update"], this.OnDraw_CursorUpdate.bind(this));
		this._handlers["draw-complete"] = this._action.on(["draw-complete"], this.OnDraw_Complete.bind(this));
	}
	
	/**
	 * Create a polygon from the given vertices
	 * @param {number[]} vertices - 2D array of numbers representing the coordinates of each vertex
	 * @param {object} sref - Spatial reference object
	 * @returns {object} Object defining polygon (type, rings, spatialReference)
	 */
	VerticesToPolygon(vertices, sref) {
		var p1 = vertices[0];
		var p2 = vertices[1];
		
		// points are [x, y] format
		var ring = [p1, [p2[0], p1[1]], p2, [p1[0], p2[1]], p1];
		
		return { type: "polygon", rings: [ring], spatialReference: sref };
	}
	
	/**
	 * Add a graphic polygon to the map to show the rectangular selection 
	 * {@link https://developers.arcgis.com/javascript/latest/add-a-point-line-and-polygon/}
	 * @param {Object} ev - Event object
	 * @returns {void}
	 */
	OnDraw_CursorUpdate(ev) {
		if (ev.vertices.length < 2) return;
		
		this.map.view.graphics.removeAll();
		
		var geometry = this.VerticesToPolygon(ev.vertices, this.map.view.spatialReference);
		var outline = { color: [200, 20, 0], width: 1 }
		var symbol = { type: "simple-fill", color: [200, 20, 0, 0.3], style: "solid", outline: outline }
		
		this.map.view.graphics.add(new ESRI.Graphic({ geometry: geometry, symbol: symbol }));
	}
	
	/**
	 * If targeted layer(s) were selected by the geometry (rectangle) submit query and finish drawing
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnDraw_Complete(ev) {
		this.Emit("Busy");
		
		this.map.view.graphics.removeAll();
		
		if (ev.vertices.length < 2) return;
		
		var geometry = this.VerticesToPolygon(ev.vertices, this.map.view.spatialReference);
		
		var p = Requests.QueryGeometry(this.target, geometry);
		
		p.then(this.OnDraw_QueryComplete.bind(this), error => this.OnDraw_QueryError.bind(this));
	}
	
	/**
	 * When query results are ready, apply the symbol and add the graphic to highlight the features 
	 * that the user selected when they drew the rectangle. 
	 * @param {object} results - Spatial object with query results
	 * @returns {void}
	 */
	OnDraw_QueryComplete(results) {
		this.selection.ToggleMany(results.features);
		
		this.Emit("Idle");
		
		// Restart the drawing process only if the behavior is still active. Because
		// the query is Async, there's a possibility that it's been deactivated  here.		
		if (this.active) this.Start();
	}
	
	/**
	 * Emit error when there is a problem with the behavior
	 * @param {object} error - Error object
	 * @returns {void}
	 */		
	OnDraw_QueryError(error) {
		this.Emit("Error", { error:error });
		this.Emit("Idle");
	}
}