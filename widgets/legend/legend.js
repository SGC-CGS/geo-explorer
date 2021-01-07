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
		
		// FIX: Since this part of the legend is static, we should do all of this through the 
		// template at the bottom then hook events onto already built DOM elements. 
		// Hard-coded strings should not be used, breaks translation.
		this.AddLabelName({label: " Show Label Name"});
	}
	
	Update(context) {	
		this.context = context;
		
		this.LoadIndicators(context.IndicatorItems());
		this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);
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

	AddLabelName(item) {
		var div = Dom.Create("li", { className:"labelName" }, this.Elem("labelName"));
		var chk = Dom.Create("input", { id:Core.NextId(), className:"labelName-checkbox", type:"checkbox" }, div);
		var lbl = Dom.Create("label", { htmlFor:chk.id, className:"labelName-label", innerHTML:item.label }, div);
		
		chk.addEventListener("change", ev => {
			this.Emit("LabelVisibility", {checked: chk.checked});
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
					"<ul handle='labelName' class='label-name-container'>" +
				  "</div>";
	}
})