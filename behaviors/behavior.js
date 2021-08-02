'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/base/evented.js';

/**
 * Parent class of the other behaviors 
 * @module behaviors/behavior
 * @extends Evented
 */
export default class Behavior extends Evented { 

	/**
	 * Calls constructor of parent class
	 * @param {object} map - Map object (if present)
	 * @param {object} options - Map options 
	 * @returns {void}
	 */	
	constructor(map, options) {	
		super();
	}

	/**
	 * Throws error if called directly
	 * @returns {void}
	 */	
	Deactivate(){
        throw new Error("Deactivate must be implemented by inheriting class.");
	}

	/**
	 * Throws error if called directly
	 * @returns {void}
	 */	
	Activate(){
        throw new Error("Activate must be implemented by inheriting class.");
	}
}