'use strict';

import Core from '../../tools/core.js';
import Dimension from './dimension.js';

export default class Metadata { 

	get id() { return this.json.productId; }

	get dimensions() { return this.json.dimension; }
	
	get lastDimensionIndex() { return this.dimensions.length - 1; }
	
	get lastDimension() { return this.dimensions[this.lastDimensionIndex]; }
	
	get geoIndex() { return this._geoIndex; }

	get geoDimension() { return this._geo; }

	get geoLevel() { return this._geoLevel; }

	set geoLevel(value) { this._geoLevel = value; }

	get geoMembers() { 
		return this.geoDimension.members.filter(m => m.geoLevel == this.geoLevel); 
	}
	
	get nameEn() { return this.json.cubeTitleEn; }
	
	get nameFr() { return this.json.cubeTitleFr; }
	
	get name() { return Core.locale == "en" ? this.nameEn : this.nameFr; }

	get json() { return this._json; }

	set json(value) { this._json = value; }

	get productName() { return `${this.name} (${this.id})`;		 }

	get tvLink() { return `https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=${this.id}01`; }
	
	get date() { return this._json.cubeEndDate; }

	get release() { return this._json.releaseTime; }

	get frequency() { return this._json.frequencyCode; }

	constructor(json) {	
		this.json = json;
		
		this.json.dimension = this.json.dimension.map(d => Dimension.FromJson(d));
	
		this._geo = this.dimensions.find(d => d.nameEn == "Geography");
		this._geoIndex = this.dimensions.indexOf(this.geoDimension);
	}
	
	IndicatorLabel(coordinates) {
		var names = [];

		for (var i = 0; i < coordinates.length; i++) {
            if (coordinates[i] == "*") continue;

			var member = this.dimensions[i].members.find(m => m.id == coordinates[i]);
			
			if (member) names.push(member.name);
		}

		return `${names.join(", ")}`;
	}
		
	static FromJson(json) {
		return new Metadata(json);
	}
	
	static FromResponse(response) {
		//var json = JSON.parse(response);
		//return Metadata.FromJson(json[0].object);
		return Metadata.FromJson(response[0].object);
	}
}