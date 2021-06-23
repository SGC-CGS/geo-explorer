import DefaultBreak from './default-break.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Legend break widget module
 * @module widgets/legend/legend-break
 * @extends TemplatedTable
 */
export default Core.Templatable("App.Widgets.LegendBreak", class LegendBreak extends DefaultBreak {
	
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
	 * Return text for legend breaks in both languages
	 * @returns {object.<string, string>} Legend break text for each language
	 */	
	static Nls(nls) {
		nls.Add("Legend_Unavailable", "en", "unavailable");
		nls.Add("Legend_Unavailable", "fr", "non-disponible");	
		nls.Add("Legend_Item", "en", "{0} to {1}");
		nls.Add("Legend_Item", "fr", "{0} jusqu'à {1}");	
		nls.Add("No_Data", "en", "Value Not Available");	
		nls.Add("No_Data", "fr", "Valeur Non-Disponible");
	}
	
	/**
	 * Call constructor of base class (TemplatedTable) and initialize legend breaks
	 * @param {object} container - table breaks container and properties
	 * @param {object} options - additional info on breaks (min, max, colors)
	 * @returns {void}
	 */	
	constructor(container, info) {	
		super(container, info);
		
		if(info.minValue != null && info.maxValue != null) {

			this.min = info.minValue;
			this.max = info.maxValue;
		
			var lMin = Core.LocalizeNumber(this.min);
			var lMax = Core.LocalizeNumber(this.max);
		
			this.label = this.Nls("Legend_Item", [lMin, lMax]);

		} else {

			this.label = this.Nls("No_Data");

		}

	}
})