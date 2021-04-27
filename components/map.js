 'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from '../tools/net.js';
import Requests from '../tools/requests.js';
import Evented from './evented.js';

/**
 * Map module
 * @module components/map
 * @extends Evented
  */
export default class Map extends Evented { 

	/**
	 * Get the popup and view content from the feature attributes
	 * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Popup.html|ArcGIS API for JavaScript}
	 */
	get popup() { return this._view.popup; }

	/**
	 * Get the view
	 * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-View.html#ui|ArcGIS API for JavaScript}
	 */
	get view() { return this._view; }
	
	/**
	 * Get the layers available on the map
	 * @type {array}
	 */
	get layers() { return this._layers; }
	
	/**
	 * Get the ESRI map object associated 
	 * @type {array}
	 */
	get map() { return this._map; }

	/**
	 * Call constructor of base class (Evented) and initialize map class 
	 * @param {object} container - Container for map div properties
	 * @returns {void}
	 */		
	constructor(container) {
		super();
		
		this._layers = {};
		this._behaviors = {};
		
		this._map = new ESRI.Map({ basemap: "streets" });
		
		this._view = new ESRI.views.MapView({
			animation : false,
			center: [-100, 63], 
			container: container, 
			map: this._map,  
			zoom: 4 
		});
		
		this._view.popup.collapseEnabled = false;

		this._view.on("click", this.OnMapView_Click.bind(this));
		
		var fullscreen = new ESRI.widgets.Fullscreen({ 
			view: this._view
		});

		this._view.ui.add(fullscreen, "top-left");
	}
	
	/**
	 * Add behavior to map (rectangle select, point identify)
	 * @param {string} id - Layer Id (ex "selection")
	 * @param {object} behavior - Behavior to be added
	 * @returns {object} Behavior that was added
	 */
	AddBehavior(id, behavior) {
		this._behaviors[id] = behavior;
		
		return behavior;
	}
	
	/**
	 * Get the behavior object for a specified behavior Id
	 * @param {string} id - Behavior Id (ex "identify")
	 * @returns {object} Behavior matching specified Id
	 */
	Behavior(id) {
		return this._behaviors[id] || null;
	}
	
	/**
	 * Place components (elements) in a suitable position on the UI
	 * @param {string[]} elements - Dom elements to be added 
	 * @param {string} position - position for the element to be added
	 * @returns {void}
	 * @todo Test for spread operator in Rollup
	 */
	Place(elements, position) {
		elements.forEach(e => this._view.ui.add(e, position));
	}
	
	/**
	 * Add client-side vector graphics layer to map. 
	 * @param {string} id - Layer Id (ex "selection")
	 * @returns {void}
	 */
	AddGraphicsLayer(id) {
		var layer = new ESRI.layers.GraphicsLayer();
		
		this._layers[id] = layer;
		
		this._map.add(layer);
	}

	/**
	 * Feature layers group similar vector geometry features. The appearance
	 * of a feature layer over a base map is more manageable than other web layers
	 * (MapImageLayer, GraphicsLayer). 
	 * @param {string} id - Layer ID
	 * @param {url} url - URL for map service
	 * @param {string} expression - Expression for filtering features
	 * @param {string[]} outFields - Field names to be included
	 * @param {object} renderer - Renderer assigned to the layer
	 * @param {number} index - Index number to assign in layers collection
	 * @returns {object} Layer object at specified id in layers collection
	 * @todo Verify this code is in use. Reference is commented out in application.js.
	 */
	AddFeatureLayer(id, url, expression, outFields, renderer, index) {
		var options = { url:url, outFields:outFields };
		
		if (expression) options.definitionExpression = expression;
		
		if (renderer) options.renderer = renderer;
		
		this._layers[id] = new ESRI.layers.FeatureLayer(options);
		
		this._map.add(this._layers[id], index);
		
		return this._layers[id];
	}
		
	/**
	 * Display data from server (map service) to the map based on request. 
	 * Much faster dynamically exporting image layers than exporting by features.
	 * @param {string} id - Layer Id (ex "main")
	 * @param {string} url - Map Server url for the layer
	 * @param {number} opacity - Opacity between 0 to 1
	 * @param {number} dpi - Dots per inch for dot density 
	 * @param {string} format - Image format
	 * @returns {void}
	 */
	AddMapImageLayer(id, url, opacity, dpi, format) {
		if (this._layers[id]) throw new Error("Layer already exists in map.");
		
		var layer = new ESRI.layers.MapImageLayer({
			url: url,
			imageFormat : format || 'png8',
			opacity : opacity || 1,
			dpi : dpi || 96,
			sublayers: []
		});
		
		this._layers[id] = layer;
		
		this._map.add(layer);
	}
	
	/**
	 * Remove sublayers from specified layer id
	 * @param {string} id - Layer Id (ex "main")
	 * @returns {void}
	 */
	EmptyLayer(id) {
		this.Layer(id).sublayers.removeAll();
	}
	
	/**
	 * Add map service sublayer to a layer.
	 * @param {string} id - Layer Id (ex "main")
	 * @param {object} sublayer - One of the several layers part of a group layer
	 * @returns {void}
	 */
	AddSubLayer(id, sublayer) {
		this.Layer(id).sublayers.add(sublayer);
	}
	
	/**
	 * Add map service sublayers to a layer.
	 * @param {string} id - Layer Id (ex "main")
	 * @param {object} sublayers - Layers that are part of a group layer
	 * @returns {void}
	 * @todo Verify that this function is being used.
	 */
	AddSubLayers(id, sublayers) {
		this.Layer(id).sublayers.addMany(sublayer);
	}
	
	/**
	 * Get the layer from layers array by layer id
	 * @param {string} id - Layer Id (ex "main")
	 * @returns {object} Layer object
	 */
	Layer(id) {
		return this._layers[id] || null;
	}
	
	/**
	 * Identify the selected feature in a layer
	 * @param {object} layer - Reference to a dataset containing spatial properties
	 * @param {object} geometry - holds type (point, polygon, line), extent, spatial reference, lat, long, etc. 
	 * @returns {promise} Promise with spatial query results if resolved
	 */
	Identify(layer, geometry) {
		var d = Core.Defer();
		
		Requests.QueryGeometry(layer, geometry).then(result => {
			d.Resolve({ feature:result.features[0], geometry:geometry });
		}, error => this.OnMapView_Error(error));
		
		return d.promise;
	}
	
	/**
	 * Occurs when you search for a place or zoom into a feature in the map. Takes the current 
	 * view and moves it to the desired location.
	 * @param {object} target - Location to view
	 * @returns {void}
	 */
	GoTo(target) {
		this._view.goTo(target);
	}
	
	/**
	 * Call emit when map is clicked
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnMapView_Click(ev) {		
		this.Emit("Click", ev);
	}
	
	/**
	 * Emit map error when one occurs
	 * @param {object} error - Error object
	 * @returns {void}
	 */
	OnMapView_Error(error) {		
		this.Emit("Error", { error:error });
	}
}