import Typeahead from './typeahead.js';
import Core from '../../tools/core.js';

/**
 * Static typeahead module
 * @module ui/typeahead/static
 * @extends Typeahead
 */
export default Core.Templatable("Api.Components.StaticTypeahead", class StaticTypeahead extends Typeahead {
	
	/**
	 * Call constructor of base class and initialize typeahead
	 * @param {object} container - div container and properties
	 * @returns {void}
	 */		
	constructor(...config) {	
		super(...config);
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
	 * Get list of possible matches for search string from static list
	 * @param {string} mask - Search string
	 * @returns {Promise} A promise object associated with query results (with resolve and reject functions)
	 */	
	Refresh(mask) {
		var d = Core.Defer();
		
		var items = this._store.filter(i => compare(i.data.label, mask));
		
		d.Resolve(items);
		
		function compare(label, mask) {
			return label.toLowerCase().indexOf(mask.toLowerCase()) !== -1
		}
		
		return d.promise;
	}
})