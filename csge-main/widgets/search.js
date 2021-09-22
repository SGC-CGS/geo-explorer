import Widget from '../../csge-api/components/base/widget.js';
import Core from '../../csge-api/tools/core.js';
import Requests from '../../csge-api/tools/requests.js';
import Typeahead from '../../csge-api/ui/typeahead/dynamic.js';


/**
 * Search widget module
 * @module widgets/search
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Search", class wSearch extends Widget {
	
	/**
	 * Call constructor of base class (Widget) and initialize search widget
	 * @param {object} container - DOM element that will contain the widget
	 * @returns {void}
	 */
	constructor(...config) {	
		super(...config);
		
		this.Elem("typeahead").storeFn = (value) => Requests.Typeahead(value);
		
		this.Elem("typeahead").On("Change", this.OnTypeahead_Change.bind(this));
	}
	
	Configure(map) {
		this.map = map;
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Search_Icon_Alt", "en", "Magnifying glass");
		nls.Add("Search_Icon_Alt", "fr", "Loupe");
	}
	
	/**
	 * Issue request to search placename and emit additional events
	 * @param {object} ev - Event issued when user hits enter in search box
	 * @returns {void}
	 */
	OnTypeahead_Change(ev) {
		this.Emit("Busy");
		
		Requests.Placename(ev.item.id, ev.item.label).then(feature => {
			this.map.GoTo(feature.geometry);
			
			this.Emit("Idle");
			this.Emit("Change", { feature:feature });
		}, error => {
			this.Emit("Error", { error:error });
		});
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */
	HTML() {        
		return "<div class='search'>" +
				   "<img src='./assets/search-24.png' alt='nls(Search_Icon_Alt)' />" +
				   "<div handle='typeahead' widget='Api.Components.DynamicTypeahead'></div>" +
			   "</div>";
	}
})