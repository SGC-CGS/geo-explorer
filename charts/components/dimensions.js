
export default class Dimensions { 

	get height() { return this._height; }
	
	get width() { return this._width; }
	
	get margins() { return this._margins; }
	
	get innerWidth() { return width - margin.left - margin.right }
	
	get innerHeight() { return height - margin.top - margin.bottom }

    constructor(height, width, margins) {
		this._height = height;
		this._width = width;
		
		this._margins = {
			left : margins.left,
			right : margins.right,
			bottom : margins.bottom,
			top : margins.top
		}   
	}
}