import Overlay from './overlay.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';
import Picker from '../ui/picker.js';
import LegendBreak from './legend-break.js';

export default Core.Templatable("App.Widgets.Legend", class Legend extends Overlay {
	
	constructor(container, options) {	
		super(container, options);
		
		this.metadata = null;
		this.breaks = null;
		
		this.Elem('sMethod').Add(Core.Nls("Legend_Method_Equal"), null, { id:1, algo:"esriClassifyEqualInterval" });
		this.Elem('sMethod').Add(Core.Nls("Legend_Method_Natural"), null, { id:2, algo:"esriClassifyNaturalBreaks" });
		this.Elem('sMethod').Add(Core.Nls("Legend_Method_Quantile"), null, { id:3, algo:"esriClassifyQuantile" });
	
		this.Node('bColorS').On("Finished", this.OnPicker_Finished.bind(this));
		this.Node('bColorE').On("Finished", this.OnPicker_Finished.bind(this));
		
		var handler = function(ev) { this.onIBreaks_Change(ev); }.bind(this);
		
		this.Node('iBreaks').On("change", Core.Debounce(handler, 350));
		this.Node('sMethod').On("Change", this.onMethod_Change.bind(this));
		
		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));
	}
	
	Update(metadata, sublayer) {
		this.metadata = metadata.Clone();
		
		var n = sublayer.renderer.classBreakInfos.length;
		
		var idx = this.Elem('sMethod').FindIndex(i => i.algo === metadata.breaks.algo);
		
		this.Elem("sMethod").value = idx;
		this.Elem("iBreaks").value = n;
		
		this.Elem("bColorS").color = sublayer.renderer.classBreakInfos[0].symbol.color;
		this.Elem("bColorE").color = sublayer.renderer.classBreakInfos[n - 1].symbol.color;
		
		this.LoadClassBreaks(sublayer.renderer.classBreakInfos);
	}
	
	LoadClassBreaks(classBreakInfos) {
		Dom.Empty(this.Elem("breaks"));
		
		this.breaks = classBreakInfos.map((c, i) => {
			var brk = new LegendBreak(this.Elem('breaks'), c);
			
			brk.On("apply", this.OnBreak_Apply.bind(this, i));
			
			return brk;
		});
	}
	
	OnBreak_Apply(i, ev) {		
		var curr = this.breaks[i];
		var next = this.breaks[i + 1];
		
		if (next && ev.value > next.Max) alert(Core.Nls("Legend_Max_Gt_Next"));
		
		else if (ev.value < curr.Min) alert(Core.Nls("Legend_Max_Lt_Min"));
		
		else {
			ev.target.Save();
			ev.target.StopEdit();
			
			next.Min = curr.Max;
		}
	}
		
	OnPicker_Finished(ev) {
		this.metadata.colors.start = this.Elem("bColorS").EsriColor;
		this.metadata.colors.end = this.Elem("bColorE").EsriColor;
		
		this.Refresh(this.metadata);
	}
	
	onIBreaks_Change(ev) {
		this.metadata.breaks.n = ev.target.value;
		
		this.Refresh(this.metadata);
	}
	
	onMethod_Change(ev) {
		this.metadata.breaks.algo = ev.target.selected.algo;
		
		this.Refresh(this.metadata);
	}
	
	OnApply_Click(ev) {
		var breaks = this.breaks.map(b => {
			return { color : b.Color, min : b.Min, max : b.Max }
		});
	
		this.Emit("Change", { breaks:breaks });
	}
	
	OnClose_Click(ev) {
		this.Hide();
	}
	
	OnRequests_Error (error) {
		this.Emit("Error", { error:error });
	}
	
	Refresh() {
		Requests.Renderer(this.metadata).then(sublayer => {			
			this.LoadClassBreaks(sublayer.renderer.classBreakInfos);
		}, error => this.OnRequests_Error(error));	
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