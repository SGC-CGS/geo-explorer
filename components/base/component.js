'use strict';

import Core from '../../tools/core.js';
import Evented from './evented.js';
import Nls from './nls.js';

/**
 * Component module, a base class for evented objects with no corresponding UI
 * @module components/component
 */
export default class Component extends Evented { 

	/**
	 * Get/set the config json object
	 */
	get config() { return this._config; }

	set config(value) { this._config = value; }

	/**
	 * Get/set the nls object
	 */
	get nls() { return this._nls; }

	set nls(value) { this._nls = value; }

	constructor() {
		super();
		
		this.config = {};
		this.nls = new Nls();
		
		this.Localize(this.nls);
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @param {string} locale - The app's current language 
	 * @returns {void}
	 */
	Configure(config) {
		return;
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		return;
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
}