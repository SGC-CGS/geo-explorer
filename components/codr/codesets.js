'use strict';

import Core from '../../tools/core.js';

export default class CodeSets {

    get json() { return this._json; }

    set json(value) { this._json = value; }

    security(code) {
        var security = this.json.securityLevel.find(m => m.securityLevelCode == code);
        
		if (!security) return null;
        
		var fld = Core.locale == "en" ? "securityLevelRepresentationEn" : "securityLevelRepresentationFr";
		
		return security[fld];
    }

    status(code) {
        var status = this.json.status.find(m => m.statusCode == code);
		
		if (!status) return null;

		var fld = Core.locale == "en" ? "statusRepresentationEn" : "statusRepresentationFr";

		return status[fld];
    }

    symbol(code) {
        var symbol = this.json.symbol.find(m => m.symbolCode == code);
		
		if (!symbol) return null;

		var fld = Core.locale == "en" ? "symbolRepresentationEn" : "symbolRepresentationFr";

		return symbol[fld];
    }

    scalar(code) {
        var scalar = this.json.scalar.find(m => m.scalarFactorCode == code);
		
		if (!scalar) return null;

		var fld = Core.locale == "en" ? "scalarFactorDescEn" : "scalarFactorDescFr";

		return scalar[fld];
    }

    frequency(code) {
        var frequency = this.json.frequency.find(m => m.frequencyCode == code);
		
		if (!frequency) return null;

		var fld = Core.locale == "en" ? "frequencyDescEn" : "frequencyDescFr";

		return frequency[fld];
    }

    uom(code) {
        var uom = this.json.uom.find(m => m.memberUomCode == code);
		
		if (!uom) return null;

		var fld = Core.locale == "en" ? "memberUomEn" : "memberUomFr";

		return uom[fld];
    }
	
	FormatDP(dp, locale) {
        var content = dp.Format(locale || Core.locale);
        
		var security = this.security(dp.security);
		var status = this.status(dp.status);
		var symbol = this.symbol(dp.symbol);
		var scalar = this.scalar(dp.scalar);
		var frequency = this.frequency(dp.frequency);
		var uom = this.uom(dp.uom);
		
        // If the value is suppressed, confidential or otherwise unavailable, show the replacement symbol (i.e: X, F, .. etc.)
        if (security) return security;
        
		if (status) {
            var letters = ["A", "B", "C", "D", "E", "F"];
			
			content = letters.indexOf(status) > -1 ? content + status.sup() : status;
        }
        
        // Any standard table symbol associated to the value as supercript        
		if (symbol) content += symbol.sup();
		
        // Units of measure associated to the value        
		if (uom) content = content + " " + uom;
		
		if (scalar && scalar != "units") content = content + " " + scalar;
        
		if (frequency) content = content + " - " + frequency;
		
		return content;
	}

    constructor(json) {
        this.json = json;        
    }

    static FromJson(json) {
        return new CodeSets(json);
    }

    static FromResponse(response) {
        return CodeSets.FromJson(response.object);
    }
}