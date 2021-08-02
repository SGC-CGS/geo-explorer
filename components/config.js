'use strict';

import Core from '../../geo-explorer-api/tools/core.js';

/**
 * Configuration module
 * @module components/config
 * @description This class is used to parse and access application configurations.
 */
export default class Configuration { 

    /**
     * @description
     * Get the product 
     */
	get product() { return this.json.data.product; }

    /**
     * @description
     * Get the initial selection 
     */
    get initialSelection() { return this.json.data.initialSelection; }

    /**
     * @description
     * Get the ramps 
     */
	get ramps() { return this.json.ramps }

    /**
     * @description
     * Get the defColor 
     */
	get defColor() { return this.json.defColor }

	get json() { return this._json; }

	set json(value) { this._json = value; }

    get Map() { 
		return {
			basemap: this.json.map.basemap[Core.locale],
			zoom: this.json.map.zoom,
			center: this.json.map.center,
			animation: this.json.map.animation,
			constraints: {
				lods: ESRI.layers.support.TileInfo.create().lods 
			},
			layers: this.json.map.layers
		}
	}

    constructor(json) {		
		this.json = json;
	}
		
	static FromJson(json) {
		return new Configuration(json);
    }
    
    /**
     * @description
     * Get the layer by geo
     * @param {String} geo - geo
     */
    Layer (geo) { return this.json.map.layers[geo]; }

    /**
     * @description
     * Get the id by geo
     * @param {String} geo - geo
     */
    Id(geo) { return this.json.identify[geo].id; }
	
    /**
     * @description
     * Get identify configs by geo
     * @param {String} geo - geo
     */
	Identify(geo) {
		var fld = Core.locale == "en" ? "nameEn" : "nameFr";
		
		return {
			id: this.json.identify[geo].id,
			name: this.json.identify[geo][fld]
		}
    }

    /**
     * @description
     * Get symbol by id
     * @param {String} id - id
     */
	Symbol(id) {
		var s = this.json.symbols[id];
		
		if (!s) throw new Error(`Symbol ${0} does not exist is the configuration file.`);
		
		return s;
    }
}