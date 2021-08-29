'use strict';

import Core from '../../csge-api/tools/core.js';
import Map from '../../csge-api/components/map.js';

export default class MapExt extends Map { 

	constructor(container, options) {		
		super(container, options);
	}
	
	AddFeatureLayer(id, url, expression, outFields, renderer, index) {
		var options = { url:url, outFields:outFields };
		
		if (expression) options.definitionExpression = expression;
		
		if (renderer) options.renderer = renderer;
		
		this.layers[id] = new ESRI.layers.FeatureLayer(options);
		
		this.map.add(this.layers[id], index);
		
		return this.layers[id];
    }

    RemoveFeatureLayer(id) {
        if (!this.layers[id]) return;

        this.map.remove(this.layers[id]);

        this.layers[id] = null;
    }
}