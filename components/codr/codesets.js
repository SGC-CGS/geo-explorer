'use strict';

import Core from '../../tools/core.js';
import Nls from '../nls.js';

/**
 * CodeSets module
 * @module components/codr/codesets
 * @description This class is used to parse the results of the 
 * CODR codesets service call, plus helper methods for decoding and formatting the properties.
 */
export default class CodeSets {

    get json() { return this._json; }

    set json(value) { this._json = value; }

    get nls() { return this._nls; }

    /**
     * @description
     * Get the decoded value of a security code, depending on the locale.
     * See details in Appendix A: https://www.statcan.gc.ca/eng/developers/wds/user-guide#a15
     * @param {String} code - security code to be decoded
     */
    security(code) {
        var security = this.json.securityLevel.find(m => m.securityLevelCode == code);
        
		if (!security) return null;
        
		var fld = Core.locale == "en" ? "securityLevelRepresentationEn" : "securityLevelRepresentationFr";
		
		return security[fld];
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

		var fld = Core.locale == "en" ? "statusRepresentationEn" : "statusRepresentationFr";

		return status[fld];
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

		var fld = Core.locale == "en" ? "symbolRepresentationEn" : "symbolRepresentationFr";

		return symbol[fld];
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

    static Nls(nls) {
        nls.Add("ValueColumn", "en", "Value:");
        nls.Add("ValueColumn", "fr", "Valeur:");

        nls.Add("FreqColumn", "en", "Frequency:");
        nls.Add("FreqColumn", "fr", "Fréquence:");

        nls.Add("RefPerColumn", "en", "Reference Period:");
        nls.Add("RefPerColumn", "fr", "Période de référence:");

        nls.Add("UomColumn", "en", "Unit of measure:");
        nls.Add("UomColumn", "fr", "Unité de mesure:");

        nls.Add("ScalarColumn", "en", "Scalar factor:");
        nls.Add("ScalarColumn", "fr", "Facteur scalaire:");
    }


    /**
     * @description
     * Format a Datapoint description in html format - for a specific locale, including symbol, uom, etc.
     * @param {String} dp - Datapoint object
     * @param {String} locale - locale, en/fr
     */
    FormatDP_HTMLTable(dp, refPer, locale) {
        var htmlTable = "<table class='popup-table'><tbody handle='body'>";
        
        var content = dp.Format(locale || Core.locale);

        var security = this.security(dp.security);
        var status = this.status(dp.status);
        var symbol = this.symbol(dp.symbol);
        var scalar = this.scalar(dp.scalar);
        var frequency = this.frequency(dp.frequency);
        var uom = this.uom(dp.uom);

        // If the value is suppressed, confidential or otherwise unavailable, show the replacement symbol (i.e: X, F, .. etc.)
        if (security) {
            htmlTable += "<tr><td>" + this.Nls("ValueColumn") + "</td><td>" + security + "</td></tr></tbody></table>";
            return htmlTable;
        }

        if (status) {
            var letters = ["A", "B", "C", "D", "E", "F"];

            content = letters.indexOf(status) > -1 ? content + status.sup() : status;
        }

        // Any standard table symbol associated to the value as supercript        
        if (symbol) content += symbol.sup();
        
        htmlTable += "<tr><td>" + this.Nls("ValueColumn") + "</td><td>" + content + "</td></tr>";

        if (!frequency) frequency = "";
        htmlTable += "<tr><td>" + this.Nls("FreqColumn") + "</td><td>" + frequency + "</td></tr>";
        
        if (!refPer) refPer = "";
        htmlTable += "<tr><td>" + this.Nls("RefPerColumn") + "</td><td>" + refPer + "</td></tr>";
        
        if (!uom) uom = ""; 
        htmlTable += "<tr><td>" + this.Nls("UomColumn") + "</td><td>" + uom + "</td></tr>";
        
        if (!scalar) scalar = "";
        htmlTable += "<tr><td>" + this.Nls("ScalarColumn") + "</td><td>" + scalar + "</td></tr>";
        
        htmlTable += "</tbody></table>";

        return htmlTable;
    }

    /**
     * @description
     * Format a Datapoint description for a specific locale, including symbol, uom, etc.
     * @param {String} dp - Datapoint object
     * @param {String} locale - locale, en/fr
     */
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
        this._nls = new Nls();
        this.constructor.Nls(this._nls);
    }

    /**
	 * @description
	 * Get a localized nls string resource
	 * @param {*} id — the id of the nls resource to retrieve
	 * @param {Array} subs - an array of Strings to substitute in the localized nls string resource
	 * @param {String} locale - the locale for the nls resource
	 * @returns - the localized nls string resource
	 */
    Nls(id, subs, locale) {
        return this.nls.Resource(id, subs, locale);
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