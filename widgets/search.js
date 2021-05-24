import Templated from '../../geo-explorer-api/components/templated.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';
import Requests from '../../geo-explorer-api/tools/requests.js';
import Typeahead from '../../geo-explorer-api/ui/typeahead/dynamic.js';

/**
 * Search widget module
 * @module widgets/search
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Search", class Search extends Templated {
	
	/**
	 * Call constructor of base class (Templated) and initialize search widget
	 * @param {object} container - div container and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)
	 * @returns {void}
	 */
	constructor(container, options) {	
		super(container, options);
		
		this.Elem("typeahead").storeFn = (value) => Requests.Typeahead(value);
		
		this.Elem("typeahead").On("Change", this.OnTypeahead_Change.bind(this));
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
	Template() {        
		return "<div handle='root'>" +
				  "<div handle='typeahead' widget='Basic.Components.DynamicTypeahead'></div>" +
			   "</div>";
	}
})