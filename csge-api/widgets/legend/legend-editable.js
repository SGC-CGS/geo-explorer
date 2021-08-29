import Widget from '../../components/base/widget.js';
import Core from '../../tools/core.js';
import Legend from './legend.js';
import LegendEditableBreak from './legend-editable-break.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.LegendEditable", class wLegendEditable extends Legend {

	get breaks() { return this._breaks; }
	
	set breaks(value) { this._breaks = value; }

	/**
	 * Call constructor of base class (Templated) and initialize styler widget
	 * @param {object} container - div styler container and properties
	 * @returns {void}
	 */	
	constructor(...config) {
		super(...config);

		this.breaks = null;
	}

	Localize(nls) {
		super.Localize(nls);
		
		nls.Add("Styler_Max_Lt_Min", "en", "New maximum value is less than the current minimum value for the layer. Input a higher value.");
		nls.Add("Styler_Max_Lt_Min", "fr", "La nouvelle valeur maximale est inférieure à la valeur minimale actuelle pour la couche. Saisir une valeur plus élevée.");
		nls.Add("Styler_Max_Gt_Next", "en", "New maximum value exceeds the next range's maximum value. Input a lower value or increase the next range first.");
		nls.Add("Styler_Max_Gt_Next", "fr", "La nouvelle valeur maximale dépasse la valeur maximale de la plage suivante. Saisir une valeur inférieure ou augmenter d’abord la plage suivante.");
	}

	/**
	 * Load class method, breaks, and colours to styler widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(renderer) {
		super.Update(renderer);
		
		this.breaks.forEach((brk, i) => brk.On("apply", this.OnBreak_Apply.bind(this, i)));
	}
	
	MakeClassBreak(c, uom) {
		return new LegendEditableBreak(c, uom);
	}

	/**
	 * Apply new break value when checkmark next to break is clicked
	 * @param {number} i - Index number of break value to change
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnBreak_Apply(i, ev) {
		var curr = this.breaks[i];
		var next = this.breaks[i + 1];

		if (next && ev.value > next.max) alert(this.Nls("Styler_Max_Gt_Next"));

		else if (ev.value < curr.min) alert(this.Nls("Styler_Max_Lt_Min"));

		else {
			ev.target.Save();
			ev.target.StopEdit();

			next.min = curr.max;
		}
	}
})
