'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

import Templated from '../components/templated.js';

/**
 * Select box module
 * @module ui/select
 * @extends Templated
 */
export default Core.Templatable("Basic.Components.Select", class Select extends Templated {
	
	/**
	 * Get/set select box value
	 */
	get value() {
		return this.Elem("root").value;
	}
	
	set value(value) {
		this.Elem("root").value = value;
	}
	
	/**
	 * Get/set disabled value
	 */
	set disabled(value) {
		this.Elem("root").disabled = value;
	}
	
	get disabled() {
		return this.Elem("root").disabled;
	}
	
	/**
	 * Get selected element object (label, value)
	 */
	get selected() {
		var i = this.Elem("root").value;
		
		return this._items[i];
	}
	
	/**
	 * Set initial value of select box
	 */
	set placeholder(value) {
		this._ph = Dom.Create("option", { innerHTML:value, value:-1, className:"select-placeholder" });
		
		this._ph.disabled = true;
		this._ph.selected = true;
		
		this.Elem("root").insertBefore(this._ph, this.Elem("root").firstChild);
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize select
	 * @param {object} container - div container and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)
	 * @returns {void}
	 */	
	constructor(container, options) {
		super(container, options);
		
		this._items = [];
		
		this._ph = null;
		
		this.Node("root").On("change", this.OnSelect_Change.bind(this));
	}
	
	/**
	 * Populate options in select box
	 * @param {string} label - Label of select option
	 * @param {string} title - Title of select option
	 * @param {object} item - Object containing option description, label, and value
	 * @returns {void}
	 */
	Add(label, title, item) {
		Dom.Create("option", { innerHTML:label, value:this._items.length, title:title }, this.Elem("root"));
		
		this._items.push(item);
	}
	
	/**
	 * Call from delegate to FindIndex
	 * @param {function} delegate  - Delegate function
	 * @returns {void}
	 */
	Select(delegate) {		
		this.value = this.FindIndex(delegate);
	}
	
	/**
	 * Finds index of selected classification method through link to styler widget
	 * @param {function} delegate - Delegate function
	 * @returns {number} Index number of selected classification method (-1 if none)
	 */
	FindIndex(delegate) {
		for (var i = 0; i < this._items.length; i++) {
			if (delegate(this._items[i], i)) return i;
		}
		
		return -1;
	}
	
	/**
	 * Emit change event when a new option is selected
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnSelect_Change(ev) {
		var item = this._items[ev.target.value];
		
		this.Emit("Change", { index:ev.target.value, item:item, label:ev.target.innerHTML });
	}
	
	/**
	 * Create HTML for select element
	 * @returns {string} HTML for select element
	 */
	Template() {
		return '<select handle="root"></select>';
	}
	
	/**
	 * Empty items in select box
	 * @returns {void}
	 */
	Empty() {
		Dom.Empty(this.Elem("root"));
		
		this._items = [];
		
		if (!this._ph) return;
		
		Dom.Place(this._ph, this.Elem("root"));
	
		this._ph.selected = true;
	}
});