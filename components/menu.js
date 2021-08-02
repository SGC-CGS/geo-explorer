 'use strict';

import Component from './base/component.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

/**
 * Menu widget module
 * @module widgets/menu
 */
export default class Menu extends Component{ 

	/**
	 * gets list of buttons
	 */
	get buttons() {
		var buttons = [];
		
		for (var id in this.items) buttons.push(this.items[id].button);
		
		return buttons;
	}

	/**
	 * Initialize class variables
	 */
	constructor() {
		super();
		
		this.current = null;
		this.items = {};
	}
	
	/**
	 * Gets button from items for specified id
	 * @param {string} id - Button ID
	 * @returns {object} Button object
	 */
	Item(id) {
		return this.items[id];
	}
	
	/**
	 * Gets button HTML from items for specified id
	 * @param {string} id - Button ID
	 * @returns {string} HTML of button
	 */
	Button(id) {
		return this.Item(id).button;
	}
	
	/**
	 * Get overlay for id
	 * @param {object} id - Item object for Id
	 * @returns {object} Overlay
	 */
	Overlay(id) {
		return this.Item(id).overlay;
	}
	
	/**
	 * Get overlay widget for id
	 * @param {object} id - Item object for Id
	 * @returns {object} Overlay widget
	 */
	Widget(id) {
		return this.Item[id].overlay.widget;
	}
	
	/**
	 * Add specified item to menu
	 * @param {string} id - item id
	 * @param {object} item - button and overlay to add
	 * @returns {void}
	 */
	AddItem(id, item) {
		if (this.items.hasOwnProperty(id)) throw new Error(`Item with id ${id} already exists in menu.`);
		
		this.items[id] = item;
	}

	/**
	 * Add button to Dom
	 * @param {string} id - button id
	 * @param {string} title - title to apply to the button
	 * @returns {void}
	 */
	AddButton(id, title){
		var item = {
			button : Dom.Create("button", { title:title, className:`button-icon large-icon ${id}` })
		}
		
		this.AddItem(id, item);
	}
	
	/**
	 * Overlay widget buttons
	 * @param {string} id - button id
	 * @param {string} title - Title to apply to the overlay
	 * @param {object} overlay - Overlay object with all properties
	 * @returns {void}
	 */
	AddOverlay(overlay) {
		var item = {
			button : Dom.Create("button", { title:overlay.title, className:`button-icon large-icon ${overlay.id}` }),
			overlay : overlay
		}
		
		this.AddItem(overlay.id, item);
		
		item.button.addEventListener("click", this.OnMenuButton_Click.bind(this, item));
		
		overlay.widget.On("Close", this.OnOverlay_Hide.bind(this, item));
		overlay.On("Close", this.OnOverlay_Hide.bind(this, item));
	}
	
	/**
	 * Set the overlay when the user clicks a menu button
	 * @param {object} item - Button and overlay
	 * @param {object} ev - event
	 * @returns {void}
	 */
	OnMenuButton_Click(item, ev) {
		this.SetOverlay(item);
	}	
	
	/**
	 * Hide overlay and reset current button
	 * @param {object} item - Button and overlay
	 * @param {object} ev - event
	 * @returns {void}
	 */
	OnOverlay_Hide(item, ev) {
		this.HideOverlay(item);
		
		this.current = null;
	}
	
	/**
	 * Show the overlay for the currently selected button
	 * @param {object} item - Button and overlay
	 * @returns {void}
	 */
	SetOverlay(item) {
		if (this.current) this.HideOverlay(this.current);
		
		this.current = (this.current == item) ? null : item;
		
		if (this.current) this.ShowOverlay(this.current);
	}
	
	/**
	 * Hide the overlay and uncheck the specified item
	 * @param {object} item - Button and overlay
	 * @returns {void}
	 */
	HideOverlay(item) {
		item.overlay.Hide();
		
		Dom.RemoveCss(item.button, "checked");
	}
	
	/**
	 * Show the overlay and check the specified item
	 * @param {object} item - Button and overlay
	 * @returns {void}
	 */
	ShowOverlay(item) {		
		item.overlay.Show();
		
		Dom.AddCss(item.button, "checked");
	}
}