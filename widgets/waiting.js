import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Waiting widget module
 * @module widgets/waiting
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Waiting", class Waiting extends Templated {
	
	/**
	 * Return text for waiting widget in both languages
	 * @returns {object.<string, string>} Waiting widget text for each language
	 */
	static Nls(nls) {
		nls.Add("Waiting_Label", "en", "Working...");
		nls.Add("Waiting_Label", "fr", "Chargement...");		
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize waiting widget
	 * @param {object} container - div waiting container and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)	  
	 * @returns {void}
	 */
	constructor(container, options) {	
		super(container, options);
		
		this.Hide();
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
	Template() {        
		return "<label handle='label'>nls(Waiting_Label)</label>" +
			   "<i class='fa fa-circle-o-notch fa-spin'></i>";
	}
})