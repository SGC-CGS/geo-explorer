import Widget from '../../components/base/widget.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

/**
 * Typeahead module
 * @module ui/typeahead/typeahead
 * @extends Widget
 */
export default Core.Templatable("Api.Components.Typeahead", class Typeahead extends Widget {
	
	/**
	 * Set placeholder value
	 */
    set placeholder(value) { this.Elem('input').setAttribute('placeholder', value); }
	
	/**
	 * Set title value
	 */
	set title(value) { this.Elem('input').setAttribute('title', value); }
	
	/**
	 * Set matching values in list
	 */
	set store(value) {		
		this._store = value.map(i => {
			var li = Dom.Create("li", { innerHTML : i.label, tabIndex : -1 });
			var item = { data:i, node:li, next:null, prev:null };
			
			li.addEventListener("mousedown", this.onLiClick_Handler.bind(this, item));
			
			return item; 
		});
		
		// Initially unfiltered
		this._items = this._store;
		this._item = null;
	}
	
	/**
	 * Get/set select box item
	 */
	get item() {
		return this._item;
	}
	
	set item(value) {
		this._item = value;
	}
	
	/**
	 * Get/set select box value
	 */
	get value() {
		return this.item && this.item.value || null;
	}

	set value(item) { this.item = item; }
	
	/**
	 * Get select box label
	 */
	get label() {
		return this.item && this.item.label || null;
	}

	/**
	 * Get/set disabled input box
	 */
	set disabled(value) {
		this.Elem('input').disabled = value;
	}
	
	get disabled() {
		return this.Elem('input').disabled;
	}

	/**
	 * Get / set the value required to show possible matches.
	 * In DynamicTypeahead since there are calls to a DB, you want to avoid
	 * returning to many possible matches so wait until the user enters 3 characters. 
	 * In a StaticTypeahead you should should possible matches whenever character are entered.
	 */
	get minCharacters() {
		return this._matches;
	}
	
	set minCharacters(value) {
		this._matches = value;
	}
	
	/**
	 * Call constructor of base class and initialize typeahead
	 * @param {object} container - div container and properties
	 * @returns {void}
	 */		
	constructor(...config) {	
		super(...config);
		
		this._store = null;
		this._items = null;
		this._item = null;
		this._temp = null;
		this._matches = 3;
		
		var handler = function(ev) { this.OnInputInput_Handler(ev); }.bind(this);
		
		this.Node("input").On("input", Core.Debounce(handler, 350));	

		// this.Node("input").On("click", this.OnInputClick_Handler.bind(this));
		this.Node("input").On("keydown", function(ev) { this.OnInputKeyDown_Handler(ev); }.bind(this));		
		this.Node("input").On("blur", function(ev) { this.OnInputBlur_Handler(ev); }.bind(this));		
		this.Node("input").On("focusin", function(ev) { this.OnInputClick_Handler(ev); }.bind(this));		
		// this.Node("input").On("focusout", this.OnInputBlur_Handler.bind(this));
	}
		
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Search_Typeahead_Title", "en", "A Filtered list of items will appear as characters are typed.");
		nls.Add("Search_Typeahead_Title", "fr", "Une liste filtr??e d'objets appara??tra lorsque des caract??res seront saisis.");
		nls.Add("Search_Typeahead_Placeholder", "en", "Find a place on the map...");
		nls.Add("Search_Typeahead_Placeholder", "fr", "Rechercher un endroit sur la carte...");
		nls.Add("Search_Typeahead_loading", "en", "loading...");
		nls.Add("Search_Typeahead_loading", "fr", "en chargement...");
	}
	
	/**
	 * Remove all elements from match list
	 * @returns {void}
	 */
	Empty() {		
		Dom.Empty(this.Elem("list"));
		
		this._items = [];
	}
	
	/**
	 * Not currently used
	 * @returns {void}
	 */
	Refresh() {
		throw new Error("The Refresh function must be implemented.");
	}
	
	/**
	 * Populate match list in HTML
	 * @param {object[]} items - List of items matching search
	 * @param {string} mask - Search string
	 * @returns {void}
	 */
	Fill(items, mask) {
		this._items = items;
		
		var frag = document.createDocumentFragment();
		
		for (var i = 0; i < items.length; i++) {
			var curr = items[i];
			
			// Maybe insert <b> at right index instead, faster?
			curr.node.innerHTML = curr.data.label.replace(mask, `<b>${mask}</b>`);
			curr.next = items[(i + 1) % items.length];
			curr.next.prev = curr;
		
			Dom.Place(curr.node, frag);
		}
		
		Dom.Place(frag, this.Elem("list"));
	}
	
	/**
	 * Show/hide match list under search box
	 * @returns {void}
	 */
	UpdateCss() {		
		Dom.ToggleCss(this.Elem("root"), "collapsed", this._items.length ==??0);
	}
	
	/**
	 * Finds an item in the typeahead using a delegate function
	 * @param {function} delegate  - Delegate function
	 * @returns {void}
	 */
	Select(delegate) {		
		for (var i = 0; i??< this._items.length; i++) {
			if (delegate(this._items[i].data, i)) break;
		}
		
		this.item = this._items[i].data;
		
		this.Elem("input").value = this.label;
	}
		
	/**
	 * Empty match list and populate search box after user makes a selection
	 * @returns {void}
	 */
	Reset() {
		if (this._temp) Dom.SetCss(this._temp.node, "");
		
		this._temp = null;
		
		this.Empty();
		
		this.Elem("input").value = this.item ? this.label : "";
	}
	
	/**
	 * Refresh list of possible matches when use types a search term
	 * @param {object} ev - Input event object
	 * @returns {void}
	 */
	OnInputInput_Handler(ev) {
		var value = ev.target.value;
		
		if (value.length < this.minCharacters) return;
		
		this.Empty();
		
		this.Refresh(value).then(items =>??{ 
			this.Fill(items, value);
		
			this.UpdateCss();
		});
	}
	
	/**
	 * Fill possible search values when input box is clicked
	 * @param {object} ev - Focus event object
	 * @returns {void}
	 */
	OnInputClick_Handler(ev) {
		if (ev.target.value.length <??this.minCharacters) return;

		this.Elem("input").value = ev.target.value.substring(0, this.minCharacters);

		this.Refresh(this.Elem("input").value).then(items =>??{ 
			this.Fill(items, ev.target.value);

			this.UpdateCss();
		});
	}
	
	/**
	 * Handles entry of any special keys in search box
	 * @param {object} ev - Keyboard event object
	 * @returns {void}
	 */
	OnInputKeyDown_Handler(ev) {		
		// prevent default event on specifically handled keys
		if (ev.keyCode == 40 || ev.keyCode == 38 || ev.keyCode == 13 || ev.keyCode == 27) ev.preventDefault();

		// shift + up : select text
		if (ev.shiftKey == true &&  ev.keyCode == 38)  this.nodes.Input.select();
		
		// up or down key : cycle through dropdown
		else if (ev.keyCode == 40 || ev.keyCode == 38 ) {	
			this._temp = this._temp || this._items[this._items.length - 1];
			
			Dom.SetCss(this._temp.node, "");
			
			this._temp = (ev.keyCode == 40) ? this._temp.next : this._temp.prev;
			
			this.Elem("input").value = this._temp.data.label;
			
			this.ScrollTo(this._temp);
			
			Dom.SetCss(this._temp.node, "active");
		}

		// enter : select currently focused
		else if (ev.keyCode == 13){
			// if an item is currently selected through arrows, select that one
			if (this._temp) this.onLiClick_Handler(this._temp);
			
			// if a filtered list is being shown, select the first item
			else if (this._items.length > 0) this.onLiClick_Handler(this._items[0]);

			// nothing is selected (don't think this can happen		    	
			else {				
				this.OnInputClick_Handler({ target:this.Elem("input") });
			}
		}

		// if escape key
		else if (ev.keyCode == 27) this.OnInputBlur_Handler();	
	}
	
	/**
	 * Reset match list when user leaves search input field
	 * @param {object} ev - Focus event object
	 * @returns {void}
	 */
	OnInputBlur_Handler(ev) {			
		this.Reset();

		this.UpdateCss();
	}
	
	/**
	 * When user clicks on an item in the list of possible search term matches, update selection and emit change event.
	 * @param {object} item - Selected item details
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	onLiClick_Handler(item, ev) {
		//ev.stopPropagation();
		if (ev != undefined) ev.preventDefault();
		
		this.item = item.data;
		
		this.Reset();
		
		this.UpdateCss();
		
		this.Emit("Change", { item:item.data });
	}
	
	/**
	 * Allow scrolling through list of matches
	 * @param {object} item - Navigation object of items in match list
	 * @returns {void}
	 */
	ScrollTo(item) {				
		// create rectangles to know the position of the elements
		var ul = this.Elem("list");
		var liBx = item.node.getBoundingClientRect();
		var ulBx = ul.getBoundingClientRect();
		
		//if the element is in this range then it is inside the main container, don't scroll
		if (liBx.bottom >??ulBx.bottom) ul.scrollTop = ul.scrollTop + liBx.bottom - ulBx.top - ulBx.height;
		
		else if (liBx.top < ulBx.top) ul.scrollTop = ul.scrollTop + liBx.top - ulBx.top;
	}
	
	/**
	 * Create HTML for typeahead input box
	 * @returns {string} HTML for typeahead input box
	 */	
	HTML() {        
		return "<div handle='root' class='typeahead collapsed'>" +
				 "<input handle='input' type='text' class='input' placeholder='nls(Search_Typeahead_Placeholder)' title='nls(Search_Typeahead_Title)'>" + 
				 "<i class='fa fa-chevron-down'></i>" +
			     "<ul handle='list' class='list'></ul>" +
			   "</div>";
	}
})