'use strict';

import Component from './component.js';
import Template from './template.js';

/**
 * Evented module
 * @module components/evented
 */
export default class Widget extends Component { 
	
	/** 
	 * Get/set the widget's title
	*/	
	get title() { throw new Error("The getter for the widget's title must be implemented by the inhering widget."); }
	
	/**
	 * Get/set the config json object
	 */
	get config() { return this._config; }
	set config(value) { this._config = value; }
	
	/**
	 * Get/set the template object
	 */
	get template() { return this._template; }
	set template(value) { this._template = value; }

	/**
	 * Get/set the container DOM Element
	 */
	get container() { return this._container; }
	
	set container(value) { 
		this._container = value;
		
		if (this.container) this.template.Place(this.container); 
	}

	/**
	 * Get the roots of the widget
	 */
	get roots() { return this.template.roots; }

	/**
	 * Constructor for widget object
	 * @param {object} container - A DOM element that will contain the widget
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @param {object} nls - A Nls object containing the localized strings
	 * @returns {void}
	 */
	constructor(...config) {
		super(...config);
		
		this.config = {};
		
		// Use html provided in config first, use HTML function second
		var html = this.config.html ? this.config.html : this.HTML();
	
		if (html) {
			this.template = new Template(html);
			
			this.template.Build(this.nls);
		};
		
		if (config.length > 0) this.Configure(...config);
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
	 * Return an HTML fragment to build the widget's UI
	 * @returns {string} the HTML fragment for the widget's UI
	 */
	HTML() {
		return null;		
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
	 * Returns a node from the template's named nodes
	 * @param {*} id — the id of the named node to retrieve
	 * @returns {Node} A node object
	 */
	Node(id) {
		return this.template.Node(id);
	}
	
	/**
	 * Returns a DOM element from the template's named nodes
	 * @param {*} id — the id of the named node to retrieve the DOM Element for
	 * @returns {Node} A DOM element object
	 */
	Elem(id) {
		return this.template.Elem(id);
	}
	
	AddElem(id, elem) {
		this.template.AddElem(id, elem);
	}
}