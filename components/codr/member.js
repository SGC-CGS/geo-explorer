'use strict';

import Core from '../../tools/core.js';

export default class Member { 
	
	get id() { return this.json.memberId; }
	
	get code() { return this.json.classificationCode; }
	
	get type() { return this.json.classificationTypeCode; }
	
	get geoLevel() { return this.json.geoLevel; }
	
	get nameEn() { return this.json.memberNameEn; }
	
	get nameFr() { return this.json.memberNameFr; }
	
	get name() { return Core.locale == "en" ? this.nameEn : this.nameFr; }
	
	get uom() { return this.json.memberUomCode; }
	
	get parentId() { return this.json.parentMemberId; }
	
	get terminated() { return this.json.terminated == 1; }
	
	get vintage() { return this.json.vintage; }

	get json() { return this._json; }

	set json(value) { this._json = value; }
	
	constructor(json) {
		this.json = json;		
	}

	static FromJson(json) {
		return new Member(json);
	}
}