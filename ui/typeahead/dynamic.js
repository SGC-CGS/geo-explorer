import Typeahead from './typeahead.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Dynamic typeahead module
 * @module ui/typeahead/dynamic
 * @extends Typeahead
 */
export default Core.Templatable("Api.Components.DynamicTypeahead", class DynamicTypeahead extends Typeahead {
	
	set storeFn(value) { this._storeFn = value; }
	
	/**
	 * Call constructor of base class and initialize typeahead
	 * @param {object} container - div container and properties
	 * @returns {void}
	 */			
	constructor(container) {	
		super(container);
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Search_Typeahead_Title", "en", "A Filtered list of items will appear as characters are typed.");
		nls.Add("Search_Typeahead_Title", "fr", "Une liste filtrée d'objets apparaîtra lorsque des caractères seront saisis.");
		nls.Add("Search_Typeahead_Placeholder", "en", "Find a place on the map...");
		nls.Add("Search_Typeahead_Placeholder", "fr", "Rechercher un endroit sur la carte...");
		nls.Add("Search_Typeahead_loading", "en", "loading...");
		nls.Add("Search_Typeahead_loading", "fr", "en chargement...");
	}
	
	/**
	 * Get list of possible matches for search string from db
	 * @param {string} mask - Search string
	 * @returns {Promise} A promise object associated with query results (with resolve and reject functions)
	 */
	Refresh(mask) {
		var d = Core.Defer();
		
		// Dom.AddCss(this.Elem("root"), "loading");
		
		this._storeFn(mask).then(items => {
			// Dom.RemoveCss(this.Elem("root"), "loading");
			
			this.store = items;
			
			d.Resolve(this._store);
		}, (error) => {
			d.Reject(error);
		});
		
		return d.promise;
	}
	
	/**
	 * Create HTML for typeahead input box
	 * @returns {string} HTML for typeahead input box
	 */		
	HTML() {        
		return "<div handle='root' class='typeahead collapsed'>" +
				 "<input handle='input' type='text' class='input' placeholder='nls(Search_Typeahead_Placeholder)' title='nls(Search_Typeahead_Title)'>" + 
				 // "<img class='wait' src='./assets/loading.svg' alt='nls(Search_Typeahead_loading'>" + 
				 "<ul handle='list' class='list'></ul>" +
			   "</div>";
	}
})