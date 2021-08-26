 'use strict';

import Core from '../tools/core.js';
import Behavior from '../components/base/behavior.js';

export default class RectangleSelectBehavior extends Behavior { 

	get layer() { return this._options.layer; }
	set layer(value) { this._options.layer = value; }

	constructor(map, layer) {	
		super(map);
		
		this.layer = layer;
		
		this._handlers = { "pointer-move":null, "pointer-leave":null };
	}

	/**
	 * Clear selection and remove drawing event hanlders
	 * @returns {void}
	 */
	Deactivate() {
		if (!this.active) return;
		
		super.Deactivate();	
		
		this._handlers["pointer-move"].remove();
		this._handlers["pointer-leave"].remove();
		
		this.StopHover();
	}

	/**
	 * Setup rectangle drawing and bind drawing event handlers
	 * @returns {void}
	 */
	Activate() {
		if (this.active) return;
		
		super.Activate();
		
		this.EnableHitTest();
	}

	/**
	 * @description
	 * Given a behavior, identify, and emit the graphic being hovered on by using a simple hit test
	 * {@link https://developers.arcgis.com/javascript/latest/sample-code/view-hittest/|ArcGIS API for JavaScript}
	 */
	EnableHitTest() {
		this.map.view.whenLayerView(this.layer).then(layerView => {
			this._layerView = layerView;
			
			this._handlers["pointer-move"] = this.map.view.on("pointer-move", ev => {
				this.map.view.hitTest(ev, { include:[this.layer] }).then((r, ev) => {
					if (r.results.length > 0) {
						var graphic = r.results[0].graphic;
						
						if (this._graphic !== graphic) this.StopHover();
						
						this.StartHover(graphic, r.screenPoint);
					}
					
					// For when you have left the graphic 
					else this.StopHover();
				});
			});

			// For when you have left the view
			this._handlers["pointer-leave"] = this.map.view.on("pointer-leave", ev => this.StopHover());
		});
	}
	
	StartHover(graphic, screenPoint) {		
		if (this._graphic !== graphic) {
			this._handler = this._layerView.highlight(graphic);
			this._graphic = graphic;
		}
		
		// screenPoint.y -= 10;
		
		var position = this.map.view.toMap(screenPoint);
		
		this.Emit("pointer-move", { position:position, graphic:graphic });
	}
	
	StopHover() {
		if (this._graphic) {
			this.Clear();
			
			this.Emit("pointer-leave");
		}
	}
	
	Clear() {		
		this._handler.remove();
		
		this._graphic = null;
		this._handler = null;
	}
}