'use strict';

import Core from '../tools/core.js';
import Evented from './evented.js';

export default class Metadata { 
	
	constructor () {		
		this._indicator = null;
		this._query = null,
		
		this._breaks = {
			n : null,
			algo : null
		}
		
		this._colors = {
			start : null,
			end : null
		}
	}
	
	Clone() {
		var meta = new Metadata();
		
		meta.indicator = this._indicator;
		meta.query = this._query;
		meta.breaks.n = this._breaks.n;
		meta.breaks.algo = this._breaks.algo;
		meta.colors.start = this._colors.start;
		meta.colors.end = this._colors.end;
		
		return meta;
	}
	
	static FromJson(json) {
		var meta = new Metadata();
		
		meta.indicator = json.IndicatorId;
		meta.query = json.PrimaryQuery;
		meta.breaks.n = json.DefaultBreaks;
		meta.breaks.algo = null;
		meta.colors.start = json.ColorFrom.split(",");
		meta.colors.end = json.ColorTo.split(",");
		
		return meta;
	}
}