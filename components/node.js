'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Node module
 * @module components/node
 * @description A given element is entered through the constructor
 * and .On() function is used to add event listeners.
 * The constructor is called in templated.js.
 * You can see the list of event listeners for the given 
 * element by using getEventListeners(this._elem) in the
 * console. 
 */
export default class _Node { 

	/**
	 * @description get a HTML DOM
	 */
	get elem() { return this._elem; }

	constructor(elem) {
		this._elem = elem;
	}
	
	/**
	 * @description
	 * Add a full event listener
	 * @param {*} type - name of the event to listen for
	 * @param {*} handler - The event handler 
	 */
	On(type, handler) {
		this._elem.addEventListener(type, handler);
	}
	
	/**
	 * @description
	 * Get an element
	 * @param {*} selector - A DOMString 
	 * @returns - NodeList
	 */
	Elem(selector) {
		var elem = this._elem.querySelector(selector);
		
		return (!elem) ? null : elem;
	}
	
	/**
	 * @description
	 * Get the full element list
	 * @param {*} selector - A DOMString 
	 * @returns - NodeList
	 */
	Elems(selector) {
		var elems = this._elem.querySelectorAll(selector);
		var out = [];
		
		elems.forEach(e => out.push(e));
		
		return out;
	}
	
	/**
	 * @description
	 * Get a node
	 * @param {*} selector - A DOMString 
	 * @returns - NodeList
	 */
	Node(selector) {
		var elem = this._elem.querySelector(selector);
		
		return (!elem) ? null : new Node(elem);
	}
	
	/**
	 * @description
	 * Get the full node list
	 * @param {*} selector - A DOMString 
	 * @returns - NodeList
	 */
	Nodes(selector) {
		var elems = this._elem.querySelectorAll(selector);
		var out = [];
		
		elems.forEach(e => out.push(new Node(e)));
		
		return out;
	}
}