'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Evented from './evented.js';
import Node from './node.js';
import Nls from './nls.js';

/**
 * @module components/templated
 * @extends Evented
 */
export default class Templated extends Evented { 

	/**
	 * Get container object
	 */
	get container() { return this._container; }

	/**
	 * Get roots object
	 */
	get roots() { return this._roots; }

	/**
	 * Get nls object
	 */
	get nls() { return this._nls; }

	/**
	 * Call constructor of base class (Evented) and initialize templated class
	 * @param {object} container - div container and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)
	 * @returns {void}
	 */	
	constructor(container, options) {
		super();
		
		this._options = options || { };
		
		this._nls = new Nls();
		
		var json = this.constructor.Nls ? this.constructor.Nls(this._nls) : {};
		
		// this._nls = new Nls(json);
		
		this.BuildTemplate();
		
		if (this._template) this.SetNamedNodes();
	
		if (this._template) this.BuildSubWidgets();
		
		this.SetRoots();
		
		if (container) this.Place(container);
	}
	
	/**
	 * Get a localized nls string resource
	 * @param {string} id - Id of the nls resource to retrieve
	 * @param {string[]} subs - Array of Strings to substitute in the localized nls string resource
	 * @param {string} locale - Locale for the nls resource
	 * @returns {string} Localized nls string resource
	 */
	Nls(id, subs, locale) {
		return this.nls.Resource(id, subs, locale);
	}
	
	/**
	 * Build the template div with nls strings
	 * @returns {void}
	 */
	BuildTemplate() {
		// Use template provided in options first, use Template function second
		var html = this._options.template ? this._options.template : this.Template();
		
		// TODO : I think it still works with empty templates.
		if (!html) return;
		
		// Trailing whitespaces can cause issues when parsing the template, remove them
		html = html.trim();
		
		var nls = this._nls;
		
		// Replace all nls strings in template. Nls string pattern in templates is nls(StringId)
		html = this.Replace(html, /nls\((.*?)\)/, function(m) { return nls.Resource(m); });
		
		this._template = Dom.Create("div", { innerHTML:html });
	}
	
	/**
	 * Set children in class from template
	 * @returns {void}
	 */
	SetRoots() {
		this._roots = [];
		
		for (var i = 0; i < this._template.children.length; i++) {
			this._roots.push(this._template.children[i]);
		}
	}
	
	/**
	 * Set named nodes in class from template
	 * @returns {void}
	 */
	SetNamedNodes() {		
		var named = this._template.querySelectorAll("[handle]");
		
		this._nodes = {};
		
		// Can't use Array ForEach here since named is a NodeList, not an array
		for (var i = 0; i < named.length; i++) { 
			var name = Dom.GetAttribute(named[i], "handle");
			
			this._nodes[name] = named[i];
		}
	}
	
	/**
	 * Build widgets under each node
	 * @returns {void}
	 */
	BuildSubWidgets() {		
		var nodes = this._template.querySelectorAll("[widget]");
		
		// Can't use Array ForEach here since nodes is a NodeList, not an array
		for (var i = 0; i < nodes.length; i++) {
			var path = Dom.GetAttribute(nodes[i], "widget");
			var module = Core.Templatable(path);
			var widget = new module(nodes[i]);
			var handle = Dom.GetAttribute(widget.container, "handle");
			
			if (handle) this._nodes[handle] = widget;
		}
	}
	
	/**
	 * Set up roots in container
	 * @param {object} container - div container and properties
	 * @returns{void}
	 */
	Place(container) {
		this._container = container;
		
		this._roots.forEach(r => { Dom.Place(r, this._container); });
	}
	
	/**
	 * Set CSS for each root
	 * @param {string} css - CSS to be set
	 */
	SetCss(css) {
		this._roots.forEach(r => { Dom.SetCss(r, css); });
	}
	
	/**
	 * Return null from function
	 * @returns {void}
	 */
	Template() {
		return null;		
	}

	/**
	 * Replace pattern in HTML
	 * @param {string} str - HTML string on which to perform replace
	 * @param {string} expr - Pattern to match
	 * @param {function} delegate - Function to be used in replace
	 * @returns {string} Updated HTML string
	 */
	Replace(str, expr, delegate) {
		var m = str.match(expr);
		
		while (m) {
			str = str.replace(m[0], delegate(m[1]));
			m = str.match(expr);
		}
		
		return str;
	}
	
	/**
	 * Create a node for the specified element
	 * @param {string} id - Element Id (ex. "input")
	 * @returns {object} Node object
	 */
	Node(id) {
		return new Node(this._nodes[id]);
	}
	
	/**
	 * Return node object for specified element id
	 * @param {string} id - Element Id (ex. typeahead)
	 * @returns {object} Node object
	 */
	Elem(id) {
		return this._nodes[id];
	}
	
	/**
	 * Test function
	 * @param  {...any} ids 
	 */
	// NOTE : Test for spread operator in Rollup
	Nodes(...ids) {
		return ids.map(id => new Node(this._nodes[id]));
	}
	
	/**
	 * Test function
	 * @param  {...any} ids 
	 */
	// NOTE : Test for spread operator in Rollup
	Elems(...ids) {
		return ids.map(id => this._nodes[id]);
	}
	
	// TODO : Build a root function
}