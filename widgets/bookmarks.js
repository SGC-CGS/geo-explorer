import Templated from '../components/templated.js';
import Core from '../tools/core.js';

/**
 * Bookmarks widget module
 * @module widgets/bookmarks
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Bookmarks", class Bookmarks extends Templated {
	/** 
	 * Get / set the bookmarks from the config
	*/	
	set Bookmarks(value) { this._bookmarks = value; }

	get Bookmarks() { return this._bookmarks; }

	/** 
	 * Get / set the storage
	*/	
	set Storage(value) { this._storage = value; }

	get Storage() { return this._storage; }
	
	/** 
	 * @description Set the bookmarks widget and load any bookmarks from the config and / or storage.
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

		// If no storage mechanism set, only use the bookmarks from the config and disable editing
		if(this.Storage == undefined || this.Storage.storedContent == null) {
			this.bookmarksWidget.bookmarks = this.Bookmarks;
			this.bookmarksWidget.editingEnabled = false;
			return;
		}

		// Get stored bookmarks and any bookmark contexts from storage
		let storedBookmarks = JSON.parse(this.Storage.myStorage.getItem(this.Storage.key)).bookmarks;

		this.bookmarkContexts = JSON.parse(this.Storage.myStorage.getItem(this.Storage.key)).bookmarkContexts;

		// Save config to storage the first time the user loads the application
		if(storedBookmarks.length == 0) { 
			storedBookmarks = this.Bookmarks; 

			this.Storage.SetSection("bookmarks", storedBookmarks);
		}

		// Save the stored bookmarks to the widget
		this.bookmarksWidget.bookmarks = storedBookmarks;

		// Enable bookmark events
		this.bookmarksWidget.bookmarks.on("change", this.OnBookmark_Change.bind(this));
		this.bookmarksWidget.on("bookmark-select", this.OnBookmark_Select.bind(this));
		this.bookmarksWidget.on("bookmark-edit", this.OnBookmark_Edit.bind(this));
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
		// Serializer function required
		context = JSON.stringify(context, this.HandleCircularStructure());

		this.context = JSON.parse(context);
	}

	/**
	 * @description When a user adds, moves, or removes a bookmark, update the contents of the storage
	 * @param {*} ev - Event
	 */
	OnBookmark_Change(ev) {
		// Save the current context of the added bookmark to storage
		if (ev.added.length == 1) {
			this.bookmarkContexts.push({name: ev.added[0].name, context: this.context});

			this.Storage.SetSection("bookmarkContexts", this.bookmarkContexts);
		}

		// Filter out the removed bookmark from the context in storage
		if (ev.removed.length == 1) {
			this.bookmarkContexts = this.bookmarkContexts.filter(b => b.name != ev.removed[0].name)

			this.Storage.SetSection("bookmarkContexts", this.bookmarkContexts);
		}

		let bookmarks = this.WorkAroundBookmarkToJSON(this.bookmarksWidget.bookmarks.items)
			
		this.Storage.SetSection("bookmarks", bookmarks);
	}

	/**
	 * @description If a selected bookmark has context, change to it's context.
	 * @param {*} ev - Event
	 */
	OnBookmark_Select(ev) {
		this.selectedBookmarkContext = this.bookmarkContexts.map(e => e.name).indexOf(ev.bookmark.name);

		if(this.selectedBookmarkContext != -1) {
			this.ChangeContext(this.bookmarkContexts[this.selectedBookmarkContext].context); 
		}
	}

	/**
	 * @description When a bookmark name is edited, update the bookmark and context collection
	 * in the storage
	 * @param {*} ev 
	 */
	OnBookmark_Edit(ev) {
		let bookmarks = this.WorkAroundBookmarkToJSON(this.bookmarksWidget.bookmarks.items)
			
		this.Storage.SetSection("bookmarks", bookmarks);

		if(this.selectedBookmarkContext != -1) {
			this.bookmarkContexts[this.selectedBookmarkContext].name = ev.bookmark.name;

			this.Storage.SetSection("bookmarkContexts", this.bookmarkContexts);
		}
	}

	WorkAroundBookmarkToJSON(bookmarks) {
		let bookmarksToJSON = []; 

		bookmarks.forEach(bookmark => {
			let b = bookmark.toJSON();

			b.viewpoint.targetGeometry.type = "extent";

			bookmarksToJSON.push(b);
		});

		return bookmarksToJSON;
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
	 * @description Notify the application that the context has changed given a selected bookmark
	 * @param {*} context 
	 */
	 ChangeContext(context) {
		Object.assign(this.circularContext, context); 

		this.Emit("Busy");

		// REVIEW: This should not be done here, it should be in application.js
		// Bookmarks should only notify that something has been selected.

		// Saw this in selector.js
		this.circularContext.UpdateRenderer().then(c => {
			this.Emit("Idle");
		
			this.circularContext.Commit();
			
			this.Emit("Change", { context: this.circularContext });
		});
	}

	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
	Template() {
		return "<div handle='content'></div>";
	}
})