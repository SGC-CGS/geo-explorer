import Typeahead from './typeahead.js';
import Core from '../../tools/core.js';

export default Core.Templatable("Basic.Components.StaticTypeahead", class StaticTypeahead extends Typeahead {

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
	
	constructor(container, options) {	
		super(container, options);
	}
	
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