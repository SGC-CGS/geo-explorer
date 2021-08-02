import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Requests from '../../geo-explorer-api/tools/requests.js';
import Typeahead from '../../geo-explorer-api/ui/typeahead/dynamic.js';

/**
 * Search widget module
 * @module widgets/search
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Search", class Search extends Widget {
	
	/**
	 * Call constructor of base class (Widget) and initialize search widget
	 * @param {object} container - DOM element that will contain the widget
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);
		
		this.Elem("typeahead").storeFn = (value) => Requests.Typeahead(value);
		
		this.Elem("typeahead").On("Change", this.OnTypeahead_Change.bind(this));
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
		return "<img src='./assets/search-24.png' alt='nls(Search_Icon_Alt)' />" +
			   "<div handle='typeahead' widget='Api.Components.DynamicTypeahead'></div>";
	}
})