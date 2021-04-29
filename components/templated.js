'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Evented from './evented.js';
import Node from './node.js';
import Nls from './nls.js';

/**
 * Templated module
 * @module components/templated
 * @extends Evented
 */
export default class Templated extends Evented { 

	get container() { return this._container; }

	get roots() { return this._roots; }

	get nls() { return this._nls; }

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
	
	SetRoots() {
		this._roots = [];
		
		for (var i = 0; i < this._template.children.length; i++) {
			this._roots.push(this._template.children[i]);
		}
	}
	
	SetNamedNodes() {		
		var named = this._template.querySelectorAll("[handle]");
		
		this._nodes = {};
		
		// Can't use Array ForEach here since named is a NodeList, not an array
		for (var i = 0; i < named.length; i++) { 
			var name = Dom.GetAttribute(named[i], "handle");
			
			this._nodes[name] = named[i];
		}
	}
	
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
	
	Place(container) {
		this._container = container;
		
		this._roots.forEach(r => { Dom.Place(r, this._container); });
	}
	
	SetCss(css) {
		this._roots.forEach(r => { Dom.SetCss(r, css); });
	}
	
	Template() {
		return null;		
	}

	Replace(str, expr, delegate) {
		var m = str.match(expr);
		
		while (m) {
			str = str.replace(m[0], delegate(m[1]));
			m = str.match(expr);
		}
		
		return str;
	}
	
	Node(id) {
		return new Node(this._nodes[id]);
	}
	
	Elem(id) {
		return this._nodes[id];
	}
	
	// NOTE : Test for spread operator in Rollup
	Nodes(...ids) {
		return ids.map(id => new Node(this._nodes[id]));
	}
	
	// NOTE : Test for spread operator in Rollup
	Elems(...ids) {
		return ids.map(id => this._nodes[id]);
	}
	
	// TODO : Build a root function
}