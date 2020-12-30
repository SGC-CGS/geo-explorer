'use strict';

import Core from '../../geo-explorer/tools/core.js';
import Dimension from './dimension.js';

export default class Metadata { 

	get id() { return this.json.productId; }

	get dimensions() { return this.json.dimension; }

	get geo() { return this._geo; }
	
	get geoIndex() { return this._geoIndex; }
	
	get nameEn() { return this.json.cubeTitleEn; }
	
	get nameFr() { return this.json.cubeTitleFr; }
	
	get name() { return Core.locale == "en" ? this.nameEn : this.nameFr; }

	get json() { return this._json; }

	set json(value) { this._json = value; }

	constructor(json) {	
		this.json = json;
		
		this.json.dimension = this.json.dimension.map(d => Dimension.FromJson(d));
	
		this._geo = this.dimensions.find(d => d.nameEn == "Geography");
		this._geoIndex = this.dimensions.indexOf(this.geo);
	}
		
	static FromJson(json) {
		return new Metadata(json);
	}
	
	static FromResponse(response) {
		var json = JSON.parse(response);
		
		return Metadata.FromJson(json[0].object);
	}
}