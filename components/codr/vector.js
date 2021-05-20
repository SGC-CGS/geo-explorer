'use strict';

import Datapoint from './datapoint.js';

export default class Vector { 

	get id() { return this.json.vectorId; }

	get coordinate() { return this.json.coordinate; }

	get productId() { return this.json.productId; }

	get datapoints() { return this.json.vectorDataPoint; }

	get json() { return this._json; }

	set json(value) { this._json = value; }

	constructor(json) {		
		this.json = json;
		
		this.json.coordinate = this.json.coordinate.split(".");
		this.json.vectorDataPoint = this.json.vectorDataPoint.map(p => Datapoint.FromJson(p));
	}
		
	static FromJson(json) {
		return new Vector(json);
	}
	
	static FromResponse(response) {
		//var json = JSON.parse(response);
		//return json.map(d => Vector.FromJson(d.object));
		return response.map(d => Vector.FromJson(d.object));
	}
}