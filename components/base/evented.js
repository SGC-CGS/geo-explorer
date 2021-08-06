'use strict';

import Core from '../../tools/core.js';

/**
 * Evented module
 * @module components/evented
 */
export default class Evented { 

	constructor() {
		this._listeners = {};
	}

	/**
	 * @description
	 * Add an event listener to the list of event listeners.
	 * @param {*} type - event type to be listened for
	 * @param {*} callback - a callback function that listens for an event
	 * @param {Boolean} once - true or false
	 * @returns {Object}
	 */
	addEventListener(type, callback, once){
		if (!(type in this._listeners)) this._listeners[type] = [];
		
		var h = { target:this, type:type, callback:callback, once:!!once };
		
		this._listeners[type].push(h);
		
		return h;
	}
	
	/**
	 * @description
	 * Remove an event listener from the list of event listeners.
	 * @param {*} type - name of the event
	 * @param {*} callback - a callback function that listens for an event
	 * @returns itself
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
	 * @description
	 * Invoke an event listener.
	 * @param {*} event - event occurring in the DOM
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
	 * @description
	 * Pass arguments to an event listener and call a function
	 * that invokes the event listener.
	 * @param {*} type - name of the event
	 * @param {*} data 
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
	 * @description
	 * Add a full event listener
	 * @param {*} type - event type to be listened for
	 * @param {*} callback - a callback function that listens for an event
	 * @returns {Object}
	 */
	On(type, callback) {
		return this.addEventListener(type, callback, false);
	}

	/**
	 * @description
	 * Add a one time event listener
	 * @param {*} type - event type to be listened for
	 * @param {*} callback - a callback function that listens for an event
	 * @returns {Object}
	 */
	Once(type, callback) {
		return this.addEventListener(type, callback, true);
	}

	/**
	 * @description
	 * Remove an event listener
	 * @param {*} type - name of the event
	 * @param {*} callback - a callback function that listens for an event
	 */
	Off(type, callback) {
		this.removeEventListener(type, callback);
	}
}