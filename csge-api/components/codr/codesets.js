'use strict';

import Core from '../../tools/core.js';

/**
 * CodeSets module
 * @module components/codr/codesets
 * @description This class is used to parse the results of the 
 * CODR codesets service call, plus helper methods for decoding and formatting the properties.
 */
export default class CodeSets {

    get json() { return this._json; }

    set json(value) { this._json = value; }

    constructor(json) {
        this.json = json;        
    }
	
    /**
     * @description
     * Get the decoded value of a security code, depending on the locale.
     * See details in Appendix A: https://www.statcan.gc.ca/eng/developers/wds/user-guide#a15
     * @param {String} code - security code to be decoded
     */
    security(code) {
        var security = this.json.securityLevel.find(m => m.securityLevelCode == code);

		if (!security) return null;
        
		var code = Core.locale == "en" ? "securityLevelRepresentationEn" : "securityLevelRepresentationFr";
        var desc = Core.locale == "en" ? "securityLevelDescEn" : "securityLevelDescFr";
		
		return {
			code: security[code],
			description: security[code] + ", " + security[desc]
		}
    }

    /**
     * @description
     * Get the decoded value of a status code, depending on the locale.
     * See details in Appendix A: https://www.statcan.gc.ca/eng/developers/wds/user-guide#a15
     * @param {String} code - status code to be decoded
     */
    status(code) {
        var status = this.json.status.find(m => m.statusCode == code);
		
		if (!status) return null;

		var code = Core.locale == "en" ? "statusRepresentationEn" : "statusRepresentationFr";
        var desc = Core.locale == "en" ? "statusDescEn" : "statusDescFr";
        
		return {
			code: status[code],
			description: status[code] + ", " + status[desc]
		}
    }

    /**
     * @description
     * Get the decoded value of a symbol code, depending on the locale.
     * See details in Appendix A: https://www.statcan.gc.ca/eng/developers/wds/user-guide#a15
     * @param {String} code - symbol code to be decoded
     */
    symbol(code) {
        var symbol = this.json.symbol.find(m => m.symbolCode == code);		
		
		if (!symbol) return null;

		var code = Core.locale == "en" ? "symbolRepresentationEn" : "symbolRepresentationFr";
        var desc = Core.locale == "en" ? "symbolDescEn" : "symbolDescEn";
		
		return {
			code: symbol[code],
			description: symbol[code] + ", " + symbol[desc]
		}
    }

    /**
     * @description
     * Get the decoded value of a scalar code, depending on the locale.
     * See details in Appendix A: https://www.statcan.gc.ca/eng/developers/wds/user-guide#a15
     * @param {String} code - scalar code to be decoded
     */
    scalar(code) {
        var scalar = this.json.scalar.find(m => m.scalarFactorCode == code);	
		
		if (!scalar) return null;

		var fld = Core.locale == "en" ? "scalarFactorDescEn" : "scalarFactorDescFr";
		
		return scalar[fld];
    }
    
    /**
     * @description
     * Get the decoded value of a frequency code, depending on the locale.
     * See details in Appendix A: https://www.statcan.gc.ca/eng/developers/wds/user-guide#a15
     * @param {String} code - frequency code to be decoded
     */
    frequency(code) {
        var frequency = this.json.frequency.find(m => m.frequencyCode == code);		
		
		if (!frequency) return null;

		var fld = Core.locale == "en" ? "frequencyDescEn" : "frequencyDescFr";
		
		return frequency[fld];
    }
    
    /**
     * @description
     * Get the decoded value of a unit of measure (uom) code, depending on the locale.
     * See details in the user guide: https://www.statcan.gc.ca/eng/developers/wds/user-guide
     * @param {String} code - unit of measure code to be decoded
     */
    uom(code) {
        var uom = this.json.uom.find(m => m.memberUomCode == code);		
		
		if (!uom) return null;

		var fld = Core.locale == "en" ? "memberUomEn" : "memberUomFr";
		
		return uom[fld];
    }

    /**
     * Get the description of security, status and symbol values, if any, for the datapoint 
     * @param {any} dp
     * @param {any} locale
     */
    GetFormattedDP(dp, locale) {
        var security = this.security(dp.security);
        var status = this.status(dp.status);
        var symbol = this.symbol(dp.symbol);
		var sup = [];
		var abbr = [];

        // If the value is suppressed, confidential or otherwise unavailable, show the replacement symbol (i.e: X, F, .. etc.)
		if (security.code) {
			var value = security.code;
			abbr.push(security.description);
		}
		
		else {
			if (status.code == null) var value = dp.Localized();
			
			else if (["A", "B", "C", "D", "E"].includes(status.code)) {
				var value = dp.Localized();
				sup.push(status.code);
				abbr.push(status.description);
			}
			
			else {
				var value = status.code;
				abbr.push(status.description);
			}
		}
		
		if (symbol.code) {
			sup.push(symbol.code);
			abbr.push(symbol.description);
		}

		if (abbr.length == 0) return `${value}`;

		else if (sup.length == 0) return `<abbr title="${abbr.join(" - ")}">${value}</abbr>`;

		else return `<abbr title="${abbr.join("\n")}">${value}<sup>${sup.join(", ")}</sup></abbr>`;

    }

    /**
     * @description
     * Parse codesets from JSON
     * @param {String} json - json representation of the codesets
     */
    static FromJson(json) {
        return new CodeSets(json);
    }

    /**
     * @description
     * Parse the JSON response from the codesets service
     * @param {String} response - response from the codesets service
     */
    static FromResponse(response) {
        return CodeSets.FromJson(response.object);
    }
}