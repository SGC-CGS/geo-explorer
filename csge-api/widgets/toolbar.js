import Widget from '../components/base/widget.js';
import EsriWidget from '../components/base/esri-widget.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Overlay from '../widgets/overlay.js';

/**
 * Search widget module
 * @module widgets/search
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.Toolbar", class wToolbar extends Widget {
	
	/**
	 * Get/set the widgets
	 * @type {object}
	 */
	get items() { return this._items; }

	get current() { return this._current; }
	set current(value) { this._current = value; }
	
	get buttons() {
		return Object.values(this.items)
					 .filter(i => !!i.button)
					 .map(i => i.button);
	}
	
	get widgets() {
		return Object.values(this.items)
					 .filter(i => !!i.widget)
					 .map(i => i.widget);
	}
	
	get overlays() {
		return Object.values(this.items)
					 .filter(i => !!i.overlay)
					 .map(i => i.overlay);
	}
	
	get roots() {
		var roots = super.roots;
		
		this.overlays.forEach(o => roots = roots.concat(o.roots));
		
		return roots;
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize search widget
	 * @param {object} container - div container and properties
	 * @returns {void}
	 */
	constructor(...config) {	
		super(...config);
		
		this._current = null;
		this._items = {};
	}
	
	Configure(css) {
		Dom.AddCss(this.Elem("menu"), css);
	}
	
	Localize(nls) {
		nls.Add("Widget_Disabled", "en", "Widget unavailable until a map selection is made.");
		nls.Add("Widget_Disabled", "fr", "Le widget n'est pas disponible jusqu'à ce qu'une sélection soit faite sur la carte.");
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
	 * Adds an esri widget on the map.
	 * @param {string} id - Widget Id (ex. "selector")
	 * @param {object} widget - Widget to load in the overlay
	 * @returns {void}
	 */
	AddEsriWidget(id, widget) {		
		var item = { widget:new EsriWidget(widget) };
		
		widget.view.ui.add(item.widget.wrapped, "manual");
		
		Dom.Place(item.widget.wrapped.domNode, this.Elem("menu"));
		
		this.AddItem(id, item);
		
		return widget;
	}
	
	/**
	 * Overlay widget buttons
	 * @param {string} id - button id
	 * @param {string} title - Title to apply to the overlay
	 * @param {object} overlay - Overlay object with all properties
	 * @returns {void}
	 */
	AddOverlay(id, widget) {		
		var overlay = new Overlay(widget, widget.title);
		var opt = { title:widget.title, className:`button-icon large-icon ${id}` };
		var btn = Dom.Create("button", opt, this.Elem("menu"));
		var item = { button:btn, overlay:overlay/*, widget:overlay.widget*/, title:widget.title, };
		
		btn.addEventListener("click", this.OnMenuButton_Click.bind(this, item));
		
		widget.On("Close", this.OnOverlay_Hide.bind(this, id));
		overlay.On("Close", this.OnOverlay_Hide.bind(this, id));
		
		this.AddItem(id, item);
		
		return widget;
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
	 * Gets overlay object from items for specified id
	 * @param {string} id - Overlay ID
	 * @returns {object} overlay object
	 */
	Overlay(id) {
		return this.Item(id).overlay;
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
	 * Get overlay widget for id
	 * @param {object} id - Item object for Id
	 * @returns {object} Overlay widget
	 */
	Widget(id) {
		return this.Item[id].widget;
	}

	/**
	 * Disable an overlay widget button and update properties
	 * @param {*} button - An overlay widget button
	 * @param {*} title - The message to show for the disabled button
	 */
	DisableButton(id) {
		var button = this.Button(id);
		
		button.disabled = true;
		button.title = this.Nls("Widget_Disabled");
		
		if (this.current && button == this.current.button) {
			this.ToggleOverlay(this.Item(id));
		}
	}
	
	/**
	 * Enable an overlay widget button and update properties
	 * @param {*} button - An overlay widget button
	 * @param {*} title - The message to show for the enabled button
	 */
	EnableButton(id) {
		var button = this.Button(id);
		
		button.disabled = false;
		button.title = this.Item(id).title;
	}
	
	/**
	 * Show the overlay for the currently selected button
	 * @param {object} item - Button and overlay
	 * @returns {void}
	 */
	ToggleOverlay(item) {
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
	
	/**
	 * Set the overlay when the user clicks a menu button
	 * @param {object} item - Button and overlay
	 * @param {object} ev - event
	 * @returns {void}
	 */
	OnMenuButton_Click(item, ev) {
		this.ToggleOverlay(item);
	}	
	
	/**
	 * Hide overlay and reset current button
	 * @param {object} item - Button and overlay
	 * @param {object} ev - event
	 * @returns {void}
	 */
	OnOverlay_Hide(id, ev) {
		this.HideOverlay(this.Item(id));
		
		this.current = null;
	}
	
	/**
	 * Show widget in map overlay.
	 * @param {string} id - Widget Id (ex. "selector")
	 * @returns {void}
	 */
	ShowWidget(id) {
		var item = this.Item(id);
		
		this.ToggleOverlay(item);
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */
	HTML() {        
		return "<div handle='menu' class='menu'></div>";
	}
})