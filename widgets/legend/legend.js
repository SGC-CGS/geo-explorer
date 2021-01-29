import Overlay from '../overlay.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

import LegendBreak from './legend-break.js';

export default Core.Templatable("App.Widgets.Legend", class Legend extends Overlay {
	
	set Opacity(value) {
		this.Elem('sOpacity').value = value * 100;
	}
	
	get Opacity() {
		return this.Elem('sOpacity').value / 100;
	}
	
	constructor(container, options) {	
		super(container, options);
		
		this.Node('sOpacity').On("change", this.OnOpacity_Changed.bind(this));

		this.Node('labelChk').On("click", ev => {
			this.Emit("LabelName", { checked: this.Elem('labelChk').checked });
		})
	}
	
	Update(context) {	
		this.context = context;
		
		this.LoadIndicators(context.IndicatorItems());
		this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);

		this.Elem("labelChk").checked = false;
		this.Elem("labelChk").removeAttribute("checked");
		
	}
	
	LoadIndicators(indicators) {
		Dom.Empty(this.Elem("indicators"));
		
		indicators.forEach((i) => {
			Dom.Create("li", { innerHTML:i.label }, this.Elem("indicators"));			
		});
	}
	
	LoadClassBreaks(classBreakInfos) {
		Dom.Empty(this.Elem("breaks"));
		
		this.breaks = classBreakInfos.map((c, i) => {
			return new LegendBreak(this.Elem('breaks'), c);
		});
	}
	
	AddContextLayer(label, data, checked) {
		var div = Dom.Create("li", { className:"context-layer" }, this.Elem("cLayers"));
		var chk = Dom.Create("input", { id:Core.NextId(), className:"context-layer-check", type:"checkbox", checked: checked}, div);
		var lbl = Dom.Create("label", { htmlFor:chk.id, className:"context-layer-label", innerHTML:label }, div);

		chk.addEventListener("change", ev => {
			this.Emit("LayerVisibility", {data: data, checked:chk.checked});
		});
	}

	OnOpacity_Changed(ev) {
		this.Emit("Opacity", { opacity:this.Opacity });
	}
	
	Template() {
		return	  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'>nls(Legend_Title)</h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
				  "<div class='overlay-body' handle='body'>" + 
				    "<label>nls(Legend_Indicators)</label>" +
				    "<ul handle='indicators'></ul>" +
				    "<label>nls(Legend_Title)</label>" +
					"<table handle='breaks' class='breaks-container'>" + 
						// Class breaks go here, dynamically created
					"</table>" +
				    "<label>nls(Legend_Opacity)</label>" +
					"<div class='opacity-container'>" +
					   "<input handle='sOpacity' type='range' class='opacity' min=0 max=100 />" + 
					   "<div class='opacity-labels-container'>" +
						  "<label>nls(Legend_Opacity_Less)</label>" +
						  "<label>nls(Legend_Opacity_More)</label>" +
					   "</div>" +
					"</div>" +
				    "<label>nls(Legend_Context_Layers)</label>" +
					"<ul handle='cLayers' class='context-layers-container'>" + 
					"</div>" +
					"<label>nls(Legend_Label_Name)</label>" +
					"<ul class='label-name-container'>" +
						"<li class='labelName'>" +
							"<input handle='labelChk' type=checkbox class='labelName-checkbox'>" + 
							"<label class='labelName-label'>nls(Legend_Show_label)</label>" + 
						"</li>" +
					"</ul>" +
				  "</div>";
	}
})
