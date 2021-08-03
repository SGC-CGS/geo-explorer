import DefaultBreak from './default-break.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Legend break widget module
 * @module widgets/legend/legend-break
 * @extends TemplatedTable
 */
export default Core.Templatable("Api.Widgets.LegendBreak", class LegendBreak extends DefaultBreak {
	
	/**
	 * Get/set uom value for breaks
	 */
	get uom() { return this._uom || ""; }
	
	set uom(value) {
		this._uom = value;
		
        this.Elem("color").setAttribute("aria-label", this.Nls("Color_Arialabel", [this.lColor, this.lMin, this.lMax, this.uom]));
	}
	
	/**
	 * Get/set min value for breaks
	 */
	get min() { return this._min; }
	
	set min(value) {
		this._min = value;
		
		this.Elem("label").innerHTML = this.Nls("Legend_Item", [this.lMin, this.lMax]);
        this.Elem("color").setAttribute("aria-label", this.Nls("Color_Arialabel", [this.lColor, this.lMin, this.lMax, this.uom]));
	}
	
	/**
	 * Get/set min value label for breaks
	 */
	get lMin() { return Core.LocalizeNumber(this.min) || ""; }
	
	/**
	 * Get/set max value for breaks
	 */
	get max() { return this._max; }
	
	set max(value) {
		this._max = value;
		
		this.Elem("label").innerHTML = this.Nls("Legend_Item", [this.lMin, this.lMax]);
        this.Elem("color").setAttribute("aria-label", this.Nls("Color_Arialabel", [this.lColor, this.lMin, this.lMax, this.uom]));
	}
	
	/**
	 * Get/set max value label for breaks
	 */
	get lMax() { return Core.LocalizeNumber(this.max) || ""; }
	
	/**
	 * Get/set color for default breaks
	 */
	get color() { return this._color; }
	
	set color(value) {
		this._color = value;
		
		this.Elem("color").style.backgroundColor = value.toHex();
        this.Elem("color").setAttribute("aria-label", this.Nls("Color_Arialabel", [this.lColor, this.lMin, this.lMax, this.uom]));
	}

	/**
	 * Call constructor of base class and initialize legend breaks
	 * @param {object} container - table breaks container and properties
	 * @returns {void}
	 */	
	constructor(container, info, uom) {	
		super(container, info);
		
		this.min = info.minValue;
		this.max = info.maxValue;
		this.uom = uom;
    }

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Item", "en", "{0} to {1}");
		nls.Add("Legend_Item", "fr", "{0} jusqu'à {1}");	
        nls.Add("Color_Arialabel", "en", "Colored square ({0}), {1} to {2} {3}");
        nls.Add("Color_Arialabel", "fr", "Carré de couleur ({0}), {1} jusqu'à {2} {3}");
	}
})