  
import TemplatedTable from '../../components/templated-table.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Legend break widget module
 * @module widgets/legend/legend-break
 * @extends TemplatedTable
 */
export default Core.Templatable("App.Widgets.DefaultBreak", class DefaultBreak extends TemplatedTable {
	
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
	 * Return text for default breaks in both languages
	 * @returns {object.<string, string>} Legend break text for each language
	 */	
	static Nls(nls) {
		nls.Add("Legend_Unavailable", "en", "Data unavailable");
		nls.Add("Legend_Unavailable", "fr", "Donnée non-disponible");		
	}

	/**
	 * Call constructor of base class (TemplatedTable) and initialize legend breaks
	 * @param {object} container - table breaks container and properties
	 * @param {object} options - additional info on breaks (min, max, colors)
	 * @returns {void}
	 */	
	constructor(container, info) {	
		super(container, info);
		
		this._color = info.symbol.color;
		
		this.Elem("color").style.backgroundColor = Core.RgbToHex(this.color) //this.color.toHex();
	}
	
	/**
	 * Create HTML for legend breaks
	 * @returns {string} HTML for legend breaks
	 */	
	Template() {
		return "<tr handle='container' class='break-line'>" +
				 "<td class='break-color-container'>" + 
					"<div handle='color' class='break-color'></div>" +
				 "</td>" + 
				 "<td handle='label'>nls(Legend_Unavailable)</td>" +
			   "</tr>";
	}
})