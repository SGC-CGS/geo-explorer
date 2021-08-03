'use strict';

import Widget from '../geo-explorer-api/components/base/widget.js';
import Map from '../geo-explorer-api/components/map.js';
import Storage from '../geo-explorer-api/components/storage.js';
import IdentifyBehavior from '../geo-explorer-api/behaviors/point-select.js';
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

	get behavior() { return "pointselect"; }

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
		this.HandleEvents(this.Node('selector'), this.OnSelector_Change.bind(this));
		this.HandleEvents(this.Node('search'), this.OnSearch_Change.bind(this));
		this.HandleEvents(this.Node('styler'), this.OnStyler_Change.bind(this));
		
		this.Node("table").On("RowClick", this.OnTable_RowClick.bind(this));
		this.Node("table").On("RowButtonClick", this.OnTable_RowButtonClick.bind(this));
		this.Node("styler").On('Opacity', this.OnStyler_Opacity.bind(this));
		this.Node("styler").On('LabelName', this.onStyler_LabelName.bind(this));

		this.map.AddMapImageLayer('main', this.config.map.url, this.config.map.opacity);
		
		this.context.Initialize(this.config.context).then(d => {	
			this.map.AddSubLayer('main', this.context.sublayer);

			this.Elem("selector").Update(this.context);
			this.Elem("styler").Update(this.context);
			this.Elem("table").Update(this.context);	
			
			this.toolbar.ShowWidget("selector");			

			this.AddIdentifyBehavior(this.map, this.context, this.config);

			this.map.Behavior("pointselect").Activate();
		}, error => this.OnApplication_Error(error));
	}
	
	/**
	 * Adds the behavior and handles the event for generating popup and table from map selection.
	 * @param {object} map - Map object to which the behavior will be applied
	 * @param {object} context - Context object for retrieving the sublayer
	 * @param {object} config - Configuration data
	 * @returns {void}
	 */
	AddIdentifyBehavior(map, context, config) {
		var behavior = this.map.AddBehavior("pointselect", new IdentifyBehavior(map));

		behavior.target = context.sublayer;
		behavior.field = "GeographyReferenceId";
		behavior.symbol = config.symbols["pointselect"];

		this.HandleEvents(behavior, ev => {
			if (ev.feature) this.infoPopup.Show(ev.mapPoint, ev.feature);
			
			this.Elem("table").data = ev.pointselect; 
			this.Elem("chart").data = ev.pointselect;
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

	OnSelector_Change(ev) {
		this.map.EmptyLayer('main');
		this.map.AddSubLayer('main', this.context.sublayer);

		this.map.Behavior("pointselect").target = this.context.sublayer;

		this.Elem("bookmarks").Update(this.context);
		this.Elem("styler").Update(this.context);
		this.Elem("table").Update(this.context);

		// REVIEW: Is this necessary? Seems like a selection clear would do the trick too.
		this.Elem("chart").data = this.map.Behavior("pointselect").graphics;
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
		this.map.Behavior(this.behavior).layer.remove(ev.graphic);
		this.Elem("table").data = this.map.Behavior(this.behavior).graphics;
		this.Elem("chart").data = this.map.Behavior(this.behavior).graphics;
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