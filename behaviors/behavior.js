'use strict';

import Core from '../tools/core.js';
import Requests from '../tools/requests.js';
import Evented from '../components/evented.js';

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