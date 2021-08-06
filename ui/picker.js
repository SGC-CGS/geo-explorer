
import Dom from '../tools/dom.js';
import Core from '../tools/core.js';
import Widget from '../components/base/widget.js';

/**
 * Picker module
 * @module ui/picker
 * @extends Widget
 */
export default Core.Templatable("Api.Components.Picker", class Picker extends Widget {

	/**
	 * Get/set color rgb value from picker
	 */
	get color() {
		return this._picker.color;
	}
	
	/**
	 * Get ESRI color ramps based on start and end color selection
	 */
	get EsriColor() {
		var c = this.color.rgba;
		
		return [c.r, c.g, c.b, c.a * 255];
	}

	set color(value) {
		this._picker.color.set(value);
		
		this.Elem('button').style.backgroundColor = this._picker.color.rgbString;
	}

	/**
	 * Call constructor of base class and initialize color picker
	 * @param {object} container - div color container and properties
	 * @returns {void}
	 */
	constructor(container) {
		super(container);
		
		this._h = null;
		this._collapsed = true;
		
		this.Node("button").On("click", this.OnButtonColor_Click.bind(this));
		this.Node("container").On("click", this.OnContainer_Click.bind(this));
		
		this._picker = new iro.ColorPicker(this.Elem('wheel'), {
			width : 170,
			layoutDirection : "vertical",
			sliderSize : 15
		});
		
		// this.picker.on("color:change", this.OnPicker_Change.bind(this));
		
		this._picker.base.children[0].tabIndex = 0;
		this._picker.base.children[1].tabIndex = 0;
		
		this.Elem('button').style.backgroundColor = this._picker.color.rgbString;
		
		this.onBody_KeyUp_Bound = this.onBody_KeyUp.bind(this);
		this.onBody_Click_Bound = this.onBody_Click.bind(this);
	}
	
	/**
	 * When color is clicked in the color picker, stop event from bubbling to parent elements
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnContainer_Click(ev) {
		ev.stopPropagation();
	}

	/**
	 * Show or hide color picker when a styling start or end color square is clicked
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnButtonColor_Click(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		
		this._collapsed ? this.Show() : this.Hide();
	}
	
	/**
	 * Show color picker and update CSS
	 * @returns {void}
	 */
	Show() {
		document.body.addEventListener("keyup", this.onBody_KeyUp_Bound);
		document.body.addEventListener("click", this.onBody_Click_Bound);
		
		this._collapsed = false;
	
		Dom.RemoveCss(this.Elem('container'), "collapsed");
	}
	
	/**
	 * Hide color picker and update CSS
	 * @returns {void}
	 */
	Hide() {
		document.body.removeEventListener("keyup", this.onBody_KeyUp_Bound);
		document.body.removeEventListener("click", this.onBody_Click_Bound);
		
		this._collapsed = true;
	
		Dom.AddCss(this.Elem('container'), "collapsed");
		
		this.Elem('button').style.backgroundColor = this._picker.color.rgbString;
		
		this.Emit("Finished", { color:this._picker.color.rgba });
	}
	
	/**
	 * Hide color picker when escape key is pressed
	 * @param {object} ev - Keyboard event
	 * @returns {void}
	 */
	onBody_KeyUp(ev) {
		if (ev.keyCode == 27) this.Hide();
	}
	
	/**
	 * Hide color picker when user clicks outside of picker window
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	onBody_Click(ev) {
		this.Hide();
	}
	
	/**
	 * Create HTML for color picker
	 * @returns {string} HTML for color picker div
	 */
	HTML() {
		return "<div class='color-picker'>" +
				  "<button handle='button' class='color'></button>" +
			      "<div handle='container' class='wheel-container collapsed'>" +
					  "<div handle='wheel'></div>" +
				  "</div>" +
			   "</div>"
	}
})
