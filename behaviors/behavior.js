'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';

/**
 * Behavior module
 * @module behaviors/behavior
 * @extends Evented
 * @description Parent class of the other behaviors seen in the
 * behaviors folder
 */
export default class Behavior extends Evented { 

	constructor(map, options) {	
		super();
	}

	Deactivate(){
        throw new Error("Deactivate must be implemented by inheriting class.");
	}

	Activate(){
        throw new Error("Activate must be implemented by inheriting class.");
	}
}