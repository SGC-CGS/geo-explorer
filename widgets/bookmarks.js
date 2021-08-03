import Widget from '../components/base/widget.js';
import Core from '../tools/core.js';

/**
 * Bookmarks widget module
 * @module widgets/bookmarks
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.Bookmarks", class Bookmarks extends Widget {

	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Bookmarks_Title") }
	
	/** 
	 * Get / set the storage
	*/	
	set storage(value) { this._storage = value; }

	get storage() { return this._storage; }
	
	/** 
	 * Get / set the bookmarks
	*/	
	set bookmarks(value) { this._bookmarks = value; }

	get bookmarks() { return this._bookmarks; }
		
	/**
	 * @description Call constructor of base class and initialize bookmarks
	 * @param {object} container - div.bookmarks and properties
	 * @returns {void}
	 */	
	constructor(container) {	
		super(container);
		
		this.bookmarksWidget = null;
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Bookmarks_Title", "en", "Bookmarks");
		nls.Add("Bookmarks_Title", "fr", "Géosignets");
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(config, map, storage) {
		this.storage = storage;
		
		this.config.items = config.items.map(b => {
			return {
				name : b.name,
				viewpoint : {
					targetGeometry: {
						type: "extent",
						xmin : b.extent[0][0],
						xmax : b.extent[1][0],
						ymin : b.extent[0][1],
						ymax : b.extent[1][1],
					}
				}
			}
		}); 
		
        this.bookmarksWidget = new ESRI.widgets.Bookmarks({
			// Allows bookmarks to be added, edited, or removed
			editingEnabled: true,
			view: map.view,
			container: this.Elem("content"),
			bookmarks: [],
			bookmarkCreationOptions: {
				takeScreenshot: false,
				captureViewpoint: true,
			}
        });

		// If no storage mechanism set, only use the bookmarks from the config
		// Note: removed the disable editing part. Editing needs to be on am individual 
		// bookmark basis which  ESRI does not support. We'll have to figure out something.
		var section = this.storage.GetSection("bookmarks")
		
		this.bookmarks = {
			items : section && section.items || this.config.items,
			contexts : section && section.contexts || []
		}

		// Save config to storage the first time the user loads the application
		if (!section) this.storage.SetSection("bookmarks", this.bookmarks);

		// Save the stored bookmarks to the widget
		this.bookmarksWidget.bookmarks = this.bookmarks;

		// Enable bookmark events
		this.bookmarksWidget.bookmarks.on("change", this.OnBookmark_Change.bind(this));
		this.bookmarksWidget.on("bookmark-select", this.OnBookmark_Select.bind(this));
		this.bookmarksWidget.on("bookmark-edit", this.OnBookmark_Edit.bind(this));
	}
	
	/**
	 * @description Load / update data regarding the current context
	 * @param {*} context 
	 */
	Update(context) { 
		this.context = context;
	}

	/**
	 * @description When a user adds, moves, or removes a bookmark, update the contents of the storage
	 * @param {*} ev - Event
	 */
	OnBookmark_Change(ev) {
		// Save the current context of the added bookmark to storage
		if (ev.added.length == 1) {
			this.bookmarks.contexts.push({name: ev.added[0].name, context: this.context.toJSON() });
		}

		// Filter out the removed bookmark from the context in storage
		if (ev.removed.length == 1) {
			this.bookmarks.contexts = this.bookmarks.contexts.filter(b => b.name != ev.removed[0].name);
		}
		
		this.bookmarks.items = this.WorkAroundBookmarkToJSON(this.bookmarksWidget.bookmarks.items);
		
		this.storage.SetSection("bookmarks", this.bookmarks);
	}

	/**
	 * @description If a selected bookmark has context, change to it's context.
	 * @param {*} ev - Event
	 */
	OnBookmark_Select(ev) {
		this.selected = this.bookmarks.contexts.find(e => e.name == ev.bookmark.name);

		if (!!this.selected) this.ChangeContext(this.selected.context); 
	}

	/**
	 * @description When a bookmark name is edited, update the bookmark and context collection
	 * in the storage
	 * @param {*} ev 
	 */
	OnBookmark_Edit(ev) {
		this.bookmarks.items = this.WorkAroundBookmarkToJSON(this.bookmarksWidget.bookmarks.items);

		if (this.selected != null) this.selected.name = ev.bookmark.name;
		
		this.storage.SetSection("bookmarks", this.bookmarks);
	}

	/**
	 * @description Bookmarks seems to strip the targetGeometry type after using toJSON, 
	 * so this is the work around. May be an issue in the ArcGIS JS API. 
	 * @param {*} bookmarks 
	 * @returns 
	 */
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
	 * @description Notify the application that the context has changed given a selected bookmark
	 * @param {*} context 
	 */
	 ChangeContext(context) {
		this.context.category = context.category;
		this.context.filters = context.filters;
		this.context.geography = context.geography;
		this.context.subject = context.subject;
		this.context.theme = context.theme;
		this.context.value = context.value;

		this.Emit("Busy");

		// REVIEW: Should be in application.js? Use an observer?		
		this.context.Initialize().then(response => {
			this.context.UpdateRenderer().then(c => {
				this.Emit("Idle");
			
				this.context.Commit();
				
				this.Emit("Change");
			});
		})
	}

	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
	HTML() {
		return "<div handle='content'></div>";
	}
})