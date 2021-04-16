import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Bookmarks widget module
 * @module widgets/bookmarks
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Bookmarks", class Bookmarks extends Templated {
	
	/** 
	 * Set the bookmarks widget
	 * @type {object} 
	*/
	set Map(value) { 
		this.map = value; 
		
        this.bookmarks = new ESRI.widgets.Bookmarks({
			view: this.map.view,
			container: this.Elem("content"),
			editingEnabled: false
        });
	}
	
	/** 
	 * Set the bookmark values
	 * @type {string[]} 
	*/	
	set Bookmarks(value) {
		this.bookmarks.bookmarks = value;
	}
	
	/**
	 * Return bookmarks button title in both languages
	 * @returns {object.<string, string>} Basemap titles for each language
	 */	
	static Nls() {
		return {
			"Bookmarks_Title" : {
				"en": "Bookmarks",
				"fr": "Géosignets"
			}
		}
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize bookmarks
	 * @param {object} container - div.bookmarks and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)
	 * @returns {void}
	 */	
	constructor(container, options) {	
		super(container, options);
		
		this.bookmarks = null;
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
	Template() {
		return "<div handle='content'></div>";
	}
})