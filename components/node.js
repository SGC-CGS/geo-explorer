'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

export default class _Node { 

	get elem() { return this._elem; }

	constructor(elem) {
		this._elem = elem;
	}
	
	On(type, handler) {
		this._elem.addEventListener(type, handler);
	}
	
	Elem(selector) {
		var elem = this._elem.querySelector(selector);
		
		return (!elem) ? null : elem;
	}
	
	Elems(selector) {
		var elems = this._elem.querySelectorAll(selector);
		var out = [];
		
		elems.forEach(e => out.push(e));
		
		return out;
	}
	
	Node(selector) {
		var elem = this._elem.querySelector(selector);
		
		return (!elem) ? null : new Node(elem);
	}
	
	Nodes(selector) {
		var elems = this._elem.querySelectorAll(selector);
		var out = [];
		
		elems.forEach(e => out.push(new Node(e)));
		
		return out;
	}
}