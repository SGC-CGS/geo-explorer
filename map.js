'use strict';

import Core from '../geo-explorer/tools/core.js';
import Map from '../geo-explorer/components/map.js';

export default class MapExt extends Map { 

	constructor(container) {		
		super(container);
	}
	
	AddFeatureLayer(id, url, expression, outFields, renderer) {
		var options = { url:url, outFields:outFields };
		
		if (expression) options.definitionExpression = expression;
		
		if (renderer) options.renderer = renderer;
		
		this.layers[id] = new ESRI.layers.FeatureLayer(options);
		
		this.map.add(this.layers[id]);
		
		return this.layers[id];
	}
}