'use strict';

import Core from '../tools/core.js';
import Evented from './evented.js';

export default class Metadata { 
	
	constructor () {		
		this.indicator = null;
		this.geolevel = null;
		this.query = null,
		
		this.breaks = {
			n : null,
			algo : null
		}
		
		this.colors = {
			start : null,
			end : null
		}
	}
	
	Clone() {
		var meta = new Metadata();
		
		meta.indicator = this.indicator;
		meta.geolevel = this.geolevel;
		meta.query = this.query;
		meta.breaks.n = this.breaks.n;
		meta.breaks.algo = this.breaks.algo;
		meta.colors.start = this.colors.start;
		meta.colors.end = this.colors.end;
		
		return meta;
	}
	
	static FromJson(json) {
		var meta = new Metadata();
		
		meta.indicator = json.IndicatorId;
		meta.geolevel = null;
		meta.query = json.PrimaryQuery;
		meta.breaks.n = json.DefaultBreaks;
		meta.breaks.algo = null;
		meta.colors.start = json.ColorFrom;
		meta.colors.end = json.ColorTo;
		
		return meta;
	}
}