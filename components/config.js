'use strict';

import Core from '../../geo-explorer/tools/core.js';


export default class Configuration { 

	get product() { return this.json.data.product; }

    get initialSelection() { return this.json.data.initialSelection; }

	get ramps() { return this.json.ramps }

	get defColor() { return this.json.defColor }

	get json() { return this._json; }

	set json(value) { this._json = value; }
    
    get LegendItems() {
        return this.json.legend.items.map(i => {
            return {
                id: i.id,
                label: i.label[Core.locale],
                url: i.url
            }
        });
    }

	constructor(json) {		
		this.json = json;
	}
		
	static FromJson(json) {
		return new Configuration(json);
    }

    Layer (geo) { return this.json.layers[geo]; }

    Id(geo) { return this.json.id[geo]; }

	Identify(geo) {
		var fld = Core.locale == "en" ? "nameEn" : "nameFr";
		
		return {
			id: this.json.identify[geo].id,
			name: this.json.identify[geo][fld]
		}
	}

	Symbol(id) {
		var s = this.json.symbols[id];
		
		if (!s) throw new Error(`Symbol ${0} does not exist is the configuration file.`);
		
		return s;
    }
}