'use strict';

export default class Datapoint { 

	get decimals() { return this.json.decimals; }

	get frequency() { return this.json.frequencyCode; }

	get date() { return this.json.refPer; }

	get release() { return this.json.releaseTime; }

	get scalar() { return this.json.scalarFactorCode; }

	get security() { return this.json.securityLevelCode; }

	get status() { return this.json.statusCode; }

	get symbol() { return this.json.symbolCode; }

	get value() { return this.json.value; }

	get json() { return this._json; }

	set json(value) { this._json = value; }
	
	constructor(json) {		
		this.json = json;
	}
	
	toJSON() {
		return this.value;
	}
		
	static FromJson(json) {
		return new Datapoint(json);
	}
	
	static FromResponse(response) {
		var json = JSON.parse(response);
	
		return json.map(d => Datapoint.FromJson(d.object.vectorDataPoint));
	}
}