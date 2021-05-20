'use strict';

import Core from '../../tools/core.js';

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
	
	get uom() { return this.json.uom; }
	
	set uom(value) { this.json.uom = value; }

	get json() { return this._json; }

	set json(value) { this._json = value; }
	
	constructor(json) {		
		this.json = json;
	}
	
	toJSON() {
		return this.value;
	}
	
	Format(locale) {
		return Core.LocalizeNumber(this.value, locale);
	}
	
	static FromJson(json) {
		return new Datapoint(json);
	}
	
	static FromResponse(response) {
		return response.map(d => Datapoint.FromJson(d.object.vectorDataPoint));
	}
	
	static UnavailableDatapoint(refper, scalar, release, frequency, uom) {
		return Datapoint.FromJson({
			"refPer": refper,
			"refPer2": "",
			"refPerRaw": refper,
			"refPerRaw2": "",
			"value": null,
			"decimals": 0,
			"scalarFactorCode": 0,
			"symbolCode": 0,
			"statusCode": 1,		// 1 is .. not available
			"securityLevelCode": 0,
			"releaseTime": release,
			"frequencyCode": frequency,
			"uom": uom
		});
	}
}