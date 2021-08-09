'use strict';

import Widget from '../geo-explorer-api/components/base/widget.js';
import Map from '../geo-explorer-api/components/map.js';
import Storage from '../geo-explorer-api/components/storage.js';
import SelectBehavior from '../geo-explorer-api/behaviors/rectangle-select.js';
import Selection from './components/selection.js';
import Waiting from '../geo-explorer-api/widgets/waiting.js';
import Navbar from '../geo-explorer-api/widgets/navbar.js';
import Table from './widgets/table.js';
import Search from './widgets/search.js';
import InfoPopup from './widgets/infopopup.js';
import Toolbar from './widgets/wToolbar.js';
import Context from './components/context.js';

/**
 * Application module
 * @module application
 * @extends Widget
 */
export default class Application extends Widget { 
	
	/**
	 * Get/set context from config
	 */
	get context() { return this._context; }
	
	set context(value) { this._context = value; }

	/**
	 * Get current behavior
	 */
	get behavior() { return "selection"; }

	/**
	 * Call constructor of base class (Templated) and initialize application
	 * @param {object} node - Application div
	 * @param {object} config - Configuration data
	 * @returns {void}
	 */
	constructor(container, config) {		
		super(container, null, null);

		this.config = config;
		this.context = new Context(config.context);
		this.storage = new Storage("CSGE");
		this.selection = new Selection();

		// Build map, menus, widgets and other UI components
		this.map = new Map(this.Elem('map'), this.config.map.options);

		this.infoPopup = new InfoPopup();
		this.infoPopup.Configure(this.config.infopopup, this.map, this.context);
		
		this.toolbar = new Toolbar();
		this.toolbar.Configure(this.config, this.map, this.storage);

		this.navbar = new Navbar();
		this.navbar.Configure(this.map);
		
		for (var id in this.toolbar.widgets) this.AddElem(id, this.toolbar.widgets[id]);
		
		this.Elem("table").Configure(this.config.table);
		this.Elem("styler").Configure(this.config.styler, this.context);
		
		this.map.Place([this.Elem("search").container], "manual");
		this.map.Place([this.Elem("waiting").container], "manual");
		
		// Hookup events to UI
		this.HandleEvents(this.map);
		this.HandleEvents(this.context);
		this.HandleEvents(this.Node('selector'), this.ChangeContext.bind(this));
		this.HandleEvents(this.Node('bookmarks'), this.ChangeContext.bind(this));
		this.HandleEvents(this.Node('search'), this.OnSearch_Change.bind(this));
		this.HandleEvents(this.Node('styler'), this.OnStyler_Change.bind(this));
		
		this.Node("table").On("RowClick", this.OnTable_RowClick.bind(this));
		this.Node("table").On("RowButtonClick", this.OnTable_RowButtonClick.bind(this));
		this.Node("styler").On('Opacity', this.OnStyler_Opacity.bind(this));
		this.Node("styler").On('LabelName', this.onStyler_LabelName.bind(this));
		
		this.map.AddMapImageLayer('main', this.config.map.url, this.config.map.opacity);

		// REVIEW: The NLS string for the title goes in application.js
		this.toolbar.menu.DisableButton(this.toolbar.menu.Button("chart"));

		this.context.Initialize(config.context).then(d => {	
			this.map.AddSubLayer('main', this.context.sublayer);

			this.Elem("selector").Update(this.context);
			this.Elem("styler").Update(this.context);
			this.Elem("table").Update(this.context);
			this.Elem("bookmarks").Update(this.context);
			
			this.toolbar.ShowWidget("selector");

			this.AddSelectBehavior(this.map, this.context, this.config);
		}, error => this.OnApplication_Error(error));
	}

	/**
	 * Adds the behavior and handles the event for generating popup and table from map selection.
	 * Also handles disabling / enabling the "view chart" button.
	 * @param {object} map - Map object to which the behavior will be applied
	 * @param {object} context - Context object for retrieving the sublayer
	 * @param {object} config - Configuration data
	 * @returns {void}
	 */
	 AddSelectBehavior(map, context, config) {
		// REVIEW: No way to `esc` from rectangle select
		var behavior = this.map.AddBehavior("selection", new SelectBehavior(map));

		behavior.target = context.sublayer;
		behavior.field = "GeographyReferenceId";
		behavior.symbol = config.symbols["selection"];

		behavior.Activate();

		map.EnableHitTest(behavior);

		this.MapViewEventsHandler();

		this.HandleEvents(behavior, ev => {
			this.Elem("table").data = ev.selection; 
			this.Elem("chart").data = ev.selection;

			// REVIEW: Reading titles and labels from widgets like this will get confusing. We should have a central place 
			// where we can get them. Context probably. We could also just call an UpdateSelection function on each widget
			// and provide the selection object similar to what we do when the context changes.
			this.Elem("chart").linkTitle = this.infoPopup.GetLink();
			
			if (ev.selection.items.length == 0) {		
				this.Elem("chart").description = "";
				this.toolbar.menu.Overlay("chart").title = "";
				this.toolbar.menu.DisableButton(this.toolbar.menu.Button("chart"));
			} 
			
			else if (this.toolbar.menu.Button("chart").disabled == true) {
				this.Elem("chart").description = this.Elem("table").title + " (" + this.Elem("chart").data[0].uom + ")";
				this.toolbar.menu.Overlay("chart").title = this.Elem("chart").linkTitle;
				this.toolbar.menu.EnableButton(this.toolbar.menu.Button("chart"), this.Elem("chart").title);
			}
		});	

		this.HandleEvents(this.Elem("chart").chart, ev => {
			if (this.highlight || ev.hovered == null) {
				this.selection.ClearGraphicHighlight();
				return;
			} 

			this.selection.HighlightTargetGraphic(ev.hovered, this.Elem("chart").config.field);
		});
    }

	MapViewEventsHandler() {
		this.map.view.on("layerViewCreated", (ev) => {
			this.selection.layerView = ev.layerView;
		});

		// When exiting the map view, remove all highlights and close the popup 
		this.map.view.on("PointerLeave", (ev) => {
			this.selection.ClearAll(this.map.popup);
		});

		this.map.view.on("PointerMove", (ev) => {
			// All the below code in the selection class
			this.selection.layerView = ev.layerView;

			// The selected graphic has changed and there is a highlight on the previous graphic
			if (this.selection.graphic != ev.graphic && this.selection.highlight) {
				// REVIEW: Why go through the selection to clear chart if we're doing it from application.js?
				this.selection.ClearGraphicHighlight();
				this.selection.ClearChartElementHighlight();
			}

			// The selected graphic has changed
			else if (this.selection.graphic != ev.graphic) {
				this.selection.graphic = ev.graphic;
				// REVIEW: Same as above
				// i.e, Do this.Elem("chart").Highlight();
				this.selection.HighlightGraphic(this.selection.graphic);
				this.selection.HighlightChartElement(this.Elem("chart").chart, this.Elem("chart").config.field);

				this.infoPopup.Show(this.map.view.toMap(ev.response.screenPoint), this.selection.graphic);
			}

			// Update the popup position if the current graphic is highlighted
			else if (this.selection.highlight) {
				this.map.view.popup.location = this.map.view.toMap(ev.response.screenPoint);
			} 

			// The current graphic is not highlighted
			else if (!this.selection.highlight) {
				this.selection.HighlightGraphic(this.selection.graphic);
				this.selection.HighlightChartElement(this.Elem("chart").chart, this.Elem("chart").config.field);

				this.infoPopup.Show(this.map.view.toMap(ev.response.screenPoint), this.selection.graphic);
			}
		});
	}

	/**
	 * Handle events for the specified node..
	 * @param {object} node - Node to which the event handler will be added (ex. Map)
	 * @param {object} changeHandler - Change handler that will be added if specified
	 * @returns {void}
	 */
	HandleEvents(node, changeHandler) {
		if (changeHandler) node.On('Change', changeHandler);
		
		node.On('Busy', this.OnWidget_Busy.bind(this));
		node.On('Idle', this.OnWidget_Idle.bind(this));
		node.On('Error', ev => this.OnApplication_Error(ev.error));
	}

	ChangeContext(ev) {
		this.map.EmptyLayer('main');
		this.map.AddSubLayer('main', this.context.sublayer);

		this.map.Behavior("selection").target = this.context.sublayer;

		this.Elem("bookmarks").Update(this.context);
		this.Elem("styler").Update(this.context);
		this.Elem("table").Update(this.context);

		this.toolbar.menu.DisableButton(this.toolbar.menu.Button("chart"));
	}
	
	OnStyler_Change(ev) {	
		this.context.sublayer.renderer = ev.renderer;
	}
	
	OnStyler_Opacity(ev) {
		this.map.Layer('main').opacity = ev.opacity;
	}

	/**
	 * Show or hide the map labels.
	 * @param {object} ev - Event object
	 * @returns{void}
	 */
	onStyler_LabelName(ev) {
		this.map.Layer("main").findSublayerById(this.context.sublayer.id).labelsVisible = ev.checked;
	}

	OnSearch_Change(ev) {		
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnTable_RowClick(ev) {
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnTable_RowButtonClick(ev) {
		this.map.Behavior("selection").layer.remove(ev.graphic);
		this.Elem("table").data = this.map.Behavior("selection").graphics;
		this.Elem("chart").data = this.map.Behavior("selection").graphics;

		// REVIEW: This code is a repeat
		if (this.map.Behavior("selection").graphics.items.length == 0) {
			this.Elem("chart").description = this.Elem("chart").disabledTitle;
			this.toolbar.menu.Overlay("chart").title = this.Elem("chart").title;
			this.toolbar.menu.DisableButton(this.toolbar.menu.Button("chart"), this.Elem("chart").disabledTitle);
	   }
	}
	
	OnWidget_Busy(ev) {
		this.Elem("waiting").Show();
	}
	
	OnWidget_Idle(ev) {
		this.Elem("waiting").Hide();
	}
	
	OnApplication_Error(error) {
		alert(error.message);
		
		console.error(error);
	}

	/**
	 * Show or hide the map labels.
	 * @param {object} ev - Event object
	 * @returns{void}
	 */
	HTML() {
		return	"<div handle='search' class='search' widget='App.Widgets.Search'></div>" +
				"<div handle='map-container' class='map-container'>" +
					"<div handle='map'></div>" +
					"<div handle='waiting' class='waiting' widget='Api.Widgets.Waiting'></div>" +
				"</div>" +
			    "<div handle='table' class='table' widget='App.Widgets.Table'></div>"
	}
}