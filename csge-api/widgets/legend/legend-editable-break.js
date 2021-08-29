import Widget from '../../../csge-api/components/base/widget.js';
import Core from '../../../csge-api/tools/core.js';
import Dom from '../../../csge-api/tools/dom.js';
import LegendBreak from './legend-break.js'

/**
 * Styler break widget module
 * @module widgets/styler/styler-break
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.StylerBreak", class wLegendEditableBreak extends LegendBreak {

	/**
	 * Get/set min value for breaks
	 */
	get min() { return this._min; }
	
	set min(value) {
		this._min = value;

		this.Elem("lFrom").innerHTML = this.min.toLocaleString(Core.locale);
        this.Elem("color").setAttribute("aria-label", this.Nls("Color_Arialabel", [this.lColor, this.lMin, this.lMax, this.uom]));
	}
	
	/**
	 * Get/set max value for breaks
	 */
	get max() { return this._max; }
	
	set max(value) {
		this._max = value;

		this.Elem("bTo").innerHTML = this.max.toLocaleString(Core.locale);
		this.Elem("eInput").value = this.max;
        this.Elem("color").setAttribute("aria-label", this.Nls("Color_Arialabel", [this.lColor, this.lMin, this.lMax, this.uom]));
	}

	/**
	 * Call constructor of base class (TemplatedTable) and initialize breaks
	 * @param {object} container - breaks container and properties
	 * @returns {void}
	 */	
	constructor(...config) {
		super(...config);

		this.Elem("bTo").addEventListener("click", this.OnEditor_Button.bind(this));
		this.Elem("eApply").addEventListener("click", this.OnEditor_Apply.bind(this));
		this.Elem("eCancel").addEventListener("click", this.OnEditor_Cancel.bind(this));
	}

	Configure(bucket, color) {
		super.Configure(bucket, color);
	}

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		super.Localize(nls);
		
		nls.Add("Styler_Item_Join", "en", "to");
		nls.Add("Styler_Item_Join", "fr", "jusqu'à");	
	}

	/**
	 * Cancel edits to class break value and reset to max
	 * @returns {void}
	 */
	Cancel() {
		this.Elem("eInput").value = this.max;
	}

	/**
	 * Save the updated class break value 
	 * @returns {void}
	 */
	Save() {
		this.max = +this.Elem("eInput").value;

		this.Elem("bTo").innerHTML = this.max.toLocaleString(Core.locale);
	}

	/**
	 * Change css to show element is in edit mode
	 * @returns {void}
	 */
	Edit() {
		Dom.AddCss(this.Elem('eContainer'), "editing");
	}

	/**
	 * Change css to show element is in no longer in edit mode
	 * @returns {void}
	 */
	StopEdit() {
		Dom.RemoveCss(this.Elem('eContainer'), "editing");
	}

	/**
	 * Change to editable text box when user clicks on break value
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnEditor_Button(ev) {
		this.Edit();
	}

	/**
	 * Update value of the class break when check button is pressed
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnEditor_Apply(ev) {
		var tentative = +this.Elem("eInput").value;

		this.Emit("apply", { value:tentative });
	}

	/**
	 * Cancel edit of class break value when x button is pressed
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnEditor_Cancel(ev) {
		this.Cancel();

		this.StopEdit();
	}

	/**
	 * Create HTML for breaks
	 * @returns {string} HTML for breaks
	 */		
	HTML() {
		return "<div handle='container' class='break-line'>" +
				 "<div handle='visible-icon' class='eyes'>" + 
					"<input type='checkbox' handle='checkbox' checked>" + 
				"</div>" +
				 "<div class='break-color-container'>" +
					"<div handle='color' class='break-color'></div>" +
				 "</div>" +
				 "<div class='' handle='lFrom'></div>" +
				 "<div class=''>nls(Styler_Item_Join)</div>" +
				 "<div handle='eContainer' class='break-to-container'>" +
					"<button handle='bTo' class='to'></button>" +	
					"<div class='editor'>" +
						"<input handle='eInput' class='editor-input' type='number'>" +
						"<button handle='eApply' class='apply button-icon small-icon'></button>" +
						"<button handle='eCancel' class='cancel button-icon small-icon'></button>" +
					"</div>" +
				 "</div>" +
			   "</div>";
	}
})
