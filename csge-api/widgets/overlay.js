import Dom from '../tools/dom.js';
import Core from '../tools/core.js';
import Widget from '../components/base/widget.js';

/**
 * Overlay widget module
 * @module widgets/overlay
 * @extends Widget
 */
export default class wOverlay extends Widget { 
	
	/**
	 * Get/set the overlay header
	 * @type {string}
	 */
	set header(value) { this.Elem("header").innerHTML = value; }
	get header() { return this.Elem("header").innerHTML; }
	
	/**
	 * Get/set the overlay widget
	 * @type {object}
	 */
	set widget(widget) {
		this.Empty();
		
		this._widget = widget;
		
		widget.container = this.Elem("body");
	}
	
	get widget() { return this._widget; }
		
	/**
	 * Call constructor of base class and initialize overlay
	 * @param {object} container - div.map-container and properties
	 * @returns {void}
	 */
	constructor(...config) {	
		super(...config);
		
		this.SetStyle(0, "none");
		
		this.Node("close").On("click", this.onBtnClose_Click.bind(this));
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(widget, header) {
		this.widget = widget;	
		if (header) this.header = header;	
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Overlay_Close", "en", "Close");
		nls.Add("Overlay_Close", "fr", "Fermer");		
	}
	
	/**
	 * Set css style of overlay
	 * @param {number} opacity - Opacity property value for overlay (ex. 0-1)
	 * @param {string} display - Display property value for overlay (ex. none/inline/block)
	 * @returns {void}
	 */
	SetStyle(opacity, display) {
		this.roots[0].style.opacity = opacity;
		this.roots[0].style.display = display;
	}
	
	/**
	 * Remove element from Dom
	 *@returns {void}
	 */
	Empty() {
		Dom.Empty(this.Elem("body"));
	}
	
	/**
	 * Show the overlay widget and emit events
	 * @returns {void}
	 */
	Show() {		
		this.SetStyle(1, "block");
		
		this.Emit("Show", { overlay:this });
	}
	
	/**
	 * Hide the overlay and emit hide event
	 * @returns {void}
	 */
	Hide() {				
		this.SetStyle(0, "none");
		
		this.Emit("Hide", { overlay:this });
	}
	
	/**
	 * Hide the overlay and emit close event
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	onBtnClose_Click(ev) {
		this.Hide();
		
		this.Emit("Close", { overlay:this });
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */
	HTML() {
		return	  "<div class='overlay esri-component'>" +
					  "<div class='overlay-header'>" +
						  "<h2 class='overlay-header' handle='header'></h2>" +
						  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
					  "</div>" +
					  "<div class='overlay-body' handle='body'></div>" +
				  "</div>";
	}
}