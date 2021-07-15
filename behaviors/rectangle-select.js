 'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';
import Behavior from './behavior.js';

/**
 * Rectangle Select module
 * @module behaviors/rectangle-select
 * @extends Behavior
 */
export default class RectangleSelectBehavior extends Behavior { 

	/**
	 * Get selection layer object
	 */	
	get layer() { return this._map.Layer('selection'); }

	/**
	 * Get layer vector graphics
	 */	
	get graphics() { return this.layer.graphics; }

	/**
	 * Get/set target object from layer
	 */	
	get target() { return this._options.target; }

	set target(value) { 
		this._options.target = value;
		
		this.Clear();
	}

	/**
	 * Get/set field name (ex. "GeographyReferenceId")
	 */	
	get field() { return this._options.field; }

	set field(value) { this._options.field = value; }

	/**
	 * Get/set symbol object for highlighting selections (type, color, style, outline)
	 */	
	get symbol() { return this._options.symbol; }

	set symbol(value) { this._options.symbol = value; }

	/**
	 * Get / set whether the draw query is complete. This is for knowing whether 
	 * the cursor is no longer being updated.
	 */
	get drawComplete() { return this._drawComplete; }

	set drawComplete(value) { this._drawComplete = value; }

	/**
	 * Call constructor of base class (Behavior) and initialize rectangle-select class 
	 * Adds drawing, selection graphics layer, and handlers.
	 * @param {object} map - Map object
	 * @param {object} options - Map options 
	 * @returns {void}
	 */	
	constructor(map, options) {	
		super();
		
		this._options = {};
		this._map = map;
		this._draw = new ESRI.views.draw.Draw({ view : this._map.view });
		this._action = null;
		
		this._map.AddGraphicsLayer('selection');
		
		this._handlers = {"cursor-update": null, "draw-complete": null};
	}

	/**
	 * Clear selection and remove drawing event hanlders
	 * @returns {void}
	 */
	Deactivate(){
		this.Clear();
		
		this._handlers["cursor-update"].remove();
		this._handlers["draw-complete"].remove();	
	}

	/**
	 * Setup rectangle drawing and bind drawing event handlers
	 * @returns {void}
	 */
	Activate(){		
		this._action = this._draw.create("rectangle", { mode: "click" });
		
		this._handlers["cursor-update"] = this._action.on(["cursor-update"], this.OnDraw_CursorUpdate.bind(this));
		this._handlers["draw-complete"] = this._action.on(["draw-complete"], this.OnDraw_Complete.bind(this));
	}
	
	/**
	 * De-select the selected layers and remove highlight
	 * @returns {void}
	 */
	Clear() {
		this.layer.removeAll();
		this._map.view.graphics.removeAll();
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

		this.drawComplete = false;

		this._map.view.graphics.removeAll();
		
		var geometry = this.VerticesToPolygon(ev.vertices, this._map.view.spatialReference);
		var outline = { color: [200, 20, 0], width: 1 }
		var symbol = { type: "simple-fill", color: [200, 20, 0, 0.3], style: "solid", outline: outline }
		
		this._map.view.graphics.add(new ESRI.Graphic({ geometry: geometry, symbol: symbol }));
	}
	
	/**
	 * If targeted layer(s) were selected by the geometry (rectangle) submit query and finish drawing
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnDraw_Complete(ev) {
		this.drawComplete = true;

		this.Emit("Busy");
		
		this._map.view.graphics.removeAll();
		
		if (ev.vertices.length < 2) return;
		
		var geometry = this.VerticesToPolygon(ev.vertices, this._map.view.spatialReference);
		
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