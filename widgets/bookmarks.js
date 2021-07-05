import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Storage from '../tools/storage.js';

/**
 * Bookmarks widget module
 * @module widgets/bookmarks
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Bookmarks", class Bookmarks extends Templated {
	// REVIEW: Move away from the hardcoded "CSGE"?
	// REVIEW: Why is cloning objects necessary?
	// REVIEW: Why do we have to keep setting the targetGeometry type?
	
	/** 
	 * @description Set the bookmarks widget and load any bookmarks from local or session storage.
	 * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Bookmarks.html|ArcGIS API for JavaScript}
	 * @type {object} 
	*/
	set Map(value) { 
		this.map = value; 

		let bookmarks = [];
		
		// REVIEW: Do this in the storage class, once.
		if(Storage.StorageAvailable(Storage.webStorageType)) {
			bookmarks = JSON.parse(Storage.webStorage.getItem("CSGE")).bookmarks;

			// REVIEW: This is strange. Is it necessary? 
			// REVIEW: Investigate whether we should be using points and scale rather than extent.
			bookmarks.forEach(s => s.viewpoint.targetGeometry.type = "extent");
		} 
		
        this.bookmarksWidget = new ESRI.widgets.Bookmarks({
			view: this.map.view,
			container: this.Elem("content"),
			bookmarks: bookmarks,
			// allows bookmarks to be added, edited, or removed
			editingEnabled: true
        });

		this.bookmarksWidget.bookmarks.on("change", this.onBookmarkChange.bind(this));
		this.bookmarksWidget.on("bookmark-select", this.onBookmarkSelect.bind(this));
		this.bookmarksWidget.on("bookmark-edit", this.onBookmarkEdit.bind(this));
	}
	
	/** 
	 * @description Set the bookmark values. These values are not
	 * saved to local or session storage.
	 * @param {Array} value 
	*/	
	set Bookmarks(value) {
		value.forEach(v => {
			this.bookmarksWidget.bookmarks.push(v);
		});
	}
	
	/**
	 * @description Return bookmarks button title in both languages
	 * @returns {object.<string, string>} Basemap titles for each language
	 */	
	static Nls(nls) {
		nls.Add("Bookmarks_Title", "en", "Bookmarks");
		nls.Add("Bookmarks_Title", "fr", "Géosignets");
	}
	
	/**
	 * @description Call constructor of base class (Templated) and initialize bookmarks
	 * @param {object} container - div.bookmarks and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)
	 * @returns {void}
	 */	
	constructor(container, options) {	
		super(container, options);
		
		this.bookmarksWidget = null;
	}

	/**
	 * @description Load / update data regarding the current context
	 * @param {*} context 
	 */
	Update(context) { 
		this.circularContext = context;

		// REVIEW: I think we can just have a ToJson function on the context object. 
		// Required since bookmarks should not hold circular references in web storage
		context = JSON.stringify(context, this.HandleCircularStructure());

		this.context = JSON.parse(context);
	}

	/**
	 * @description Handles circular references (if any)
	 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value|TypeError: cyclic object value}
	 */
	 // REVIEW: Shouldn't be necessary
	 HandleCircularStructure() {
		let seen = new WeakSet();
		return (key, value) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) return;

				seen.add(value);
			}
			return value;
		};
	}

	/**
	 * @description When a user adds or removes a bookmark, update the contents
	 * of the web storage
	 * @param {*} ev - Event
	 */
	 // REVIEW: Naming, OnBookmark_Change
	onBookmarkChange(ev) {
		// REVIEW: Use SetSection instead of AddItem RemoveItem. The internal, ESRI bookmarks widget
		// should be able to give you all the current bookmarks. You may have to keep an association
		// of contexts.
		// Add item to local storage
		if (ev.added.length == 1) {
			let added = JSON.parse(JSON.stringify(ev.added[0]));

			added.context = this.context;

			Storage.AddItem("CSGE", "bookmarks", added);
		}

		// Remove item from local storage
		if(ev.removed.length == 1) {
			let removed = JSON.parse(JSON.stringify(ev.removed[0]));

			let bookmarks = JSON.parse(Storage.webStorage.getItem("CSGE")).bookmarks;

			for (let index = 0; index < bookmarks.length; index++) {
				let bookmark = bookmarks[index];

				if(bookmark.name == removed.name) {
					Storage.RemoveItem("CSGE", "bookmarks", bookmark);
				}
			}
		}
	}


	/**
	 * @description If a selected bookmark has context, change to it's context. 
	 * @param {*} ev - Event
	 */
	 // REVIEW: Naming, OnBookmark_Select
	onBookmarkSelect(ev) {
		// REVIEW : Any reason for cloning like this?
		this.selected = JSON.parse(JSON.stringify(ev));

		// Load context information if any
		let bookmarks = JSON.parse(Storage.webStorage.getItem("CSGE")).bookmarks;

		for (let index = 0; index < bookmarks.length; index++) {
			let bookmark = bookmarks[index];

			if(bookmark.context != undefined && bookmark.name == this.selected.bookmark.name) {
				this.SwitchContextToSelectedBookmark(bookmark.context);
			}
		}
	}

	/**
	 * @description Notify the application that the context has changed given a selected bookmark
	 * @param {*} context 
	 */
	 // REVIEW: Naming, too long
	SwitchContextToSelectedBookmark(context) {
		Object.assign(this.circularContext, context); 

		this.Emit("Busy");

		// REVIEW: This should not be done here, it should be in application.js
		// Bookmarks should only notify that something has been selected.
		this.circularContext.UpdateRenderer().then(c => {
			this.Emit("Idle");
		
			this.circularContext.Commit();
			
			this.Emit("Change", { context: this.circularContext });
		});
	}

	/**
	 * @description When a bookmark name is edited, see if it is in web 
	 * storage and update the name. Custom bookmarks should hold some context. 
	 * @param {*} ev 
	 */
	 // REVIEW: Naming, OnBookmark_Edit
	onBookmarkEdit(ev) {
		// REVIEW: We can probably simplify all this json conversion once everything else is fixed
		let edited =  JSON.parse(JSON.stringify(ev));

		let bookmarks = JSON.parse(Storage.webStorage.getItem("CSGE")).bookmarks;

		for (let index = 0; index < bookmarks.length; index++) {
			let bookmark = bookmarks[index];

			if(bookmark.context != undefined && bookmark.name == this.selected.bookmark.name) {
				let updatedBookmark = JSON.parse(JSON.stringify(bookmark));

				updatedBookmark.name = edited.bookmark.name;

				Storage.UpdateItem("CSGE", "bookmarks", bookmark, updatedBookmark);
			}
		}
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
	Template() {
		return "<div handle='content'></div>";
	}
})