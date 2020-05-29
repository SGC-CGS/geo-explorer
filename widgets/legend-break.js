import TemplatedTable from '../components/templatedTable.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

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
		
		this.Elem("bTo").innerHTML = this.max.toLocaleString(Core.locale);
		
		this.Elem("eInput").value = this.max;
	}
	
	get Color() {
		return this.color;
	}
	
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
	
	Cancel() {
		this.Elem("eInput").value = this.max;
	}
	
	Save() {
		this.max = +this.Elem("eInput").value;
		
		this.Elem("bTo").innerHTML = this.max.toLocaleString(Core.locale);
	}
	
	Edit() {
		Dom.AddCss(this.Elem('eContainer'), "editing");
	}
	
	StopEdit() {
		Dom.RemoveCss(this.Elem('eContainer'), "editing");
	}
	
	OnEditor_Button(ev) {		
		this.Edit();
	}
	
	OnEditor_Apply(ev) {
		// var value = +this.Elem("eInput").value;
		
		// this.Elem("bTo").innerHTML = this.max.toLocaleString(Core.locale);
		
		// this.StopEdit();
	
		var tentative = +this.Elem("eInput").value;
		
		this.Emit("apply", { value:tentative });
	}
	
	OnEditor_Cancel(ev) {	
		this.Cancel();
	
		this.StopEdit();
	}
	
	Template() {
		return "<tr handle='container' class='break-line'>" +
				 "<td class='break-color-container'>" + 
					"<div handle='color' class='break-color'></div>" +
				 "</td>" + 
				 "<td handle='lFrom'></td>" + 
				 "<td>nls(Legend_Item_Join)</td>" + 
				 "<td handle='eContainer' class='break-to-container'>" + 
					"<button handle='bTo' class='to'></button>" +
					"<div class='editor'>" +
						"<input handle='eInput' class='editor-input' type='number'>" +
						"<button handle='eApply' class='apply button-icon small-icon'></button>" +
						"<button handle='eCancel' class='cancel button-icon small-icon'></button>" +
					"</div>" +
				 "</td>" + 
			   "</tr>";
	}
})