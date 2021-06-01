import TemplatedTable from '../../components/templated-table.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Styler break widget module
 * @module widgets/styler/styler-break
 * @extends TemplatedTable
 */
export default Core.Templatable("App.Widgets.StylerBreak", class StylerBreak extends TemplatedTable {

	/**
	 * Get/set min value for breaks
	 */
	get Min() {
		return this.min;
	}

	set Min(value) {
		this.min = value;

		this.Elem("lFrom").innerHTML = this.min.toLocaleString(Core.locale);
	}

	/**
	 * Get/set max value for breaks
	 */
	get Max() {
		return this.max;
	}

	set Max(value) {
		this.max = value;

		this.Elem("bTo").innerHTML = this.max.toLocaleString(Core.locale);

		this.Elem("eInput").value = this.max;
	}

	/**
	 * Get color for breaks
	 */	
	get Color() {
		return this.color;
	}

	/**
	 * Return text for breaks in both languages
	 * @returns {object.<string, string>} Break text for each language
	 */	
	static Nls(nls) {
		nls.Add("Styler_Item_Join", "en", " to ");
		nls.Add("Styler_Item_Join", "fr", " jusqu'à ");	
	}

	/**
	 * Call constructor of base class (TemplatedTable) and initialize breaks
	 * @param {object} container - breaks container and properties
	 * @param {object} options - additional info on breaks (min, max, colors)
	 * @returns {void}
	 */	
	constructor(container, info) {
		super(container, info);

		this.Min = info.minValue;
		this.Max = info.maxValue;

		this.color = info.symbol.color;

		this.Elem("color").style.backgroundColor = this.color.toHex();

		this.Elem("bTo").addEventListener("click", this.OnEditor_Button.bind(this));
		this.Elem("eApply").addEventListener("click", this.OnEditor_Apply.bind(this));
		this.Elem("eCancel").addEventListener("click", this.OnEditor_Cancel.bind(this));
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
	Template() {
		return "<ul handle='container' class='break-line row'>" +
				 "<li class='break-color-container color'>" +
					"<div handle='color' class='break-color'></div>" +
				 "</li>" +
				 "<li class='column' handle='lFrom'></li>" +
				 "<li class='column'>nls(Styler_Item_Join)</li>" +
				 "<li handle='eContainer' class='break-to-container column'>" +
					"<button handle='bTo' class='to'></button>" +	
					"<div class='editor'>" +
						"<input handle='eInput' class='editor-input' type='number'>" +
						"<button handle='eApply' class='apply button-icon small-icon'></button>" +
						"<button handle='eCancel' class='cancel button-icon small-icon'></button>" +
					"</div>" +
				 "</li>" +
			   "</ul>";
	}
})
