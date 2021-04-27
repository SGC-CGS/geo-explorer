'use strict';

import Core from '../tools/core.js';

/**
 * Event handling
 * @module components/evented
  */
export default class Evented { 

	/**
	 * Initialize class by setting up listeners object
	 * @returns {void}
	 */
	constructor() {
		this._listeners = {};
	}

	/**
	 * Add an event listener to the list of event listeners.
	 * @param {string} type - Event type to be listened for
	 * @param {function} callback - Callback function that listens for an event
	 * @param {boolean} once - Indicates whether event listener will be used once or many timesb
	 * @returns {Object} Event listener object (target, type, once, callback)
	 */
	addEventListener(type, callback, once){
		if (!(type in this._listeners)) this._listeners[type] = [];
		
		var h = { target:this, type:type, callback:callback, once:!!once };
		
		this._listeners[type].push(h);
		
		return h;
	}
	
	/**
	 * Remove an event listener from the list of event listeners.
	 * @param {string} type - Name of the event
	 * @param {function} callback - Callback function that listens for an event
	 * @returns {void}
	 */
	removeEventListener(type, callback){
		if (!(type in this._listeners)) return;
	  
		var stack = this._listeners[type];
		  
		for (var i = 0, l = stack.length; i < l; i++){
			if (stack[i].callback === callback){
				stack.splice(i, 1);
				
				return this.removeEventListener(type, callback);
			}
		}
	}
	
	/**
	 * Invoke an event listener.
	 * @param {Object} event - Event occurring in the DOM (bubbles, cancelable, type, target)
	 * @returns {void}
	 */
	dispatchEvent(event){
		if (!(event.type in this._listeners)) return;

		var stack = this._listeners[event.type];

		for (var i = 0; i < stack.length; i++) {
			stack[i].callback.call(this, event);
		}
		
		for (var i = stack.length - 1; i >= 0; i--) {
			if (!!stack[i].once) this.removeEventListener(event.type, stack[i].callback);
		}
	}
	
	/**
	 * Emit event from object and make a call to dispatchEvent function
	 * @param {string} type - Name of the event
	 * @param {object} data - Object to which event is applied   
	 * @returns {void}
	 */
	Emit(type, data) {
		// Let base event properties be overwritten by whatever was provided.	
		var event = { bubbles:true, cancelable:true };
	
		Core.Mixin(event, data);
		
		// Use the type that was specifically provided, target is always this.
		event.type = type;
		event.target = this;
		
		this.dispatchEvent(event);
	}
	
	/**
	 * Add a full event listener
	 * @param {string} type - Event type to be listened for (ex. Change)
	 * @param {function} callback - Callback function that listens for an event
	 * @returns {Object} Event listener from addEventListener
	 */
	On(type, callback) {
		return this.addEventListener(type, callback, false);
	}

	/**
	 * Add a one time event listener
	 * @param {string} type - Event type to be listened for
	 * @param {function} callback - Callback function that listens for an event
	 * @returns {Object} Event listener from addEventListener
	 */
	Once(type, callback) {
		return this.addEventListener(type, callback, true);
	}

	/**
	 * Remove an event listener
	 * @param {string} type - Name of the event
	 * @param {function} callback - Callback function that listens for an event
	 * @returns {void}
	 */
	Off(type, callback) {
		this.removeEventListener(type, callback);
	}
}