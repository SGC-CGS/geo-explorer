import TemplatedTable from '../../components/templated-table.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Legend break widget module
 * @module widgets/legend/legend-break
 * @extends TemplatedTable
 */
export default Core.Templatable("App.Widgets.LegendBreak", class LegendBreak extends TemplatedTable {
	
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
		
		this.Elem("lTo").innerHTML = this.max.toLocaleString(Core.locale);
	}
	
	/**
	 * Get color for legend breaks
	 */
	get Color() {
		return this.color;
	}

	/**
	 * Return text for legend breaks in both languages
	 * @returns {object.<string, string>} Legend break text for each language
	 */	
	static Nls(nls) {
		nls.Add("Legend_Item_Join", "en", " to ");
		nls.Add("Legend_Item_Join", "fr", " jusqu'à ");		
	}
	
	/**
	 * Call constructor of base class (TemplatedTable) and initialize legend breaks
	 * @param {object} container - table breaks container and properties
	 * @param {object} options - additional info on breaks (min, max, colors)
	 * @returns {void}
	 */	
	constructor(container, info) {	
		super(container, info);
		
		this.Min = info.minValue;
		this.Max = info.maxValue;
		
		this.color = info.symbol.color;
		
		this.Elem("color").style.backgroundColor = this.color.toHex();
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
				 "<td handle='lFrom'></td>" + 
				 "<td>nls(Legend_Item_Join)</td>" + 
				 "<td handle='lTo'></td>" + 
			   "</tr>";
	}
})