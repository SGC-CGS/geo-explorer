 'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

export default class Main { 

	constructor(map) {				
		this.current = null;
		this.items = {};
		
		this.map = map;
	}
	
	Item(id) {
		return this.items[id];
	}
	
	Button(id) {
		return this.Item[id].button;
	}
	
	Overlay(id) {
		return this.Item[id].overlay;
	}
	
	AddItem(id, item) {
		if (this.items.hasOwnProperty(id)) throw new Error(`Item with id ${id} already exists in menu.`);
		
		this.items[id] = item;
	}
	
	AddOverlay(id, title, overlay) {
		var item = {
			button : Dom.Create("button", { title:title, className:`button-icon large-icon ${id}` }),
			overlay : overlay
		}
		
		this.AddItem(id, item);
		
		item.button.addEventListener("click", this.OnMenuButton_Click.bind(this, item));
		
		overlay.On("Close", this.OnOverlay_Hide.bind(this, item));
		
		// Move the buttons to the ArcGIS Menu top-left.
		// this.map.Place(item.button, "top-left");
	}
	
	OnMenuButton_Click(item, ev) {
		this.SetOverlay(item);
	}	
	
	OnOverlay_Hide(item, ev) {
		this.HideOverlay(item);
	}
	
	SetOverlay(item) {
		if (this.current) this.HideOverlay(this.current);
		
		this.current = (this.current == item) ? null : item;
		
		if (this.current) this.ShowOverlay(this.current);
	}
	
	HideOverlay(item) {
		item.overlay.Hide();
		
		Dom.RemoveCss(item.button, "checked");
	}
	
	ShowOverlay(item) {		
		item.overlay.Show();
		
		Dom.AddCss(item.button, "checked");
	}
}