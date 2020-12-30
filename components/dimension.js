'use strict';

import Core from '../../geo-explorer/tools/core.js';
import Member from './member.js';

export default class Dimension { 
	
	get members() { return this.json.member; }
	
	set members(value) { this.json.member = value; }
	
	get nameEn() { return this.json.dimensionNameEn; }
	
	get nameFr() { return this.json.dimensionNameFr; }
	
	get name() { return Core.locale == "en" ? this.nameEn : this.nameFr; }
	
	get position() { return this.json.dimensionPositionId; }
	
	get hasUom() { return this.json.hasUom; }

	get json() { return this._json; }

	set json(value) { this._json = value; }
	
	constructor(json) {
		this.json = json;
		
		this.json.member = this.json.member.map(m => Member.FromJson(m));
		
		this.index = {};
		
		this.members.forEach(m => this.index[m.id] = m);
	}

	Member(id) {
		return this.index[id];
	}

	static FromJson(json) {
		return new Dimension(json);
	}
}