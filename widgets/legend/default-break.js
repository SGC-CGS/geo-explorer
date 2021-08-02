import Widget from '../../components/base/widget.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Legend break widget module
 * @module widgets/legend/legend-break
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.DefaultBreak", class DefaultBreak extends Widget {
	
	/**
	 * Get color for default breaks
	 */
	get color() {
		return this._color;
	}
	
	/**
	 * Set label for default breaks
	 */
	set label(value) {
		this.Elem("label").innerHTML = value;
	}

	/**
	 * Call constructor of base class and initialize legend breaks
	 * @param {object} container - table breaks container and properties
	 * @returns {void}
	 */	
	constructor(container, info) {	
		super(container, info);
		
		this._color = info.symbol.color;
		
		this.Elem("color").style.backgroundColor = this.color.toHex();
	}

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Unavailable", "en", "Data unavailable");
		nls.Add("Legend_Unavailable", "fr", "Donnée non-disponible");		
	}
	
	/**
	 * Create HTML for legend breaks
	 * @returns {string} HTML for legend breaks
	 */	
	HTML() {
		return "<div handle='container' class='break-line'>" +
				 "<div class='break-color-container'>" + 
					"<div handle='color' class='break-color'></div>" +
				 "</div>" + 
				 "<div handle='label'>nls(Legend_Unavailable)</div>" +
			   "</div>";
	}
})