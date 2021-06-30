/**
 * Dimensions module
 * @module charts/components/dimensions
 */
export default class Dimensions { 

	get height() { return this._height; }

	set height(value) { this._height = value; }
	
	get width() { return this._width; }
	
	set width(value) { this._width = value; }
	
	get margin() { return this._margin; }

	set margin(value) { this._margin = value; }
	
	get innerWidth() { return this._width - this._margin.left - this._margin.right }

	set innerWidth(value) { this._innerWidth = value }
	
	get innerHeight() { return this._height - this._margin.top - this._margin.bottom }

	set innerHeight(value) { this._innerHeight = value }

    constructor(height, width, margins) {
		this._height = height;
		this._width = width;
		
		this._margin = {
			left : margins.left,
			right : margins.right,
			bottom : margins.bottom,
			top : margins.top
		}   
	}
}