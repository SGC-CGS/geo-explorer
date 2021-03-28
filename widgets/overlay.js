import Dom from '../tools/dom.js';
import Core from '../tools/core.js';
import Templated from '../components/templated.js';

export default class Overlay extends Templated { 
	
	set title(value) {
		this.Elem("title").innerHTML = value;
	}
	
	set widget(widget) {
		this.Empty();
		
		this._widget = widget;
		
		Dom.Place(widget.container, this.Elem("body"));		
	}
	
	get widget() { return this._widget; }
	
	static Nls() {
		return {
			"Overlay_Close" : {
				"en" : "Cancel",
				"fr" : "Annuler"
			}
		}
	}
	
	constructor(container) {	
		super(container);
		
		this.SetStyle(0, "hidden");
		
		this.Node("close").On("click", this.onBtnClose_Click.bind(this));
	}
	
	SetStyle(opacity, visibility) {
		this.roots[0].style.opacity = opacity;
		this.roots[0].style.visibility = visibility;
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
		return	  "<div class='overlay esri-component'>" +
					  "<div class='overlay-header'>" +
						  "<h2 class='overlay-title' handle='title'></h2>" +
						  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
					  "</div>" +
					  "<div class='overlay-body' handle='body'></div>" +
				  "</div>";
	}
}