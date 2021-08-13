'use strict';

import SelectBehavior from '../geo-explorer-api/behaviors/rectangle-select.js';

import Widget from '../geo-explorer-api/components/base/widget.js';
import Map from '../geo-explorer-api/components/map.js';
import Storage from '../geo-explorer-api/components/storage.js';
import Selection from './components/selection.js';
import Context from './components/context.js';

import wToolbar from '../geo-explorer-api/widgets/toolbar.js';
import wWaiting from '../geo-explorer-api/widgets/waiting.js';
import wBookmarks from '../geo-explorer-api/widgets/bookmarks.js';
import wBasemap from '../geo-explorer-api/widgets/basemap.js';
import wTable from './widgets/table.js';
import wSearch from './widgets/search.js';
import wInfoPopup from './widgets/infopopup.js';
import wSelector from './widgets/selector.js';
import wStyler from './widgets/styler.js';
import wChart from './widgets/wChart.js';
import wExport from './widgets/wExport.js';

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
		super();
		
		this.container = container;
		this.config = config;
		
		this.context = new Context(config.context);
		this.storage = new Storage("CSGE");
		this.selection = new Selection();

		// Build map, menus, widgets and other UI components
		this.map = new Map(this.Elem('map'), this.config.map.options);
		
		this.map.AddMapImageLayer('main', this.config.map.url, this.config.map.opacity);
		
		this.toolbar = new wToolbar("tools");
		this.navbar = new wToolbar("navigation");
		
		this.widgets = {
			selector: this.toolbar.AddOverlay("selector", new wSelector()),		
			styler: this.toolbar.AddOverlay("styler", new wStyler(this.config.styler, this.context)),
			chart: this.toolbar.AddOverlay("chart", new wChart(this.config.chart)),
			export: this.toolbar.AddOverlay("export", new wExport(this.config.chart)),
			fullscreen: this.navbar.AddEsriWidget("fullscreen", new ESRI.widgets.Fullscreen({ view: this.map.view })),
			home: this.navbar.AddEsriWidget("home", new ESRI.widgets.Home({ view: this.map.view })),
			bookmarks: this.navbar.AddOverlay("bookmarks", new wBookmarks(this.config.bookmarks, this.map, this.storage)),
			basemap: this.navbar.AddOverlay("basemap", new wBasemap({ view: this.map.view })),
			search: new wSearch(),
			waiting: new wWaiting(),
			table: new wTable(this.config.table),
			infoPopup: new wInfoPopup(this.config.infopopup, this.map, this.context)
		}
		
		this.widgets.table.container = container;
		
		this.map.Place(this.widgets.search.roots, "manual");
		this.map.Place(this.widgets.waiting.roots, "manual");
		this.map.Place(this.toolbar.roots, "top-right");
		this.map.Place(this.navbar.roots, "top-left");
		
		// Hookup events to UI
		this.HandleEvents(this.map);
		this.HandleEvents(this.context);
		this.HandleEvents(this.widgets.selector, this.ChangeContext.bind(this));
		this.HandleEvents(this.widgets.bookmarks, this.ChangeContext.bind(this));
		this.HandleEvents(this.widgets.search, this.OnSearch_Change.bind(this));
		this.HandleEvents(this.widgets.styler, this.OnStyler_Change.bind(this));
		
		this.widgets.table.On("RowClick", this.OnTable_RowClick.bind(this));
		this.widgets.table.On("RowDeselectButtonClick", this.OnTable_RowDeselectButtonClick.bind(this));
		this.widgets.styler.On('Opacity', this.OnStyler_Opacity.bind(this));
		this.widgets.styler.On('LabelName', this.onStyler_LabelName.bind(this));

		this.toolbar.DisableButton("chart");

		this.context.Initialize(config.context).then(d => {	
			this.map.AddSubLayer('main', this.context.sublayer);

			this.widgets.selector.Update(this.context);
			this.widgets.styler.Update(this.context);
			this.widgets.table.Update(this.context);
			this.widgets.bookmarks.Update(this.context);

			this.AddSelectBehavior(this.map, this.context, this.config);
			
			this.toolbar.ShowWidget("selector");
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
			this.widgets.table.data = ev.selection; 
			this.widgets.chart.data = ev.selection;

			// REVIEW: Reading titles and labels from widgets like this will get confusing. We should have a central place 
			// where we can get them. Context probably. We could also just call an UpdateSelection function on each widget
			// and provide the selection object similar to what we do when the context changes.
			this.widgets.chart.linkTitle = this.widgets.infoPopup.GetLink();
			
			if (ev.selection.items.length == 0) {		
				this.widgets.chart.description = "";
				this.toolbar.Overlay("chart").title = "";
				this.toolbar.DisableButton("chart");
			} 
			
			else if (this.toolbar.Button("chart").disabled == true) {
				this.widgets.chart.description = this.widgets.table.title + " (" + this.widgets.chart.data[0].uom + ")";
				this.toolbar.Item("chart").overlay.header = this.widgets.chart.linkTitle;
				this.toolbar.EnableButton("chart");
			}
		});	

		this.HandleEvents(this.widgets.chart.chart, ev => {
			if (this.highlight || ev.hovered == null) {
				this.selection.ClearGraphicHighlight();
				return;
			} 

			this.selection.HighlightTargetGraphic(ev.hovered, this.widgets.chart.config.field);
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

			ev.response.screenPoint.y -= 10;
				
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
				// i.e, Do this.widgets.chart.Highlight();
				this.selection.HighlightGraphic(this.selection.graphic);
				this.selection.HighlightChartElement(this.widgets.chart.chart, this.widgets.chart.config.field);

				this.widgets.infoPopup.Show(this.map.view.toMap(ev.response.screenPoint), this.selection.graphic);
			}

			// Update the popup position if the current graphic is highlighted
			else if (this.selection.highlight) {
				this.map.view.popup.location = this.map.view.toMap(ev.response.screenPoint);
			} 

			// The current graphic is not highlighted
			else if (!this.selection.highlight) {
				this.selection.HighlightGraphic(this.selection.graphic);
				this.selection.HighlightChartElement(this.widgets.chart.chart, this.widgets.chart.config.field);

				this.widgets.infoPopup.Show(this.map.view.toMap(ev.response.screenPoint), this.selection.graphic);
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

		this.widgets.bookmarks.Update(this.context);
		this.widgets.styler.Update(this.context);
		this.widgets.table.Update(this.context);

		this.toolbar.DisableButton("chart");
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
		this.context.sublayer.labelsVisible = ev.checked;
	}

	OnSearch_Change(ev) {		
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnTable_RowClick(ev) {
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnTable_RowDeselectButtonClick(ev) {
		var mb = this.map.Behavior("selection");
		ev.graphic ? mb.layer.remove(ev.graphic) : mb.layer.removeAll();
		this.widgets.table.data = mb.graphics;
		this.widgets.chart.data = mb.graphics;

		// REVIEW: This code is a repeat
		if (this.map.Behavior("selection").graphics.items.length == 0) {
			this.widgets.chart.description = this.widgets.chart.disabledTitle;
			this.toolbar.Overlay("chart").title = this.widgets.chart.title;
			this.toolbar.DisableButton("chart");
	   }

	}
	
	OnWidget_Busy(ev) {
		this.widgets.waiting.Show();
	}
	
	OnWidget_Idle(ev) {
		this.widgets.waiting.Hide();
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
		return	"<div handle='map-container' class='map-container'>" +
					"<div handle='map'></div>" +
				"</div>";
	}
}