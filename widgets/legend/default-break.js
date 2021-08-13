import Widget from '../../components/base/widget.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Legend break widget module
 * @module widgets/legend/legend-break
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.DefaultBreak", class wDefaultBreak extends Widget {
	
	/**
	 * Get color for default breaks
	 */
	get color() { return this._color; }
	
	set color(value) {
		this._color = value;
		
		this.Elem("color").style.backgroundColor = this.color.toHex();
		this.Elem("color").setAttribute("aria-label", this.Nls("Color_Arialabel", [this.color.toRgb()]));
	}
	
	/**
	 * Get color label for default breaks
	 */
	get lColor() { return this.color && this.color.toRgb() || ""; }
	
	/**
	 * Call constructor of base class and initialize legend breaks
	 * @param {object} container - table breaks container and properties
	 * @returns {void}
	 */	
	constructor(...config) {	
		super(...config);
	}

	Configure(info) {
		this.color = info.symbol.color;
	}

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Unavailable", "en", "Data unavailable");
		nls.Add("Legend_Unavailable", "fr", "Donnée non-disponible");		
        nls.Add("Color_Arialabel", "en", "Colored square ({0}), data unavailable");
        nls.Add("Color_Arialabel", "fr", "Carré de couleur ({0}), donnée non-disponible");
	}
	
	/**
	 * Create HTML for legend breaks
	 * @returns {string} HTML for legend breaks
	 */	
	HTML() {
		return "<div handle='container' class='break-line'>" +
				 "<div class='break-color-container'>" + 
					"<div handle='color' class='break-color' aria-label='color'></div>" +
				 "</div>" + 
				 "<div handle='label'>nls(Legend_Unavailable)</div>" +
			   "</div>";
	}
})