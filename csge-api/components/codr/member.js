'use strict';

import Core from '../../tools/core.js';

/**
 * Member module
 * @module components/codr/member
 * @description This class is used to parse the results of the 
 * CODR service call to retrieve members.
 */
export default class Member { 

    /**
     * @description
     * Get the member id 
     */
	get id() { return this.json.memberId; }

    /**
     * @description
     * Get the classification code 
     */
	get code() { return this.json.classificationCode; }

    /**
     * @description
     * Get the classification type code 
     */
	get type() { return this.json.classificationTypeCode; }

    /**
     * @description
     * Get the geo level 
     */
	get geoLevel() { return this.json.geoLevel; }

    /**
     * @description
     * Get the member English name 
     */
	get nameEn() { return this.json.memberNameEn; }

    /**
     * @description
     * Get the member French name 
     */
	get nameFr() { return this.json.memberNameFr; }

    /**
     * @description
     * Get the member name 
     */
	get name() { return Core.locale == "en" ? this.nameEn : this.nameFr; }

    /**
     * @description
     * Get the member unit of measure code
     */
	get uom() { return this.json.memberUomCode; }

    /**
     * @description
     * Get the member parent id
     */
	get parentId() { return this.json.parentMemberId; }

    /**
     * @description
     * Returns true if terminated 
     */
	get terminated() { return this.json.terminated == 1; }

    /**
     * @description
     * Get the vintage 
     */
	get vintage() { return this.json.vintage; }

	get json() { return this._json; }

	set json(value) { this._json = value; }
	
	constructor(json) {
		this.json = json;		
	}

    /**
     * @description
     * Parse member from JSON
     * @param {String} json - json representation of the member
     */
	static FromJson(json) {
		return new Member(json);
	}
}