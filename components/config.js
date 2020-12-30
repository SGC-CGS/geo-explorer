'use strict';

export default class Configuration { 

	get product() { return this.json.data.product; }

	get coordinates() { return this.json.data.coordinates; }

	get geo() { return this.json.data.geo; }

	get layer() { return this.json.layers[this.geo]; }

	get id() { return this.json.id[this.geo]; }
	
	get colors() { return this.json.colors }

	get json() { return this._json; }

	set json(value) { this._json = value; }

	constructor(json) {		
		this.json = json;
	}
		
	static FromJson(json) {
		return new Configuration(json);
	}
}