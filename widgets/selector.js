import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';
import Requests from '../../geo-explorer-api/tools/requests.js';
import StaticTypeahead from "../../geo-explorer-api/ui/typeahead/static.js";

/**
 * Selector widget module
 * @module widgets/selector
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Selector", class Selector extends Widget {
	
	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Selector_Title") }
	
	/**
	 * Call constructor of base class (Templated) and initialize selector widget with placeholders,
	 * and events
	 * @param {object} container - div selector container and properties
	 * @returns {void}
	 */	
	constructor(container) {	
		super(container);
		this.filters = [];
		this.metadata = null;
		
		this.Node("sSubject").On("Change", this.OnSubject_Change.bind(this));
		this.Node("sTheme").On("Change", this.OnTheme_Change.bind(this));
		this.Node("sCategory").On("Change", this.OnCategory_Change.bind(this));
		this.Node("sValue").On("Change", this.OnValue_Change.bind(this));
		this.Node("sGeography").On("Change", this.OnGeography_Change.bind(this));
		
		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));

		this.Elem('sSubject').placeholder = this.Nls("Selector_Subject_Placeholder");
		this.Elem('sTheme').placeholder = this.Nls("Selector_Theme_Placeholder");
		this.Elem('sCategory').placeholder = this.Nls("Selector_Category_Placeholder");
		this.Elem('sValue').placeholder = this.Nls("Selector_Value_Placeholder");
		this.Elem('sGeography').placeholder = this.Nls("Selector_Geography_Placeholder");
		
		this.Elem('sSubject').disabled = true;
		this.Elem('sTheme').disabled = true;
		this.Elem('sCategory').disabled = true;
		this.Elem('sValue').disabled = true;
		this.Elem('sGeography').disabled = true;
		this.Elem('bApply').disabled = true;
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Selector_Title", "en", "Select Data");
		nls.Add("Selector_Title", "fr", "Sélectionner des données");
		nls.Add("Selector_Subject", "en", "Subject");
		nls.Add("Selector_Subject", "fr", "Sujet");
		nls.Add("Selector_Subject_Placeholder", "en", "*... Select a subject");
		nls.Add("Selector_Subject_Placeholder", "fr", "*... Sélectionnez un sujet");
		nls.Add("Selector_Theme", "en", "Theme");
		nls.Add("Selector_Theme", "fr", "Thème");
		nls.Add("Selector_Theme_Placeholder", "en", "*... Select a theme");
		nls.Add("Selector_Theme_Placeholder", "fr", "*... Sélectionnez un thème");
		nls.Add("Selector_Category", "en", "Category (Product)");
		nls.Add("Selector_Category", "fr", "Catégorie (Produit)");
		nls.Add("Selector_Category_Placeholder", "en", "*... Select a product");
		nls.Add("Selector_Category_Placeholder", "fr", "*... Sélectionnez un produit");
		nls.Add("Selector_Value", "en", "Value to Display");
		nls.Add("Selector_Value", "fr", "Valeur à afficher");
		nls.Add("Selector_Value_Placeholder", "en", "*... Select a value to Display");
		nls.Add("Selector_Value_Placeholder", "fr", "*... Sélectionnez une valeur à afficher");
		nls.Add("Selector_Geography", "en", "Geographic Level");
		nls.Add("Selector_Geography", "fr", "Niveau géographique");
		nls.Add("Selector_Geography_Placeholder", "en", "*... Select a geographic Level");
		nls.Add("Selector_Geography_Placeholder", "fr", "*... Sélectionnez un niveau géographique");
		nls.Add("Selector_Filter_Label", "en", "Filters");
		nls.Add("Selector_Filter_Label", "fr", "Filtres");
		nls.Add("Selector_Filter_Placeholder", "en", "*... Select a Filter");
		nls.Add("Selector_Filter_Placeholder", "fr", "*... Sélectionnez un filtre");
		nls.Add("Selector_Filter_Instructions", "en", "Select a subject, theme and category (product) to show available filters.");
		nls.Add("Selector_Filter_Instructions", "fr", "Sélectionner un sujet, thème et catégorie (produit) pour afficher les filtres disponibles.");
		nls.Add("Selector_Button_Apply", "en", "Apply");
		nls.Add("Selector_Button_Apply", "fr", "Appliquer");
		nls.Add("Selector_Button_Close", "en", "Cancel");
		nls.Add("Selector_Button_Close", "fr", "Annuler");		
	}
	
	/**
	 * Load data to select elements 
	 * @param {object} context - Context object
	 * @returns {void}
	 */
	Update(context) {
		this.context = context;

		this.LoadDropDown(this.Elem("sSubject"), context.Lookup("subjects"));
		this.LoadDropDown(this.Elem("sTheme"), context.Lookup("themes"));
		this.LoadDropDown(this.Elem("sCategory"), context.Lookup("categories"));
		this.LoadDropDown(this.Elem('sValue'), context.Lookup("values"));
		this.LoadDropDown(this.Elem("sGeography"), context.Lookup("geographies"));

		this.ResetFilter();
		
		this.LoadFilters(context.Lookup("filters"));

		this.Elem("sSubject").Select(i => i.value == context.subject);
		this.Elem("sTheme").Select(i => i.value == context.theme);
		this.Elem("sCategory").Select(i => i.value == context.category);
		this.Elem("sValue").Select(i => i.value == context.value);
		this.Elem("sGeography").Select(i => i.value == context.geography);

		this.filters.forEach((f, i) => {
			f.Select(j => j.value == context.filters[i]);
		});
	}
		
	/**
	 * Load select element with list of items and enable
	 * @param {object} select - Select element
	 * @param {Object[]} items - List of objects with ids and labels to be added to select element
	 * @returns {void}
	 */
	LoadDropDown(select, items) {
		select.Reset();

		select.value = "";
		select.numCharactersToShowMatches = 0;
		select.store = items;
		select.disabled = false;
	}
	
	/**
	 * Remove all filter select elements from Dom and CSS
	 * @returns {void}
	 */
	ResetFilter() {
		this.filters = [];
		
		Dom.Empty(this.Elem('filter'));
		Dom.RemoveCss(this.Elem("instructions"), "hidden");
	}
	
	/**
	 * Load filter select elements
	 * @param {object[]} filters - List of objects containing ids and labels to be added to filter select element
	 * @returns {object} Object containing filter select elements
	 */
	LoadFilters(filters) {		
		Dom.AddCss(this.Elem("instructions"), "hidden");
		
		this.filters = filters.map(d => {
			var label = Dom.Create("label", { innerHTML:d.label }, this.Elem('filter'));

			var div = Dom.Create("div", null, this.Elem('filter'));
			
			var select = new StaticTypeahead(div);

			select.store = d.values;

			select.numCharactersToShowMatches = 0;

			select.placeholder = this.Nls("Selector_Filter_Placeholder");

			select.On("Change", this.OnFilterChange.bind(this));
			
			return select;
		});
	}

	/**
	 * Deselect and disable specified select elements
	 * @param {string[]} elements - List of select elements to be disabled
	 * @returns {void}
	 */	
	Disable(elements) {
		elements.forEach(e => this.Elem(e).disabled = true);

		if (elements.indexOf('sCategory') != -1) this.ResetFilter();
	}
	
	/**
	 * Update themes when a subject is selected
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnSubject_Change(ev) {
		this.Disable(['sTheme', 'sCategory', 'sValue', 'sGeography', 'bApply']);
		
		this.Emit("Busy");
		
		this.context.ChangeSubject(ev.item.value).then(c => {
			this.Emit("Idle");
		
			this.LoadDropDown(this.Elem("sTheme"), this.context.Lookup("themes"));

		}, error => this.OnRequests_Error(error));		
	}
	
	/**
	 * Update categories when a theme is selected
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnTheme_Change(ev) {
		this.Disable(['sCategory', 'sValue', 'sGeography', 'bApply']);
		
		this.Emit("Busy");
		
		this.context.ChangeTheme(ev.item.value).then(c => {
			this.Emit("Idle");
		
			this.LoadDropDown(this.Elem("sCategory"), this.context.Lookup("categories"));
			
		}, error => this.OnRequests_Error(error));		
	}
	
	/**
	 * Update filter and value select elements when a category/product is selected
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnCategory_Change(ev) {
		this.Disable(['sValue', 'sGeography', 'bApply']);
		
		this.Emit("Busy");

		this.context.ChangeCategory(ev.item.value).then(c => {
			this.Emit("Idle");

			this.ResetFilter();
		
			this.LoadFilters(this.context.Lookup("filters"));

		}, error => this.OnRequests_Error(error));		
	}
	
	/**
	 * Update filter select element. 
	 * 
	 * Also, enable sValue or call SendValueAndFilterToContext(). 
	 * @param {*} ev - Event object
	 * @returns {void}
	 */
	OnFilterChange(ev) {
		// Update the selected filter TypeAhead value 
		ev.target.value = ev.item

		if (this.filters.some(f => f.value == null)) return;

		// When sValue is enabled and all filters are not null valued
		if (!this.Elem('sValue').disabled) this.ChangeContext();

		// Enable sValue once all filters are not null valued
		else {
			this.LoadDropDown(this.Elem("sValue"), this.context.Lookup("values"));
			
			this.Elem('sValue').disabled = false;
		}
	}
	
	/**
	 * Update value select element and call ChangeContext()
	 * @param {*} ev - Event object
	 * @returns {void}
	 */
	OnValue_Change(ev) {
		this.Elem("sValue").value = ev.item;
		
		this.ChangeContext();	
	}

	/**
	 * Update geographic level select element when a value to display is selected
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	ChangeContext() {
		var value = this.Elem("sValue").value.value;

		var filters = this.filters.map((f, i)=> f.value.value);

		this.Emit("Busy");

		this.context.ChangeIndicators(filters, value).then(c => {	
			this.Emit("Idle");
			
			this.LoadDropDown(this.Elem("sGeography"), this.context.Lookup("geographies"));
		}, error => this.OnRequests_Error(error));
	}
	
	/**
	 * Assign geography level and enable Apply button when geography level is selected
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnGeography_Change(ev) {
		this.Elem('bApply').disabled = false;
		
		this.context.ChangeGeography(ev.item.value);
	}
	
	/**
	 * Load data when Apply button is clicked
	 * @param {object} ev - Mouse event object
	 * @returns {void}
	 */
	OnApply_Click(ev) {
		this.Emit("Busy");
		
		this.context.UpdateRenderer().then(c => {
			this.Emit("Idle");
		
			this.context.Commit();
			
			this.Emit("Change", { context:this.context });
		});
	}
	
	/**
	 * Cancel any changes made in selector window and emit close event
	 * @param {Object} ev - Mouse event object
	 * @returns {void}
	 */
	OnClose_Click(ev) {
		this.context.Revert();

		this.ResetFilter(); // prevents filter doubling bug
		
		this.Update(this.context);
		
		this.Emit("Close");
	}
	
	/**
	 * Emits error when changing a select element generates an error
	 * @param {object} error - Error describing problem
	 * @returns {void}
	 */
	OnRequests_Error (error) {
		this.Emit("Error", { error:error });
	}
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for selector widget
	 */
	HTML() {
		return	"<label class='sm-label'>nls(Selector_Subject)</label>" + 
				"<div handle='sSubject' widget='Api.Components.StaticTypeahead'></div>" +
				"<label class='sm-label'>nls(Selector_Theme)</label>" + 
				"<div handle='sTheme' widget='Api.Components.StaticTypeahead'></div>" +
				"<label>nls(Selector_Category)</label>" +
				"<div handle='sCategory' widget='Api.Components.StaticTypeahead'></div>" +

				"<div class='filter-container'>" + 
					"<label>nls(Selector_Filter_Label)</label>" +
					"<div handle='instructions' class='filter-instructions'>nls(Selector_Filter_Instructions)</div>" +
					"<div handle='filter' class='filter'></div>" +
				"</div>" +

				"<label>nls(Selector_Value)</label>" +
				"<div handle='sValue' widget='Api.Components.StaticTypeahead'></div>" +
				"<label>nls(Selector_Geography)</label>" +
				"<div handle='sGeography' widget='Api.Components.StaticTypeahead'></div>" +
				"<div class='button-container'>" + 
					"<button handle='bApply' class='button-label button-apply'>nls(Selector_Button_Apply)</button>" +
					"<button handle='bClose' class='button-label button-close'>nls(Selector_Button_Close)</button>" +
				"</div>";
	}
})