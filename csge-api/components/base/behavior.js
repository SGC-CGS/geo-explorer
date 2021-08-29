'use strict';

import Core from '../../tools/core.js';
import Requests from '../../tools/requests.js';
import Evented from '../base/evented.js';

/**
 * Parent class of the other behaviors 
 * @module behaviors/behavior
 * @extends Evented
 */
export default class Behavior extends Evented { 

	get active() { return this._active; }

	get map() { return this._options.map; }
	set map(value) { this._options.map = value; }

	/**
	 * Calls constructor of parent class
	 * @param {object} map - Map object (if present)
	 * @param {object} options - Map options 
	 * @returns {void}
	 */	
	constructor(map) {	
		super();
		
		this._options = {};
		this._active = false;
		
		this.map = map;
	}

	/**
	 * Throws error if called directly
	 * @returns {void}
	 */	
	Deactivate(){
		this._active = false;
	}

	/**
	 * Throws error if called directly
	 * @returns {void}
	 */	
	Activate(){
		this._active = true;
	}
	
	SetActive(isActive) {
		isActive ? this.Activate() : this.Deactivate();
	}
}