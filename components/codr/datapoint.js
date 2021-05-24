'use strict';

import Core from '../../tools/core.js';

/**
 * Datapoint module
 * @module components/codr/datapoint
 * @description This class is used to parse the datapoint object, plus helper methods.
 */
export default class Datapoint { 

    /**
     * @description
     * Get the decimals 
     */
	get decimals() { return this.json.decimals; }

    /**
     * @description
     * Get the frequency code 
     */
	get frequency() { return this.json.frequencyCode; }

    /**
     * @description
     * Get the reference period date 
     */
	get date() { return this.json.refPer; }

    /**
     * @description
     * Get the release time 
     */
	get release() { return this.json.releaseTime; }

    /**
     * @description
     * Get the scalar factor code 
     */
	get scalar() { return this.json.scalarFactorCode; }

    /**
     * @description
     * Get the security level code 
     */
	get security() { return this.json.securityLevelCode; }

    /**
     * @description
     * Get the status code 
     */
	get status() { return this.json.statusCode; }

    /**
     * @description
     * Get the symbol code 
     */
	get symbol() { return this.json.symbolCode; }

    /**
     * @description
     * Get the value 
     */
	get value() { return this.json.value; }

    /**
     * @description
     * Get the unit of measure 
     */
	get uom() { return this.json.uom; }

    /**
     * @description
     * Set the unit of measure 
     */
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

    /**
     * @description
     * Parse Datapoint from JSON
     * @param {String} json - json representation of the datapoint
     */
	static FromJson(json) {
		return new Datapoint(json);
	}

    /**
     * @description
     * Parse the JSON response from the datapoint response
     * @param {String} response - response representing the vector Datapoint
     */
	static FromResponse(response) {
		return response.map(d => Datapoint.FromJson(d.object.vectorDataPoint));
	}

    /**
     * @description
     * Returns a datapoint object representing some unavailable data 
     * @param {String} refper - reference period
     * @param {String} scalar - scalar factor code
     * @param {String} release - release date
     * @param {String} frequency - frequency code
     * @param {String} uom - unit of measure
     */
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