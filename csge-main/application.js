'use strict';

import ClickSelect from '../geo-explorer-api/behaviors/click-select.js';
import DragSelect from '../geo-explorer-api/behaviors/drag-select.js';
import HoverHighlight from '../geo-explorer-api/behaviors/hover-highlight.js';

import Widget from '../geo-explorer-api/components/base/widget.js';
import Map from '../geo-explorer-api/components/map.js';
import Storage from '../geo-explorer-api/components/storage.js';
import Selection from '../geo-explorer-api/components/selection.js';
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
	get behavior() { return this.map.Behavior("drag"); }

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
		this.selection = new Selection("GeographyReferenceId");

		this.selection.On("change", this.OnSelection_Change.bind(this));

		this.map = new Map(this.Elem('map'), this.config.map.options);

		this.map.AddMapImageLayer('main', this.config.map.url, this.config.map.opacity);
		this.map.AddGraphicsLayer('selection');
		
		// Create toolbars and corresponding widgets
		this.toolbar = new wToolbar("tools");
		this.navbar = new wToolbar("navigation");
		
		this.widgets = {
			selector: this.toolbar.AddOverlay("selector", new wSelector()),		
			styler: this.toolbar.AddOverlay("styler", new wStyler(this.config.styler, this.context)),
			chart: this.toolbar.AddOverlay("chart", new wChart(this.config.chart, this.selection)),
			export: this.toolbar.AddOverlay("export", new wExport(this.config.chart)),
			fullscreen: this.navbar.AddEsriWidget("fullscreen", new ESRI.widgets.Fullscreen({ view: this.map.view })),
			home: this.navbar.AddEsriWidget("home", new ESRI.widgets.Home({ view: this.map.view })),
			bookmarks: this.navbar.AddOverlay("bookmarks", new wBookmarks(this.config.bookmarks, this.map, this.storage)),
			basemap: this.navbar.AddOverlay("basemap", new wBasemap({ view: this.map.view })),
			search: new wSearch(),
			waiting: new wWaiting(),
			table: new wTable(this.config.table, this.selection),
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
		this.widgets.styler.On('Opacity', this.OnStyler_Opacity.bind(this));
		this.widgets.styler.On('LabelName', this.onStyler_LabelName.bind(this));

		this.toolbar.DisableButton("chart");

		this.context.Initialize(config.context).then(d => {	
			this.map.Layer('main').sublayers.add(this.context.sublayer);

			this.widgets.chart.Update(this.context);
			this.widgets.selector.Update(this.context);
			this.widgets.styler.Update(this.context);
			this.widgets.table.Update(this.context);
			this.widgets.bookmarks.Update(this.context);

			this.toolbar.Item("chart").overlay.header = this.widgets.chart.header;
			
			this.AddBehaviors(this.map, this.selection, this.map.Layer("selection"), this.context.sublayer, this.config.symbols);
			
			this.toolbar.ShowWidget("selector");
		}, error => this.OnApplication_Error(error));
	}

	AddBehaviors(map, selection, layer, target, symbols) {
		this.map.AddBehavior("drag", new DragSelect(map, selection, layer, target, symbols.selection));
		this.map.AddBehavior("click", new ClickSelect(map, selection, layer, target, symbols.selection)).Activate();
		this.map.AddBehavior("hover", new HoverHighlight(map, layer)).Activate();
	
		this.HandleEvents(this.map.Behavior("drag"));
		this.HandleEvents(this.map.Behavior("click"));

		this.map.Behavior("hover").On("pointer-move", ev => {
			this.widgets.infoPopup.Show(ev.position, ev.graphic);
			this.widgets.chart.Highlight(ev.graphic);
		});
		
		this.map.Behavior("hover").On("pointer-leave", ev => {
			this.widgets.infoPopup.Hide();
			this.widgets.chart.Highlight(null);
		});
		
		document.addEventListener("keydown", this.OnDocument_KeyUpDown.bind(this, false));
		document.addEventListener("keyup", this.OnDocument_KeyUpDown.bind(this, true))
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
		this.selection.RemoveAll();
		
		this.map.Layer('main').sublayers.removeAll();
		this.map.Layer('main').sublayers.add(this.context.sublayer);

		this.map.Behavior("click").target = this.context.sublayer;
		this.map.Behavior("drag").target = this.context.sublayer;

		this.widgets.chart.Update(this.context);
		this.widgets.bookmarks.Update(this.context);
		this.widgets.styler.Update(this.context);
		this.widgets.table.Update(this.context);

        this.toolbar.Item("chart").overlay.header = this.widgets.chart.header;
		
		this.toolbar.DisableButton("chart");
	}
	
	OnSelection_Change(ev) {
		if (ev.graphics.length > 0) this.toolbar.EnableButton("chart");

		else this.toolbar.DisableButton("chart");
	}
	
	OnStyler_Change(ev) {	
		this.context.sublayer.renderer = ev.renderer;
	}
	
	OnStyler_Opacity(ev) {
		this.map.Layer('main').opacity = ev.opacity;
	}
	
	onStyler_LabelName(ev) {
		this.context.sublayer.labelsVisible = ev.checked;
	}

	OnSearch_Change(ev) {		
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnTable_RowClick(ev) {
		this.map.GoTo(ev.feature.geometry);
	}
		
	OnWidget_Busy(ev) {
		this.widgets.waiting.Show();
	}
	
	OnWidget_Idle(ev) {
		this.widgets.waiting.Hide();
	}

	OnDocument_KeyUpDown(isClick, ev) {
		if (ev.keyCode != 16) return;
		
		this.map.Behavior("click").SetActive(isClick);
		this.map.Behavior("hover").SetActive(isClick);
		this.map.Behavior("drag").SetActive(!isClick);
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