'use strict';

import Core from '../../tools/core.js';
import Member from './member.js';

/**
 * Dimension module
 * @module components/codr/dimension
 * @description This class is used to parse the results of the 
 * CODR service call to retrieve dimensions.
 */
export default class Dimension { 

    /**
     * @description
     * Get the members 
     */
	get members() { return this.json.member; }

    /**
     * @description
     * Set the members
     * @param {String} value - member json object
     */
	set members(value) { this.json.member = value; }

    /**
     * @description
     * Get the English version of the name 
     */
	get nameEn() { return this.json.dimensionNameEn; }

    /**
     * @description
     * Get the French version of the name 
     */
    get nameFr() { return this.json.dimensionNameFr; }

	/**
     * @description
     * Get the name 
     */
	get name() { return Core.locale == "en" ? this.nameEn : this.nameFr; }

    /**
     * @description
     * Get the position id 
     */
	get position() { return this.json.dimensionPositionId; }

    /**
     * @description
     * Get the property hasUom which is true when a unit of measure is available 
     */
	get hasUom() { return this.json.hasUom; }

	get json() { return this._json; }

	set json(value) { this._json = value; }
	
	constructor(json) {
		this.json = json;
		
		this.json.member = this.json.member.map(m => Member.FromJson(m));
		
		this.index = {};
		
		this.members.forEach(m => this.index[m.id] = m);
	}

    /**
     * @description
     * Get the member by id 
     * @param {String} id - member ID
     */
	Member(id) {
		return this.index[id];
	}
	
	LastMember() {
		
	}

    /**
     * @description
     * Parse dimension from JSON
     * @param {String} json - json representation of the dimension
     */
	static FromJson(json) {
		return new Dimension(json);
	}
}