'use strict';

import Core from '../tools/core.js';
import Evented from './evented.js';
import Requests from '../tools/requests.js';

/**
 * Context is called from configuration.js to handle changes / updates related 
 * to subject, theme, category, etc. 
 * @module components/context
 * @extends Evented
 */
export default class Context extends Evented { 
	
	/**
	 * Get / set current subject from / to the context 
	 */
	set subject(value) { this._selection.current.subject = value; }
	get subject() { return this._selection.current.subject; }

	/**
	 * Get / set current theme from / to the context 
	 */
	set theme(value) { this._selection.current.theme = value; }
	get theme() { return this._selection.current.theme; }

	/**
	 * Get / set current category from / to the context 
	 */
	set category(value) { this._selection.current.category = value; }
	get category() { return this._selection.current.category; }

	/**
	 * Get / set current filters from / to the context 
	 */
	set filters(value) { this._selection.current.filters = value; }
	get filters() { return this._selection.current.filters; }

	/**
	 * Get / set current value from / to the context 
	 */
	set value(value) { this._selection.current.value = value; }
	get value() { return this._selection.current.value; }

	/**
	 * Get / set current geography from / to the context 
	 */
	set geography(value) { this._selection.current.geography = value; }
	get geography() { return this._selection.current.geography; }

	/**
	 * Get / set current metadata
	 */
	set metadata(value) { this._metadata.current = value; }
	get metadata() { return this._metadata.current; }

	/**
	 * Get / set current sublayer
	 */
	set sublayer(value) { this._sublayer.current = value; }
	get sublayer() { return this._sublayer.current; }
	
	/**
	 * Get indicators from concatenated filters
	 */
	get indicators() { return this.filters.concat([this.value]); }
	
	/**
	 * Call constructor of base class (Evented) and initialize context class 
	 * @param {object} - JSON object containing values for selecting data (category, filters, geography, subject, theme, value)
	 * @returns {void}
	 */		
	constructor (json) {
		super();
		
		this.Validate(json);
		
		this._lookups = { current : {}, previous : {} }
		this._selection = { current : json, previous : {} }
		this._metadata = { current: null, previous : null }
		this._sublayer = { current: null, previous : null }
	}
	
	/**
	 * Verify that json object contains valid information for selecting data 
	 * @param {object} json - JSON object containing values for selecting data (category, filters, geography, subject, theme, value)
	 * @returns {void}
	 */
	Validate(json) {
		if (isNaN(json.subject)) throw new Error("subject provided is not a number.");

		if (isNaN(json.theme)) throw new Error("theme provided is not a number.");

		if (isNaN(json.category)) throw new Error("category provided is not a number.");

		if (isNaN(json.value)) throw new Error("value provided is not a number.");

		if (typeof json.geography != "string") throw new Error("geography provided is not a string.");
		
		if (!Array.isArray(json.filters)) throw new Error("filters provided is not an array.");
		
		if (json.filters.length == 0) throw new Error("No filters provided.");
		
		if (json.filters.some(isNaN)) throw new Error("filters provided are not numbers.");
	}
	
	/**
	 * Update dependent config properties with chained promises
	 * @param {object} config - Context object  (listeners, _lookups, _selection, _metadata:, _sublayer)
	 * @returns {promise} Promise with if resolved
	 */
	Initialize(config) {
		this.Emit("Busy");
		
		var d = Core.Defer();
		
		var p1 = this.UpdateSubjects();		
		var p2 = this.UpdateThemes(config.subject);		
		var p3 = this.UpdateCategories(config.theme);
		var p4 = this.UpdateIndicators(config.category);	
		var p5 = this.UpdateMetadata(config.filters, config.value);

		Promise.all([p1, p2, p3, p4, p5]).then(c => {
			this.UpdateRenderer().then(c => {
				this.Commit();
				
				this.Emit("Idle");
		
				d.Resolve();
			}, error => d.Reject(error));
		}, error => d.Reject(error));
		
		return d.promise;
	}
	
	/**
	 * Convert a JS value to a JSON string and then into an object
	 * @param {Object.prototype} pojo - Plain Old JS Object
	 * @returns - de-referenced object
	 */
	Clone(pojo) {
		return JSON.parse(JSON.stringify(pojo));
	}
	
	/**
	 * By value, switch the previous to current
	 * @returns {void}
	 */
	Commit() {
		this._lookups.previous = this.Clone(this._lookups.current);
		this._selection.previous = this.Clone(this._selection.current);
		this._metadata.previous = this.Clone(this._metadata.current);
		this._sublayer.previous = this._sublayer.current;
	}
	
	/**
	 * By value, switch the current to previous
	 * @returns {void}
	 */
	Revert() {
		this._lookups.current = this.Clone(this._lookups.previous);
		this._selection.current = this.Clone(this._selection.previous);
		this._metadata.current = this.Clone(this._metadata.previous);
		this._sublayer.current = this._sublayer.previous;
	}
	
	/**
	 * Update _lookups with subject list
	 * @returns {promise} Promise with current subject object[] (value, label, description) if resolved
	 */
	UpdateSubjects() {
		return Requests.Indicator(null).then(lookup => {				
			this._lookups.current.subjects = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	/**
	 * Update _lookups with current themes under current subject Id
	 * @returns {promise} Promise with current theme object[] (value, label, description) if resolved
	 */
	UpdateThemes() {
		return Requests.Indicator(this.subject).then(lookup => {					
			this._lookups.current.themes = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	/**
	 * Update_lookups with current categories under current theme Id
	 * @returns {promise} Promise with current category object[] (value, label, description) if resolved
	 */
	UpdateCategories() {
		return Requests.Indicator(this.theme).then(lookup => {					
			this._lookups.current.categories = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	/**
	 * Update_lookups with current indicators (filters and values) under current category Id
	 * @returns {promise} Promise with current indicators object[] (filters and values) if resolved
	 */
	UpdateIndicators() {
		return Requests.Category(this.category).then(r => {
			this._lookups.current.filters = r.filters; //.map(f => f.values);
			this._lookups.current.values = r.value; //.values;
		}, error => this.OnContext_Error(error));
	}
	
	/**
	 * Update current metadata value for current indicators and issue call to update geographies
	 * @returns {promise} Promise with current metadata object (breaks, colors, indicator, query) if resolved
	 */
	UpdateMetadata() {
		var d = Core.Defer();
		
		Requests.Metadata(this.indicators).then(metadata => {
			this.metadata = metadata;
			
			this.UpdateGeographies().then(items => d.Resolve(), error => d.Reject(error))
		}, error => d.Reject(error));
		
		return d.promise;
	}
	
	/**
	 * Update current geography levels for current metadata
	 * @returns {promise} Promise with current geography level objects[] (value, label, descipription) if resolved
	 */
	UpdateGeographies() {
		return Requests.Geography(this.metadata.indicator).then(items => {
			this._lookups.current.geographies = items;
		}, error => this.OnContext_Error(error));
	}
	
	/**
	 * Call the request renderer and set the sublayer for the current selections
	 * @returns {promise} Promise with sublayer object if resolved
	 */
	UpdateRenderer() {		
		return Requests.Renderer(this).then(sublayer => {
			this.sublayer = sublayer;
		}, error => this.OnContext_Error(error));
	}
	
	/**
	 * Set subject and update the dependent themes when the user changes the subject selection
	 * @param {number} subject - IndicatorThemeId for subject
	 * @returns {promise} Promise from UpdateThemes with object[] (value, label, description) if resolved
	 */
	ChangeSubject(subject) {			
		this.subject = subject;
		
		return this.UpdateThemes();
	}
	
	/**
	 * Set theme and update the dependent categories when the user changes the theme selection
	 * @param {number} theme - IndicatorThemeId for theme
	 * @returns {promise} Promise from UpdateCategories with object[] (value, label, description) if resolved
	 */
	ChangeTheme(theme) {			
		this.theme = theme;
		
		return this.UpdateCategories();
	}
	
	/**
	 * Set category and update the dependent indicators when the user changes the category selection
	 * @param {number} category - IndicatorThemeId for category (product)
	 * @returns {promise} Promise from UpdateIndicators with indicators object[] (filters and values) if resolved
	 */
	ChangeCategory(category) {		
		this.category = category;
		
		return this.UpdateIndicators();
	}
	
	/**
	 * Set filters and value and update the metadata when the user changes the value to display
	 * @param {number[]} filters - Number array of selected filter Ids (DimensionValueId)
	 * @param {number} value - Selected Value Id (DimensionValueId)
	 * @returns {promise} Promise from UpdateMetadata with current metadata object (breaks, colors, indicator, query) if resolved
	 */
	ChangeIndicators(filters, value) {
		this.filters = filters;
		this.value = value;
		
		return this.UpdateMetadata();
	}
	
	/**
	 * Set the geographic level when the user changes the geographic level selection
	 * @param {string} geography - Selected Geographic Level (GeographicLevelId)
	 * @returns {promise} - Promise with updated geography if resolved
	 */
	ChangeGeography(geography) {
		var d = Core.Defer();
		
		d.Resolve(this);
		
		this.geography = geography;
		
		return d.promise;
	}
	
	/**
	 * Look up an Id in lookups.current and return the object
	 * @param {string} id - Id string that matches an item in lookups.current object
	 * @returns {object} - Object from _lookups.current 
	 */
	Lookup(id) {
		return this._lookups.current[id];
	}
	
	/**
	 * Look up matching filter object in filter object array
	 * @param {object[]} lookup - Filter object array (value, label)
	 * @param {number} value - Value to look up in filter object 
	 * @returns {object} Matching filter object (value, label)
	 */
	FindLookupItem(lookup, value) {		
		for (var i = 0; i < lookup.length; i++) {
			if (lookup[i].value == value) return lookup[i];
		}
		
		return null;
	}
	
	/**
	 * Build array of filter objects
	 * @returns {object[]} Array of filter objects (value, label)
	 */
	IndicatorItems() {
		var items = this.filters.map((ind, i) => {
			var lookup = this.Lookup("filters")[i];
			
			return this.FindLookupItem(lookup.values, ind);
		});
		
		items.push(this.FindLookupItem(this.Lookup("values"), this.value));
		
		return items;
	}
	
	/**
	 * Build comma separated Indicator label by joining labels from IndicatorItems array of objects
	 * @returns (string) Indicator label
	 */
	IndicatorsLabel() {
		// TODO : Couple of things here, removing the first term because reference period
		// didn't show in the original app. Also removing the numbers at the start of each
		// label because they start with numbers.
		return this.IndicatorItems().splice(1).map(i => {
			return i.label.split(" ").splice(1).join(" ");
		}).join(", ");
	}
	
	/**
	 * Emit error when function is called
	 * @param {object} - Object containing information about the error
	 * @returns {void}
	 */
	OnContext_Error(error) {
		this.Emit("Error", { error:error });
	}
}