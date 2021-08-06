import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Waiting widget module
 * @module widgets/waiting
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.Waiting", class Waiting extends Widget {
	
	/**
	 * Call constructor of base class and initialize waiting widget
	 * @param {object} container - div waiting container and properties
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);
		
		this.Hide();
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Waiting_Label", "en", "Working...");
		nls.Add("Waiting_Label", "fr", "Chargement...");		
	}
	
	/**
	 * Shows the waiting widget
	 * @returns {void}
	 */
	Show() {
		Dom.RemoveCss(this.container, "hidden");
	}
	
	/**
	 * Hides the widget
	 * @returns {void}
	 */
	Hide() {
		Dom.AddCss(this.container, "hidden");
	}
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for waiting widget
	 */
	HTML() {        
		return "<label handle='label'>nls(Waiting_Label)</label>" +
			   "<i class='fa fa-circle-o-notch fa-spin'></i>";
	}
})