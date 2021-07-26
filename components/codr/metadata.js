'use strict';

import Core from '../../tools/core.js';
import Dimension from './dimension.js';

/**
 * Metadata module
 * @module components/codr/metadata
 * @description This class is used to parse the results of the 
 * CODR metadata service call, plus helper methods.
 */
export default class Metadata { 

    /**
     * @description
     * Get the product ID 
     */
	get id() { return this.json.productId; }

    /**
     * @description
     * Get the dimensions 
     */
	get dimensions() { return this.json.dimension; }

    /**
     * @description
     * Get the index of the last dimension 
     */
	get lastDimensionIndex() { return this.dimensions.length - 1; }

    /**
     * @description
     * Get the last dimension 
     */
	get lastDimension() { return this.dimensions[this.lastDimensionIndex]; }

    /**
     * @description
     * Get the geoIndex 
     */
	get geoIndex() { return this._geoIndex; }

    /**
     * @description
     * Get the geo object 
     */
	get geoDimension() { return this._geo; }

    /**
     * @description
     * Get the geo level 
     */
	get geoLevel() { return this._geoLevel; }

    /**
     * @description
     * Set the value of the geo level
     * @param {String} value - geoLevel
     */
	set geoLevel(value) { this._geoLevel = value; }

    /**
     * @description
     * Get the members filtered by the geo level 
     */
	get geoMembers() { 
		return this.geoDimension.members.filter(m => m.geoLevel == this.geoLevel); 
	}

    /**
     * @description
     * Get the cube English title 
     */
	get nameEn() { return this.json.cubeTitleEn; }

    /**
     * @description
     * Get the cube French title 
     */
	get nameFr() { return this.json.cubeTitleFr; }

    /**
     * @description
     * Get the cube title of the current locale 
     */
	get name() { return Core.locale == "en" ? this.nameEn : this.nameFr; }

	get json() { return this._json; }

	set json(value) { this._json = value; }

    /**
     * @description
     * Get the product name 
     */
	get productName() { return this.name + " (" + this.productLabel + ")"; }

    /**
     * @description
     * Get the TV Link 
     */
    get tvLink() {
        if (Core.locale == "en")
            return `https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=${this.id}01`;
        else 
            return `https://www150.statcan.gc.ca/t1/tbl1/fr/tv.action?pid=${this.id}01`;
    }

    /**
     * @description
     * Get the cube end date 
     */
	get date() { return this._json.cubeEndDate; }

    /**
     * @description
     * Get the release time 
     */
	get release() { return this._json.releaseTime; }

    /**
     * @description
     * Get the frequency code 
     */
    get frequency() { return this._json.frequencyCode; }

    /**
     * @description
     * Get the product Label 
     */
    get productLabel() {
        // Format the product ID according to CODR practices (DD-DD-DDDD)
        var id = this.json.productId;
		
        if (id.length > 4) return id.substring(0, 2) + "-" + id.substring(2, 4) + "-" + id.substring(4);
       
		else return id;
    }


	constructor(json) {	
		this.json = json;
		
		this.json.dimension = this.json.dimension.map(d => Dimension.FromJson(d));
	
		this._geo = this.dimensions.find(d => d.nameEn == "Geography");
		this._geoIndex = this.dimensions.indexOf(this.geoDimension);
	}

    /**
     * @description
     * Get the indicator label based on the coordinates
     * @param {String} coordinates - array of coordinates
     */
	IndicatorLabel(coordinates) {
		var names = [];

		for (var i = 0; i < coordinates.length; i++) {
            if (coordinates[i] == "*") continue;

			var member = this.dimensions[i].members.find(m => m.id == coordinates[i]);
			
			if (member) names.push(member.name);
		}

		return `${names.join(", ")}`;
	}

    /**
     * @description
     * Parse metadata from JSON
     * @param {String} json - json representation of the metadata
     */
	static FromJson(json) {
		return new Metadata(json);
	}

    /**
     * @description
     * Parse the JSON response from the metadata service
     * @param {String} response - response from the metadata service
     */
	static FromResponse(response) {
		//var json = JSON.parse(response);
		//return Metadata.FromJson(json[0].object);
		return Metadata.FromJson(response[0].object);
	}
}