'use strict';

import Core from '../tools/core.js';

/**
 * Nls module
 * @module components/nls
 */
export default class Nls { 

	constructor(strings) {	
		this.strings = strings || {};
	}
	
	/**
	 * @description
	 * Get a localized nls string resource
	 * @param {String} id - the id of the nls resource to retrieve
	 * @param {Array} subs - an array of Strings to substitute in the localized nls string resource
	 * @param {String} locale - the locale for the nls resource
	 * @returns the localized nls string resource
	 */
	Resource(id, subs, locale) {
		if (!this.strings) throw new Error("Nls content not set.");
		
		var itm = this.strings[id];

		if (!itm) throw new Error("Nls String '" + id + "' undefined.");

		var txt = itm[(locale) ? locale : Core.locale];
		
		if (!txt) throw new Error("String does not exist for requested language.");

		return this.Format(txt, subs);
	}
	
	Add(id, locale, string) {
		if (!this.strings[id]) this.strings[id] = {};
				
		this.strings[id][locale] = string;
	}
	
	/**
	 * @description
	 * Merge the strings object into the this.strings object
	 * as a way to add nls.
	 * @param {*} strings 
	 */
	AddNls(strings) {
		this.strings = Core.Mixin(this.strings, strings);
	}
	
	/**
	 * @description
	 * Formats a String using substitute string
	 * @param {String} str - The String to format
	 * @param {Array} subs - An array of Strings to substitute into the String
	 * @returns the formatted String
	 */
	Format(str, subs) {
		if (!subs || subs.length == 0) return str;
		
		var s = str;

		for (var i = 0; i < subs.length; i++) {
			var reg = new RegExp("\\{" + i + "\\}", "gm");
			s = s.replace(reg, subs[i]);
		}

		return s;
	}
};
