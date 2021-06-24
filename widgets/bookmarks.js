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
	 * Set the bookmarks widget and load any bookmarks from local or session storage.
	 * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Bookmarks.html|ArcGIS API for JavaScript}
	 * @type {object} 
	*/
	set Map(value) { 
		this.map = value; 

		let bookmarks = [];
		
		if(Storage.StorageAvailable(Storage.webStorageType)) {
			bookmarks = JSON.parse(Storage.webStorage.getItem("CSGE")).bookmarks;

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
	 * Set the bookmark values. These values are not
	 * saved in local or session storage.
	 * @param {Array} value 
	*/	
	set Bookmarks(value) {
		value.forEach(v => {
			this.bookmarksWidget.bookmarks.push(v);
		});
	}
	
	/**
	 * Return bookmarks button title in both languages
	 * @returns {object.<string, string>} Basemap titles for each language
	 */	
	static Nls(nls) {
		nls.Add("Bookmarks_Title", "en", "Bookmarks");
		nls.Add("Bookmarks_Title", "fr", "Géosignets");
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize bookmarks
	 * @param {object} container - div.bookmarks and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)
	 * @returns {void}
	 */	
	constructor(container, options) {	
		super(container, options);
		
		this.bookmarksWidget = null;
	}

	/**
	 * Load data
	 * @param {*} context 
	 */
	Update(context) { 
		this.circularContext = context;

		context = JSON.stringify(context, this.HandleCircularStructure());

		this.context = JSON.parse(context);
	}

	/**
	 * Handles circular references (if any)
	 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value|TypeError: cyclic object value}
	 */
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
	 * When a user changes something in the bookmark widget, look for 
	 * the appropriate event (add or remove).
	 * @param {*} ev - Event
	 */
	onBookmarkChange(ev) {
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
	 * Check if the selected bookmark has context. Select also seems to 
	 * fire when you click the edit button.
	 * @param {*} ev - Event
	 */
	onBookmarkSelect(ev) {
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
	 * Notify the application that the context has changed
	 * @param {*} context 
	 */
	SwitchContextToSelectedBookmark(context) {
		Object.assign(this.circularContext, context); 

		this.Emit("Busy");

		this.circularContext.UpdateRenderer().then(c => {
			this.Emit("Idle");
		
			this.circularContext.Commit();
			
			this.Emit("Change", { context: this.circularContext });
		});
	}

	/**
	 * When a bookmark is edited, see if it is in local storage and update 
	 * @param {*} ev 
	 */
	onBookmarkEdit(ev) {
		let edited =  JSON.parse(JSON.stringify(ev));

		Storage.UpdateItem("CSGE", "bookmarks", this.selected.bookmark, edited.bookmark);
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
	Template() {
		return "<div handle='content'></div>";
	}
})