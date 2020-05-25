import Dom from '../tools/dom.js';
import Core from '../tools/core.js';
import Templated from '../components/templated.js';

export default Core.Templatable("Basic.Components.Picker", class Picker extends Templated {

	set color(value) {
		this.picker.color.set(value);
		
		this.Elem('button').style.backgroundColor = this.picker.color.rgbString;
	}

	constructor(container) {
		super(container);
		
		this.h = null;
		this.collapsed = true;
		
		this.Node("button").On("click", this.OnButtonColor_Click.bind(this));
		this.Node("container").On("click", this.OnContainer_Click.bind(this));
		
		this.picker = new iro.ColorPicker(this.Elem('wheel'), {
			width : 170,
			layoutDirection : "vertical",
			sliderSize : 15
		});
		
		this.picker.on("color:change", this.OnPicker_Change.bind(this));
		
		this.picker.base.children[0].tabIndex = 0;
		this.picker.base.children[1].tabIndex = 0;
		
		
		this.Elem('button').style.backgroundColor = this.picker.color.rgbString;
		
		this.onBody_KeyUp_Bound = this.onBody_KeyUp.bind(this);
		this.onBody_Click_Bound = this.onBody_Click.bind(this);
	}
	
	OnContainer_Click(ev) {
		ev.stopPropagation();
	}
	
	OnPicker_Change(ev) {
		this.Elem('button').style.backgroundColor = this.picker.color.rgbString;
	}
	
	OnButtonColor_Click(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		
		this.collapsed ? this.Show() : this.Hide();
	}
	
	Show() {
		document.body.addEventListener("keyup", this.onBody_KeyUp_Bound);
		document.body.addEventListener("click", this.onBody_Click_Bound);
		
		this.collapsed = false;
	
		Dom.RemoveCss(this.Elem('container'), "collapsed");
	}
	
	Hide() {
		document.body.removeEventListener("keyup", this.onBody_KeyUp_Bound);
		document.body.removeEventListener("click", this.onBody_Click_Bound);
		
		this.collapsed = true;
	
		Dom.AddCss(this.Elem('container'), "collapsed");
		
		this.Emit("Finished", { color:this.picker.color.rgba });
	}
	
	onBody_KeyUp(ev) {
		if (ev.keyCode == 27) this.Hide();
	}
	
	onBody_Click(ev) {
		this.Hide();
	}
	
	Template() {
		return "<div class='color-picker'>" +
				  "<button handle='button' class='color'></button>" +
			      "<div handle='container' class='wheel-container collapsed'>" +
					  "<div handle='wheel'></div>" +
				  "</div>" +
			   "</div>"
	}
})
