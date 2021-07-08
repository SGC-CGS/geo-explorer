import Templated from '../components/templated.js';
import Core from '../tools/core.js';

/**
 * Bookmarks widget module
 * @module widgets/bookmarks
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Bookmarks", class Bookmarks extends Templated {
	/** 
	 * Get / set the storage 
	*/	
	set Storage(value) { this._storage = value; }

	get Storage() { return this._storage; }
	
	/** 
	 * @description Set the bookmarks widget and load any bookmarks from local or session storage.
	 * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Bookmarks.html|ArcGIS API for JavaScript}
	 * @type {object} 
	*/
	set Map(value) { 
		this.map = value; 
				
        this.bookmarksWidget = new ESRI.widgets.Bookmarks({
			// Allows bookmarks to be added, edited, or removed
			editingEnabled: true,
			view: this.map.view,
			container: this.Elem("content"),
			bookmarks: [],
			bookmarkCreationOptions: {
				takeScreenshot: false,
				captureViewpoint: true,
			  }
        });

		// REVIEW: Stored bookmarks should be at the top because they are priority and only their order should be preserved
		// REVIEW: We cannot preserve order of the bookmarks from config and I do not think we should
		if(this.Storage != undefined) {
			this.storedBookmarks = JSON.parse(this.Storage.myStorage.getItem(this.Storage.key)).bookmarks;

			this.bookmarksWidget.bookmarks = this.storedBookmarks;

			this.bookmarksWidget.bookmarks.on("change", this.OnBookmark_Change.bind(this));
			this.bookmarksWidget.on("bookmark-select", this.OnBookmark_Select.bind(this));
			this.bookmarksWidget.on("bookmark-edit", this.OnBookmark_Edit.bind(this));
		}
	}
	
	/** 
	 * @description Set the bookmark values. These values are not saved to local storage.
	 * @param {Array} value 
	*/	
	set Bookmarks(value) {
		value.forEach(v => { this.bookmarksWidget.bookmarks.push(v); });
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

		this.storedBookmarks = null;
	}

	/**
	 * @description Load / update data regarding the current context
	 * @param {*} context 
	 */
	Update(context) { 
		this.circularContext = context;

		// REVIEW: I think we can just have a ToJson function on the context object. 
		// We can't

		// Required since bookmarks should not hold circular references in web storage
		// Serializer function required
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
	OnBookmark_Change(ev) {
		// REVIEW: Use SetSection instead of AddItem RemoveItem. The internal, ESRI bookmarks widget
		// should be able to give you all the current bookmarks. You may have to keep an association
		// of contexts.

		// REVIEW: Why is cloning objects necessary? To be in a format accepted for storage objects (serialization)

		if(ev.moved.length != 0) {
			// New order of some of the bookmarks impacted
		}

		// Add item to local storage
		if (ev.added.length == 1) {
			let added = ev.added[0].toJSON();

			added.context = this.context;

			// REVIEW: Why do we have to keep setting the targetGeometry type?
			// REVIEW: Look into scale or point
			added.viewpoint.targetGeometry.type = "extent";

			this.storedBookmarks.push(added);

			this.Storage.SetSection("bookmarks", this.storedBookmarks);
		}

		// Remove item from local storage
		if(ev.removed.length == 1) {
			let removed = ev.removed[0].toJSON();

			this.storedBookmarks = this.storedBookmarks.filter(bookmark => bookmark.name != removed.name);

			this.Storage.SetSection("bookmarks", this.storedBookmarks);
		}
	}


	/**
	 * @description If a selected bookmark has context, change to it's context. 
	 * @param {*} ev - Event
	 */
	OnBookmark_Select(ev) {
		this.selected = ev;

		// Load context information if any
		for (let index = 0; index < this.storedBookmarks.length; index++) {
			let bookmark = this.storedBookmarks[index];

			if(bookmark.context != undefined && bookmark.name == this.selected.bookmark.name) {
				this.ChangeContext(bookmark.context);
			}
		}
	}

	/**
	 * @description Notify the application that the context has changed given a selected bookmark
	 * @param {*} context 
	 */
	 ChangeContext(context) {
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
	OnBookmark_Edit(ev) {
		// REVIEW: We can probably simplify all this json conversion once everything else is fixed

		for (let index = 0; index < this.storedBookmarks.length; index++) {
			let bookmark = this.storedBookmarks[index];

			if(bookmark.context != undefined && bookmark.name == this.selected.bookmark.name) {
				let updatedBookmark = JSON.parse(JSON.stringify(bookmark));

				updatedBookmark.name = ev.bookmark.name;

				this.storedBookmarks[index] = updatedBookmark;

				this.Storage.SetSection("bookmarks", this.storedBookmarks);
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