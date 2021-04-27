'use strict';

import Core from '../tools/core.js';

/**
 * Natural Language Support module
 * @module components/nls
  */
export default class Nls { 

	/**
	 * Initialize nls class
	 * @param {object} strings - Object containing strings in each language
	 * @returns {void}
	 */	
	constructor(strings) {	
		this.strings = strings || {};
	}
	
	/**
	 * Get a localized nls string resource
	 * @param {string} id - the id of the nls resource to retrieve
	 * @param {string[]} subs - Array of Strings to substitute in the localized nls string resource
	 * @param {string} locale - Locale for the nls resource (ex "en", "fr")
	 * @returns {string} The localized nls string resource
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
	 * Merge the strings object into the this.strings object as a way to add nls.
	 * @param {object} strings - Strings to be merged
	 * @returns {void}
	 */
	AddNls(strings) {
		this.strings = Core.Mixin(this.strings, strings);
	}
	
	/**
	 * Replace parts of a string using an array of substitutions
	 * @param {string} str - String on which to apply substitutions
	 * @param {string[]} subs - An array of Strings to substitute into the String
	 * @returns {string} String with substitutions applied
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
