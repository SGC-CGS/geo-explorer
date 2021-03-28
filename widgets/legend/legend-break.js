import TemplatedTable from '../../components/templated-table.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

export default Core.Templatable("App.Widgets.LegendBreak", class LegendBreak extends TemplatedTable {
	
	get Min() {
		return this.min;
	}
	
	set Min(value) {
		this.min = value;
		
		this.Elem("lFrom").innerHTML = this.min.toLocaleString(Core.locale);
	}
	
	get Max() {
		return this.max;
	}
	
	set Max(value) {
		this.max = value;
		
		this.Elem("lTo").innerHTML = this.max.toLocaleString(Core.locale);
	}
	
	get Color() {
		return this.color;
	}

	static Nls() {
		return {
			"Legend_Item_Join" : {
				"en" : " to ",
				"fr" : " jusqu'à "
			}
		}
	}
	
	constructor(container, info) {	
		super(container, info);
		
		this.Min = info.minValue;
		this.Max = info.maxValue;
		
		this.color = info.symbol.color;
		
		this.Elem("color").style.backgroundColor = this.color.toHex();
	}
	
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