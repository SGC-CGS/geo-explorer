'use strict';

let _nls = null;
let _locale = document.documentElement.lang || "en";
let _templatables = {}
let _id = 0;

/**
 * Core module
 * @module tools/core
 */
export default class Core {
		
	/**
	* Get or set the locale string.
	* @type {string}
	*/
    static get locale() { return _locale; }
	
    static set locale(value) { _locale = value; }
	
	/**
	* A convenience function to get a defered object for asynchronous processing. 
	* Removes one level of nesting when working with promises.
	* @returns {Promise} A promise object associated to the asynchronous process (with resolve and reject functions)
	*/
	static Defer() {
		var defer = {};
		
		defer.promise = new Promise((resolve, reject) => {
			defer.Resolve = (result) => { resolve(result); };
			defer.Reject = (error) => { reject(error); };
		});
		
		return defer;
	}
	
	/**
	* Get or set a templated class definition, this is required to nest Templated UI 
	* components within other Templated UI components.
	* @param {string} id - Id of the templated class definition to get or set
	* @param {class} definition - When specified, the class definition to set 
	* @returns {class} The class definition created  
	*/
	static Templatable(id, definition) {
		if (definition) {
			if (_templatables[id]) throw new Error(`Templatable ${id} is defined multiple times.`);
			
			else _templatables[id] = definition;
		}
		else if (!_templatables[id]) throw new Error(`Templatable ${id} is not defined.`);
		
		return _templatables[id];
	}
	
	/**
	* Get an Array of class definitions by matching its namespace
	* @param {string} namespace - Namespace to match
	* @returns {string[]} Array
	*/
	static Templated(namespace) {
		var templated = [];
		
		for (var id in _templatables) {
			if (id.match(namespace)) templated.push(_templatables[id]);
		}
		
		return templated;
	}
	
	/**
	* Merges an object into another object. 
	* @param {object} a - The object that will receive the properties 
	* @param {object} b - The object to merge into object A
	* @returns {object} The modified Object
	*/
	static Mixin(a, b) {				
		for (var key in b) {
			if (b.hasOwnProperty(key)) a[key] = b[key];
		}

		// TODO : Why did I use arguments[0] instead of a?
		return arguments[0];
	}
	
	/**
	* Debounces a function to improve app performance. The function will be executed 
	* after a timeout unless the function is called again in which case, the timeout resets.
	* @param {function}	delegate - the Function to debounce
	* @param {integer} threshold - the timeout length, in milliseconds
	* @returns {function} The debounced function
	*/
	static Debounce(delegate, threshold) {
		var timeout;
	
		return function debounced (...args) {
			
			function delayed () {
				delegate.apply(this, args);
				
				timeout = null; 
			}
	 
			if (timeout) clearTimeout(timeout);
	 
			timeout = setTimeout(delayed.bind(this), threshold || 100); 
		};
	}
	
	/**
	* Formats a String using substitute strings.
	* @param {string} str - The string to format
	* @param {string[]} subs - An array of Strings to substitute into str
	* @returns {string} The formatted string
	*/
	static Format(str, subs) {
		if (!subs || subs.length == 0) return str;
		
		var s = str;

		for (var i = 0; i < subs.length; i++) {
			var reg = new RegExp("\\{" + i + "\\}", "gm");
			s = s.replace(reg, subs[i]);
		}

		return s;
	}
	
	static LocalizeNumber(value, locale) {
        if (value == null) return null;
		
		var loc = (locale || Core.locale) == "en" ? "en-CA" : "fr-CA";

		return new Number(value).toLocaleString(loc);
	}
	
	/**
	* Disables or enables all focusable elements in an array of nodes
	* @param {string[]} nodes - Array of DOM elements, where focusable elements will be disabled or enabled
	* @param {boolean} disabled - True to disable, False to enable
	* @returns {void}
	*/
	static DisableFocusable(nodes, disabled) {
		var focusable = ["button", "fieldset", "input", "optgroup", "option", "select", "textarea"];
		
		nodes.forEach(n => {
			var selection = n.querySelectorAll(focusable);
			
			if (selection.length == 0) return;
			
			for (var i = 0; i < selection.length; i++) selection[i].disabled = disabled;
		});
	}	
	
	/**
	 * Increments class value _id
	 * @returns {string} New ID as part of a string
	 */
	static NextId() {
		return `auto_${++_id}`;
	}
	
	/**
	 * Convert RGB code to hexidecimal code
	 * @param {string} rgb - RGB code
	 * @returns {string} Hexidecimal code
	 */
	static RgbToHex(rgb) {
		return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
	}
	
	/**
	 * Convert hexidecimal code to RGB code
	 * @param {string} hex - Hexidecimal code
	 * @returns {string} RGB code
	 */	
	static HexToRgb(hex, a) {
		var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		
		var rgb = m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
		
		if (a != undefined) rgb.push(a);
		
		return rgb;
	}
	
	/**
	 * Wait for document to finish loading before resolving the promise
	 * @returns {Promise} 
	 */
	static WaitForDocument() {
		var d = Core.Defer();
		
		if (document.readyState === "complete") d.Resolve();
		
		else window.addEventListener('load', (ev) => d.Resolve());
		
		return d.promise;
	}
}