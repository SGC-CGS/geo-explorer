'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * A given element is entered through the constructor and .On() function is used 
 * to add event listeners. The constructor is called in templated.js. You can see 
 * the list of event listeners for the given element by using 
 * getEventListeners(this._elem) in the console. 
 * @module components/node
 */
export default class _Node { 

	/**
	 * Get an HTML DOM element
	 */
	get elem() { return this._elem; }

	/**
	 * Initialize node class 
	 * @param {object} elem - Object containing Dom element
	 * @returns {void}
	 */
	constructor(elem) {
		this._elem = elem;
	}
	
	/**
	 * Add a full event listener to specified element
	 * @param {string} type - Name of the event to listen for (ex "input")
	 * @param {function} handler - Event handler function
	 */
	On(type, handler) {
		this._elem.addEventListener(type, handler);
	}
	
	/**
	 * Get an element
	 * @param {string} selector - A DOMString 
	 * @returns {object} NodeList
	 */
	Elem(selector) {
		var elem = this._elem.querySelector(selector);
		
		return (!elem) ? null : elem;
	}
	
	/**
	 * Get the full element list
	 * @param {string} selector - A DOMString 
	 * @returns {object} NodeList
	 */
	Elems(selector) {
		var elems = this._elem.querySelectorAll(selector);
		var out = [];
		
		elems.forEach(e => out.push(e));
		
		return out;
	}
	
	/**
	 * Get a node
	 * @param {string} selector - A DOMString 
	 * @returns {object} NodeList
	 */
	Node(selector) {
		var elem = this._elem.querySelector(selector);
		
		return (!elem) ? null : new Node(elem);
	}
	
	/**
	 * Get the full node list
	 * @param {string} selector - A DOMString 
	 * @returns {object} NodeList
	 */
	Nodes(selector) {
		var elems = this._elem.querySelectorAll(selector);
		var out = [];
		
		elems.forEach(e => out.push(new Node(e)));
		
		return out;
	}
}