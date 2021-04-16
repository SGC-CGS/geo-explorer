import Dom from '../tools/dom.js';
import Core from '../tools/core.js';
import Templated from '../components/templated.js';

/**
 * Overlay overlay module
 * @module widgets/overlay
 */
export default class Overlay extends Templated { 
	
	/**
	 * Set the overlay title
	 * @type {string}
	 */
	set title(value) {
		this.Elem("title").innerHTML = value;
	}
	
	/**
	 * Get/set the overlay widget
	 * @type {object}
	 */
	set widget(widget) {
		this.Empty();
		
		this._widget = widget;
		
		Dom.Place(widget.container, this.Elem("body"));		
	}
	
	get widget() { return this._widget; }
	
	/**
	 Return hover text for overlay close button in both languages
	 * @returns {object.<string, string>} Button text for each language
	 */
	static Nls() {
		return {
			"Overlay_Close" : {
				"en" : "Cancel",
				"fr" : "Annuler"
			}
		}
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize overlay
	 * @param {object} container - div.map-container and properties
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);
		
		this.SetStyle(0, "hidden");
		
		this.Node("close").On("click", this.onBtnClose_Click.bind(this));
	}
	
	/**
	 * Set css style of overlay
	 * @param {number} opacity - Opacity of overlay (0-1)
	 * @param {string} visibility - Visiblity of overlay (visible/hidden)
	 * @returns {void}
	 */
	SetStyle(opacity, visibility) {
		this.roots[0].style.opacity = opacity;
		this.roots[0].style.visibility = visibility;
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
		this.SetStyle(1, "visible");
		
		this.Emit("Show", { overlay:this });
		
		this.Elem("close").focus();
	}
	
	/**
	 * Hide the overlay and emit hide event
	 * @returns {void}
	 */
	Hide() {				
		this.SetStyle(0, "hidden");
		
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