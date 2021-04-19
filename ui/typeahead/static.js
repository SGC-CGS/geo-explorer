import Typeahead from './typeahead.js';
import Core from '../../tools/core.js';

/**
 * Dynamic typeahead module
 * @module ui/typeahead/dynamic
 * @extends Typeahead
 */
export default Core.Templatable("Basic.Components.StaticTypeahead", class StaticTypeahead extends Typeahead {

	/**
	 * Return ui text in both languages
	 * @returns {object.<string, string>} Text for each language
	 */	
	static Nls() {
		return {
			"Search_Typeahead_Title": {
				"en": "A Filtered list of items will appear as characters are typed.",
				"fr": "Une liste filtrée d'objets apparaîtra lorsque des caractères seront saisis."
			},
			"Search_Typeahead_Placeholder": {
				"en" : "Find a place on the map...",
				"fr" : "Rechercher un endroit sur la carte..."
			},
			"Search_Typeahead_loading" : {
				"en": "loading...",
				"fr": "en chargement..."
			}
		}
	}
	
	/**
	 * Call constructor of base class (Typeahead) and initialize typeahead
	 * @param {object} container - div container and properties
	 * @param {object} options - any additional options to assign (not typically used)
	 * @returns {void}
	 */		
	constructor(container, options) {	
		super(container, options);
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