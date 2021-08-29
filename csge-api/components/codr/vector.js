'use strict';

import Datapoint from './datapoint.js';

/**
 * Vector module
 * @module components/codr/vector
 * @description This class is used to parse the vector datapoint.
 */
export default class Vector { 

    /**
     * @description
     * Get the vector id 
     */
	get id() { return this.json.vectorId; }

    /**
     * @description
     * Get the coordinate 
     */
	get coordinate() { return this.json.coordinate; }

    /**
     * @description
     * Get the product id 
     */
	get productId() { return this.json.productId; }

    /**
     * @description
     * Get the vector data point 
     */
	get datapoints() { return this.json.vectorDataPoint; }

	get json() { return this._json; }

	set json(value) { this._json = value; }

	constructor(json) {		
		this.json = json;
		
		this.json.coordinate = this.json.coordinate.split(".");
		this.json.vectorDataPoint = this.json.vectorDataPoint.map(p => Datapoint.FromJson(p));
	}


    /**
     * @description
     * Parse vector from JSON
     * @param {String} json - json representation of the vector
     */
	static FromJson(json) {
		return new Vector(json);
	}

    /**
     * @description
     * Parse the JSON response from the vector response
     * @param {String} response - response representing the vector
     */
	static FromResponse(response) {
		//var json = JSON.parse(response);
		//return json.map(d => Vector.FromJson(d.object));
		return response.map(d => Vector.FromJson(d.object));
	}
}