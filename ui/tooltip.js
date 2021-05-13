'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

import Templated from '../components/templated.js';

/**
 * Tooltip module
 * @module ui/tooltip
 * @extends Templated
 */
export default class Tooltip extends Templated  {
	
	/**
	 * Get bounding box
	 */
	get BBox() {
		return this.Elem("root").getBoundingClientRect();
	}
	
	/**
	 * Set HTML content value
	 */
	set content(value) {
		this.Elem('content').innerHTML = value;
	}
	
	/**
	 * Call constructor of base class (Templated) and add required css
	 * @param {string} - CSS to add
	 * @returns {void}
	 */
	constructor(css) {	
		super(document.body);		

		if (css) Dom.AddCss(this.Elem("root"), css);		
	}
	
	/**
	 * Create HTML for tooltip
	 * @returns {string} HTML for tooltip div
	 */			
	Template() {
		return '<div handle="root" class="gexp tooltip">' +
				  '<div handle="content"></div>' +
			   '</div>';
	}
		
	/**
	 * Set new coordinates for tooltip based on offsets and coords of a bounding box
	 * @param {object} target - Target element
	 * @param {number[]} offset - Offset coordinates
	 * @returns {void}
	 */
	PositionTarget(target, offset) {
		offset = offset || [0,0];
		
		bbox1 = target.getBoundingClientRect();
		bbox2 = this.Elem("root").getBoundingClientRect();
		
		var x = bbox1.left +  bbox1.width / 2 - bbox2.width / 2 + offset[0];
		var y = bbox1.top + document.documentElement.scrollTop - bbox2.height - 5  + offset[1];
		
		this.PositionXY(x, y);
	}
	
	/**
	 * Set tooltip position to specified coodinates
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @returns {void}
	 */
	PositionXY(x, y) {
		this.Elem("root").style.left = x + "px";
		this.Elem("root").style.top = y + "px";
				
		if (this.BBox.left + this.BBox.width > window.innerWidth) {
			this.Elem("root").style.top = y + 30 + "px";
			this.Elem("root").style.left = -180 + x + "px";
		}
	}
	
	/**
	 * Set tooltip position and show the tip
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @returns {void}
	 */
	Show(x, y) {
		this.PositionXY(x, y);
		
		this.Elem("root").style.opacity = 1;
	}
	
	/**
	 * Hide tooltip
	 * @returns {void}
	 */
	Hide() {
		this.Elem("root").style.opacity = 0;
	}
	
	/** 
	 * Empty tooltip 
	 * @returns {void}
	 */
	Empty() {
		Dom.Empty(this.Elem("content"));
	}
}