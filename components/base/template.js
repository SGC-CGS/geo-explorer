'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Node from '../node.js';

/**
 * Templated module
 * @module components/templated
 * @extends Evented
 */
export default class Templated { 

	get roots() { return this._roots; }

	get html() { return this._html; }

	set html(value) { this._html = value.trim(); }

	constructor(html) {		
		this.html = html;
	}
	
	Build(nls) {		
		// Replace all nls strings in template. Nls string pattern in templates is nls(StringId)
		var html = this.Replace(this.html, /nls\((.*?)\)/, function(m) { return nls.Resource(m); });
		
		this._template = Dom.Create("div", { innerHTML:html });
		
		this.SetNamedNodes();
		this.SetSubWidgets();
		this.SetRoots();
	}
	
	SetNamedNodes() {		
		var named = this._template.querySelectorAll("[handle]");
		
		this._elems = {};
		
		// Can't use Array ForEach here since named is a NodeList, not an array
		for (var i = 0; i < named.length; i++) { 
			var name = Dom.GetAttribute(named[i], "handle");
			
			this._elems[name] = named[i];
		}
	}
	
	SetSubWidgets() {		
		var nodes = this._template.querySelectorAll("[widget]");
		
		// Can't use Array ForEach here since nodes is a NodeList, not an array
		for (var i = 0; i < nodes.length; i++) {
			var path = Dom.GetAttribute(nodes[i], "widget");
			var module = Core.Templatable(path);
			var widget = new module(nodes[i]);
			var handle = Dom.GetAttribute(widget.container, "handle");
			
			if (handle) this._elems[handle] = widget;
		}
	}
	
	SetRoots() {
		this._roots = [];
		
		for (var i = 0; i < this._template.children.length; i++) {
			this._roots.push(this._template.children[i]);
		}
	}
	
	Place(container) {
		this._container = container;
		
		this.roots.forEach(r => { Dom.Place(r, this._container); });
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
		return new Node(this._elems[id]);
	}
	
	Elem(id) {
		return this._elems[id];
	}
	
	AddElem(name, elem) {
		this._elems[name] = elem;
	}
}