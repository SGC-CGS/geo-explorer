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
	 * Get/set min value for breaks
	 */
	get min() {
		return this._min;
	}
	
	set min(value) {
		this._min = value;
	}
	
	/**
	 * Get/set max value for breaks
	 */
	get max() {
		return this._max;
	}
	
	set max(value) {
		this._max = value;
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
		
		this.lMin = Core.LocalizeNumber(this.min);
        this.lMax = Core.LocalizeNumber(this.max);
		
        this.label = this.Nls("Legend_Item", [this.lMin, this.lMax]);   

		if (!uom) return;

        this.Elem("color").attributes["aria-label"].value = this.Nls("Color_Arialabel", [this.color.toRgb(), this.lMin, this.lMax, uom]);
    }

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Unavailable", "en", "unavailable");
		nls.Add("Legend_Unavailable", "fr", "non-disponible");	
		nls.Add("Legend_Item", "en", "{0} to {1}");
		nls.Add("Legend_Item", "fr", "{0} jusqu'à {1}");	
        nls.Add("Color_Arialabel", "en", "Colored square ({0}), {1} to {2} {3}");
        nls.Add("Color_Arialabel", "fr", "Carré de couleur ({0}), {1} jusqu'à {2} {3}");
	}
})