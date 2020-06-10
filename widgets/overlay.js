import Dom from '../tools/dom.js';
import Core from '../tools/core.js';
import Templated from '../components/templated.js';

export default class Overlay extends Templated { 
	
	set Title(value) {
		this.Elem("title").innerHTML = value;
	}
	
	set Widget(widget) {
		this.Empty();
		
		this.widget = widget;
		
		widget.Place(this.Elem("body"));
	}
	
	get Widget() { return this.widget; }
	
	constructor(container) {	
		super(container);
		
		this.SetStyle(0, "hidden");
		
		this.Node("close").On("click", this.onBtnClose_Click.bind(this));
	}
	
	SetStyle(opacity, visibility) {
		this.Elem("overlay").style.opacity = opacity;
		this.Elem("overlay").style.visibility = visibility;
	}
	
	Empty() {
		Dom.Empty(this.Elem("body"));
	}
	
	Show() {		
		this.SetStyle(1, "visible");
		
		this.Emit("Show", { overlay:this });
		
		this.Elem("close").focus();
	}
	
	Hide() {				
		this.SetStyle(0, "hidden");
		
		this.Emit("Hide", { overlay:this });
	}
	
	onBtnClose_Click(ev) {
		this.Hide();
		
		this.Emit("Close", { overlay:this });
	}
	
	Template() {
		return "<div handle='overlay' class='overlay hidden'>" +
				  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'></h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
					
				  "<div class='overlay-body' handle='body'></div>" +
			   "</div>";
	}
}