'use strict';

import Core from '../tools/core.js';
import Evented from './evented.js';
import Requests from '../tools/requests.js';

export default class Context extends Evented { 
	
	set subject(value) { this.selection.current.subject = value; }
	set theme(value) { this.selection.current.theme = value; }
	set category(value) { this.selection.current.category = value; }
	set filters(value) { this.selection.current.filters = value; }
	set value(value) { this.selection.current.value = value; }
	set geography(value) { this.selection.current.geography = value; }
	set metadata(value) { this._metadata.current = value; }
	set sublayer(value) { this._sublayer.current = value; }
	
	get subject() { return this.selection.current.subject; }
	get theme() { return this.selection.current.theme; }
	get category() { return this.selection.current.category; }
	get filters() { return this.selection.current.filters; }
	get value() { return this.selection.current.value; }
	get geography() { return this.selection.current.geography; }
	get metadata() { return this._metadata.current; }
	get sublayer() { return this._sublayer.current; }

	get indicators() { return this.filters.concat([this.value]); }
	
	constructor () {
		super();
		
		this.lookups = {
			current : {},
			previous : {}			
		}
		
		this.selection = {
			current : {},
			previous : {}
		}
		
		this._metadata = {
			current: null,
			previous : null
		}
		
		this._sublayer = {
			current: null,
			previous : null
		}
	}
	
	Initialize(config) {
		var d = Core.Defer();
		
		var p1 = this.UpdateSubjects();		
		var p2 = this.ChangeSubject(config.subject);		
		var p3 = this.ChangeTheme(config.theme);
		var p4 = this.ChangeCategory(config.category);	
		var p5 = this.ChangeIndicators(config.filters, config.value);
		var p6 = this.ChangeGeography(config.geography);

		Promise.all([p1, p2, p3, p4, p5, p6]).then(c => {
			this.UpdateRenderer().then(c => {
				this.Commit();
				
				// TODO: Commit everything , Update Map, Legend, Styler, Selector
				
				d.Resolve();
			}, error => d.Reject(error));
		}, error => d.Reject(error));
		
		return d.promise;
	}
	
	Clone(pojo) {
		return JSON.parse(JSON.stringify(pojo));
	}
	
	Commit() {
		this.lookups.previous = this.Clone(this.lookups.current);
		this.selection.previous = this.Clone(this.selection.current);
		this._metadata.previous = this.Clone(this._metadata.current);
		this._sublayer.previous = this._sublayer.current;
	}
	
	Revert() {
		this.lookups.current = this.Clone(this.lookups.previous);
		this.selection.current = this.Clone(this.selection.previous);
		this._metadata.current = this.Clone(this._metadata.previous);
		this._sublayer.current = this._sublayer.previous;
	}
	
	UpdateSubjects() {
		return Requests.Indicator(null).then(lookup => {				
			this.lookups.current.subjects = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateThemes() {
		return Requests.Indicator(this.subject).then(lookup => {					
			this.lookups.current.themes = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateCategories() {
		return Requests.Indicator(this.theme).then(lookup => {					
			this.lookups.current.categories = lookup;
		}, error => this.OnContext_Error(error));
	}
	
	UpdateIndicators() {
		return Requests.Category(this.category).then(r => {
			this.lookups.current.filters = r.filters.map(f => f.values);
			this.lookups.current.values = r.value.values;
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
			this.lookups.current.geographies = items;
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
		return this.lookups.current[id];
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
			
			return this.FindLookupItem(lookup, ind);
		});
		
		items.push(this.FindLookupItem(this.Lookup("values"), this.value));
		
		return items;
	}
}