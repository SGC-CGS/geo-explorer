import Typeahead from './typeahead.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

export default Core.Templatable("Basic.Components.DynamicTypeahead", class DynamicTypeahead extends Typeahead {
		
	set storeFn(value) { this._storeFn = value; }
	
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
		
		Dom.AddCss(this.Elem("root"), "loading");
		
		this._storeFn(mask).then(items => {
			Dom.RemoveCss(this.Elem("root"), "loading");
			
			this.store = items;
			
			d.Resolve(this._store);
		}, (error) => {
			d.Reject(error);
		});
		
		return d.promise;
	}
	
	Template() {        
		return "<div handle='root' class='typeahead collapsed'>" +
				 "<input handle='input' type='text' class='input' placeholder='nls(Search_Typeahead_Placeholder)' title='nls(Search_Typeahead_Title)'>" + 
				 "<img class='wait' src='./assets/loading.svg' alt='nls(Search_Typeahead_loading'>" + 
				 "<ul handle='list' class='list'></ul>" +
			   "</div>";
	}
})