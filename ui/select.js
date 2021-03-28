'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

import Templated from '../components/templated.js';

export default Core.Templatable("Basic.Components.Select", class Select extends Templated {
	
	get value() {
		return this.Elem("root").value;
	}
	
	set value(value) {
		this.Elem("root").value = value;
	}
	
	set disabled(value) {
		this.Elem("root").disabled = value;
	}
	
	get disabled() {
		return this.Elem("root").disabled;
	}
	
	get selected() {
		var i = this.Elem("root").value;
		
		return this._items[i];
	}
	
	set placeholder(value) {
		this._ph = Dom.Create("option", { innerHTML:value, value:-1, className:"select-placeholder" });
		
		this._ph.disabled = true;
		this._ph.selected = true;
		
		this.Elem("root").insertBefore(this._ph, this.Elem("root").firstChild);
	}
	
	constructor(container, options) {
		super(container, options);
		
		this._items = [];
		
		this._ph = null;
		
		this.Node("root").On("change", this.OnSelect_Change.bind(this));
	}
	
	Add(label, title, item) {
		Dom.Create("option", { innerHTML:label, value:this._items.length, title:title }, this.Elem("root"));
		
		this._items.push(item);
	}
	
	Select(delegate) {		
		this.value = this.FindIndex(delegate);
	}
	
	FindIndex(delegate) {
		for (var i = 0; i < this._items.length; i++) {
			if (delegate(this._items[i], i)) return i;
		}
		
		return -1;
	}
	
	OnSelect_Change(ev) {
		var item = this._items[ev.target.value];
		
		this.Emit("Change", { index:ev.target.value, item:item, label:ev.target.innerHTML });
	}
	
	Template() {
		return '<select handle="root"></select>';
	}
	
	Empty() {
		Dom.Empty(this.Elem("root"));
		
		this._items = [];
		
		if (!this._ph) return;
		
		Dom.Place(this._ph, this.Elem("root"));
	
		this._ph.selected = true;
	}
});