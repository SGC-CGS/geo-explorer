'use strict';

import Core from '../../geo-explorer-api/tools/core.js';
import Evented from '../../geo-explorer-api/components/base/evented.js';
import Requests from '../../geo-explorer-api/tools/requests.js';

/**
 * Context module
 * @module components/context
 * @extends Evented
 * @description Context is called from configuration.js
 * to handle changes / updates related to subject, theme, 
 * category, etc.
 */
export default class Context extends Evented { 
	
	/**
	 * @description
	 * Get / set a subject from / to the context 
	 */
	set subject(value) { this._selection.current.subject = value; }

	/**
	 * @description
	 * Get / set a theme from / to the context 
	 */
	set theme(value) { this._selection.current.theme = value; }

	/**
	 * @description
	 * Get / set a category from / to the context 
	 */
	set category(value) { this._selection.current.category = value; }

	/**
	 * @description
	 * Get / set filters from / to the context 
	 */
	set filters(value) { this._selection.current.filters = value; }

	/**
	 * @description
	 * Get / set a value from / to the context 
	 */
	set value(value) { this._selection.current.value = value; }

	/**
	 * @description
	 * Get / set a geography from / to the context 
	 */
	set geography(value) { this._selection.current.geography = value; }
	set metadata(value) { this._metadata.current = value; }
	set sublayer(value) { this._sublayer.current = value; }
	
	get subject() { return this._selection.current.subject; }
	get theme() { return this._selection.current.theme; }
	get category() { return this._selection.current.category; }
	get filters() { return this._selection.current.filters; }
	get value() { return this._selection.current.value; }
	get geography() { return this._selection.current.geography; }
	get metadata() { return this._metadata.current; }
	get sublayer() { return this._sublayer.current; }
	
	get indicators() { return this.filters.concat([this.value]); }
	
	constructor (json) {
		super();
		
		this.Validate(json);
		
		this._lookups = { current : {}, previous : {} }
		this._selection = { current : json, previous : {} }
		this._metadata = { current: null, previous : null }
		this._sublayer = { current: null, previous : null }
	}
	
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
	 * @description
	 * Convert a JS value to a JSON string and then into an object
	 * @param {Object.prototype} pojo - Plain Old JS Object
	 * @returns - de-referenced object
	 */
	Clone(pojo) {
		return JSON.parse(JSON.stringify(pojo));
	}
	
	/**
	 * @description
	 * By value, switch the previous to current
	 */
	Commit() {
		this._lookups.previous = this.Clone(this._lookups.current);
		this._selection.previous = this.Clone(this._selection.current);
		this._metadata.previous = this.Clone(this._metadata.current);
		this._sublayer.previous = this._sublayer.current;
	}
	
	/**
	 * @description
	 * By value, switch the current to previous
	 */
	Revert() {
		this._lookups.current = this.Clone(this._lookups.previous);
		this._selection.current = this.Clone(this._selection.previous);
		this._metadata.current = this.Clone(this._metadata.previous);
		this._sublayer.current = this._sublayer.previous;
	}
	
	UpdateSubjects() {
		return Requests.Indicator(null).then(lookup => {				
			this._lookups.current.subjects = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateThemes() {
		return Requests.Indicator(this.subject).then(lookup => {					
			this._lookups.current.themes = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateCategories() {
		return Requests.Indicator(this.theme).then(lookup => {					
			this._lookups.current.categories = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateIndicators() {
		return Requests.Category(this.category).then(r => {
			this._lookups.current.filters = r.filters; //.map(f => f.values);
			this._lookups.current.values = r.value; //.values;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateMetadata() {
		var d = Core.Defer();
		
		Requests.Metadata(this.indicators).then(metadata => {
			this.metadata = metadata;
			
			this.UpdateGeographies().then(items => d.Resolve(), error => d.Reject(error))
		}, error => d.Reject(error));
		
		return d.promise;
	}
	
	UpdateGeographies() {
		return Requests.Geography(this.metadata.indicator).then(items => {
			this._lookups.current.geographies = items;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateRenderer() {		
		return Requests.Renderer(this).then(sublayer => {
			this.sublayer = sublayer;
		}, error => this.OnContext_Error(error));
	}
	
	ChangeSubject(subject) {			
		this.subject = subject;
		
		return this.UpdateThemes();
	}
	
	ChangeTheme(theme) {			
		this.theme = theme;
		
		return this.UpdateCategories();
	}
	
	ChangeCategory(category) {		
		this.category = category;
		
		return this.UpdateIndicators();
	}
	
	ChangeIndicators(filters, value) {
		this.filters = filters;
		this.value = value;
		
		return this.UpdateMetadata();
	}
	
	ChangeGeography(geography) {
		var d = Core.Defer();
		
		d.Resolve(this);
		
		this.geography = geography;
		
		return d.promise;
	}
	
	Lookup(id) {
		return this._lookups.current[id];
	}
	
	FindLookupItem(lookup, value) {		
		for (var i = 0; i < lookup.length; i++) {
			if (lookup[i].value == value) return lookup[i];
		}
		
		return null;
	}
	
	IndicatorItems() {
		var items = this.filters.map((ind, i) => {
			var lookup = this.Lookup("filters")[i];
			
			return this.FindLookupItem(lookup.values, ind);
		});
		
		items.push(this.FindLookupItem(this.Lookup("values"), this.value));
		
		return items;
	}
	
	IndicatorsLabel() {
		// TODO : Couple of things here, removing the first term because reference period
		// didn't show in the original app. Also removing the numbers at the start of each
		// label because they start with numbers.
		return this.IndicatorItems().splice(1).map(i => {
			return i.label.split(" ").splice(1).join(" ");
		}).join(", ");
	}
	
	OnContext_Error(error) {
		this.Emit("Error", { error:error });
	}
}