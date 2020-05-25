import Overlay from './overlay.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';
import Picker from '../ui/picker.js';

export default Core.Templatable("App.Widgets.Legend", class Legend extends Overlay {
	
	constructor(container, options) {	
		super(container, options);
		
		this.Elem('sMethod').Add(Core.Nls("Legend_Method_Equal"), null, { id:1, algo:"esriClassifyEqualInterval" });
		this.Elem('sMethod').Add(Core.Nls("Legend_Method_Natural"), null, { id:2, algo:"esriClassifyNaturalBreaks" });
		this.Elem('sMethod').Add(Core.Nls("Legend_Method_Quantile"), null, { id:3, algo:"esriClassifyQuantile" });
	
		this.Node('bColorS').On("Finished", this.OnPicker_Finished.bind(this));
		this.Node('bColorE').On("Finished", this.OnPicker_Finished.bind(this));
	}
	
	Update(method, renderer) {	
		var n = renderer.classBreakInfos.length;
		
		var idx = this.Elem('sMethod').FindIndex(i => i.algo === method);
		
		this.Elem("sMethod").value = idx;
		this.Elem("iBreaks").value = n;
		
		this.Elem("bColorS").color = renderer.classBreakInfos[0].symbol.color;
		this.Elem("bColorE").color = renderer.classBreakInfos[n - 1].symbol.color;
		
		Dom.Empty(this.Elem("breaks"));
		
		renderer.classBreakInfos.forEach(c => {
			this.AddClassBreak(c);
		})
	}
	
	AddClassBreak(brk) {		
		var color = brk.symbol.color.toHex();
		
		var tr = Dom.Create("tr", { className:"break-line" }, this.Elem('breaks'));
		var td = Dom.Create("td", { className:"break-color-container" }, tr);
		
		Dom.Create("div", { className:"break-color", style:`background-color:${color};` }, td);
		Dom.Create("td", { className:"from", innerHTML:brk.minValue.toLocaleString(Core.locale) }, tr);
		Dom.Create("td", { className:"join", innerHTML:Core.Nls("Legend_Item_Join") }, tr);
		Dom.Create("td", { className:"to", innerHTML:brk.maxValue.toLocaleString(Core.locale) }, tr);
	}
	
	OnPicker_Finished(ev) {
		debugger;
	}
	
	Template() {
		return "<div handle='overlay' class='overlay legend'>" +
				  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'>nls(Legend_Title)</h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
				  "<hr>" +
				  "<div class='overlay-body' handle='body'>" + 
					"<p>nls(Legend_Instructions_1)</p>" +
					"<label>nls(Legend_Method)</label>" +
					"<div handle='sMethod' widget='Basic.Components.Select'></div>" +
					"<label>nls(Legend_Breaks)</label>" +
					"<input handle='iBreaks' type='number' min='1' max='10' />" +
					"<label>nls(Legend_Color_Range)</label>" +
					"<div class='color-range'>" +
						"<label>nls(Legend_Color_Start)</label>" +
						"<div handle='bColorS' class='color start' widget='Basic.Components.Picker'></div>" +
						"<label>nls(Legend_Color_End)</label>" +
						"<div handle='bColorE' class='color end' widget='Basic.Components.Picker'></div>" +
					"</div>" +
					"<label>nls(Legend_Legend)</label>" +
					"<table handle='breaks' class='breaks-container'>" + 
						// Class breaks go here, dynamically created
					"</table>" +
					"<p>nls(Legend_Instructions_3)</p>" +
					"<div class='button-container'>" + 
					   "<button handle='bApply' class='button-label button-apply'>nls(Selector_Button_Apply)</button>" +
					   "<button handle='bClose' class='button-label button-close'>nls(Selector_Button_Close)</button>" +
					"</div>" +
				  "</div>" +
			   "</div>";
	}
})