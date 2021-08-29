 'use strict';

import Component from './base/component.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Menu widget module
 * @module widgets/menu
 */
export default class Menu extends Component{ 

	/**
	 * Show the overlay for the currently selected button
	 * @param {object} item - Button and overlay
	 * @returns {void}
	 */
	SetOverlay(item) {
		if (this.current) this.HideOverlay(this.current);
		
		this.current = item;
		
		if (this.current) this.ShowOverlay(this.current);
	}
}