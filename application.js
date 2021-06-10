'use strict';

import Core from '../geo-explorer-api/tools/core.js';
import Dom from '../geo-explorer-api/tools/dom.js';
import Templated from '../geo-explorer-api/components/templated.js';
import Map from '../geo-explorer-api/components/map.js';
import IdentifyBehavior from '../geo-explorer-api/behaviors/point-select.js';
import Overlay from '../geo-explorer-api/widgets/overlay.js';
import Waiting from '../geo-explorer-api/widgets/waiting.js';
import Basemap from '../geo-explorer-api/widgets/basemap.js';
import Bookmarks from '../geo-explorer-api/widgets/bookmarks.js';
import Legend from '../geo-explorer-api/widgets/legend/legend.js';
import Menu from '../geo-explorer-api/widgets/menu.js';

import Selector from './widgets/selector.js';
import Styler from './widgets/styler/styler.js';
import Search from './widgets/search.js';
import Table from './widgets/table.js';
import wChart from './widgets/wChart.js';

/**
 * Application module
 * @module application
 * @extends Templated
 */
export default class Application extends Templated { 

	/**
	 * Get configuration data
	 */
	get config() { return this._config; }
	
	/**
	 * Get context from config
	 */
	get context() { return this._config.context; }

	/**
	 * Get current behavior
	 */
	get behavior() { return "pointselect"; }

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	static Nls(nls) {
		nls.Add("Selector_Title", "en", "Select Data");
		nls.Add("Selector_Title", "fr", "Sélectionner des données");
		nls.Add("Styler_Title", "en", "Change map style");
		nls.Add("Styler_Title", "fr", "Modifier le style de la carte");
		nls.Add("Chart_Title", "en", "View chart");
		nls.Add("Chart_Title", "fr", "Type de Diagramme");
		nls.Add("Legend_Title", "en", "Map legend");
		nls.Add("Legend_Title", "fr", "Légende de la carte");
		nls.Add("Bookmarks_Title", "en", "Bookmarks");
		nls.Add("Bookmarks_Title", "fr", "Géosignets");
		nls.Add("Basemap_Title", "en", "Change basemap");
		nls.Add("Basemap_Title", "fr", "Changer de fond de carte");
		nls.Add("Search_Icon_Alt", "en", "Magnifying glass");
		nls.Add("Search_Icon_Alt", "fr", "Loupe");
		nls.Add("Indicator_Title_Popup", "en", "Selected indicators");
		nls.Add("Indicator_Title_Popup", "fr", "Indicateurs sélectionnés");		
		nls.Add("Table_Label_Popup1", "en", "Statistics Canada.");
		nls.Add("Table_Label_Popup1", "fr", "Statistique Canada.");				
		nls.Add("Table_Label_Popup2", "en", "Table ");
		nls.Add("Table_Label_Popup2", "fr", "Tableau");						
	}

	/**
	 * Call constructor of base class (Templated) and initialize application
	 * @param {object} node - Application div
	 * @param {object} config - Configuration data
	 * @returns {void}
	 */
	constructor(node, config) {		
		super(node);

		this._config = config;

		// Build map, menus, widgets and other UI components
		this.map = new Map(this.Elem('map'));
		this.menu = new Menu();
		this.bMenu = new Menu();

		this.AddOverlay(this.menu, "selector", this.Nls("Selector_Title"), this.Elem("selector"), "top-right");
		this.AddOverlay(this.menu, "styler", this.Nls("Styler_Title"), this.Elem("styler"), "top-right");
		this.AddOverlay(this.menu, "chart", this.Nls("Chart_Title"), this.Elem("chart"), "top-right");
		this.AddOverlay(this.menu, "legend", this.Nls("Legend_Title"), this.Elem("legend"), "top-right");
		this.AddOverlay(this.menu, "bookmarks", this.Nls("Bookmarks_Title"), this.Elem("bookmarks"), "top-right");
		this.AddOverlay(this.bMenu, "basemap", this.Nls("Basemap_Title"), this.Elem("basemap"), "bottom-left");

		// Move all widgets inside the map div, required for fullscreen
		this.map.Place(this.bMenu.buttons, "bottom-left");
		this.map.Place(this.menu.buttons, "top-left");
		this.map.Place([this.Elem("waiting").container], "manual");
		
		// Hookup events to UI
		this.HandleEvents(this.map);
		this.HandleEvents(this.context);
		this.HandleEvents(this.Node('selector'), this.OnSelector_Change.bind(this));
		this.HandleEvents(this.Node('styler'), this.OnStyler_Change.bind(this));
		this.HandleEvents(this.Node('search'), this.OnSearch_Change.bind(this));
		
		this.Node("table").On("RowClick", this.OnTable_RowClick.bind(this));
		this.Node("table").On("RowButtonClick", this.OnTable_RowButtonClick.bind(this));
		this.Node('legend').On('Opacity', this.OnLegend_Opacity.bind(this));
		this.Node('legend').On('LayerVisibility', this.OnLegend_LayerVisibility.bind(this));
		
		this.Node('legend').On('LabelName', this.onLegend_LabelName.bind(this));
		
		this.map.AddMapImageLayer('main', this.config.mapUrl, this.config.mapOpacity);

		this.Elem("chart").labelField = this.config.chart.field;
		this.Elem("table").headers = this.config.tableHeaders;
		this.Elem('legend').Opacity = this.config.mapOpacity;
		this.Elem('basemap').Map = this.map;
		this.Elem('bookmarks').Map = this.map;
		this.Elem('bookmarks').Bookmarks = this.config.bookmarks;

		this.context.Initialize(config.context).then(d => {	
			this.map.AddSubLayer('main', this.context.sublayer);

			this.Elem("selector").Update(this.context);
			this.Elem("styler").Update(this.context);
			this.Elem("legend").Update(this.context);
			this.Elem("table").Update(this.context);
			
			this.menu.SetOverlay(this.menu.Item("legend"));			

			this.AddIdentifyBehavior(this.map, this.context, this.config);

			this.map.Behavior("pointselect").Activate();
		}, error => this.OnApplication_Error(error));
	}
	
	/**
	 * Add map overlay.
	 * @param {object} menu - Menu items
	 * @param {string} id - Overlay Id (ex. "selector")
	 * @param {string} title - Title to show at top of overlay
	 * @param {object} widget - Widget to load in the overlay
	 * @param {string} position - Position of overlay on map (ex. "top-right")
	 * @returns {void}
	 */
	AddOverlay(menu, id, title, widget, position) {
		var overlay = new Overlay(this.Elem("map-container"));
		
		// TODO: roots[0] is awkward
		Dom.AddCss(overlay.roots[0], id);
		
		overlay.widget = widget;
		overlay.title = title;
		
		menu.AddOverlay(id, title, overlay);
		
		this.map.Place([overlay.roots[0]], position);
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
		behavior.symbol = config.symbol("pointselect");

		this.HandleEvents(behavior, ev => {
			if (ev.feature) this.ShowInfoPopup(ev.mapPoint, ev.feature); // popup
			
			this.Elem("table").data = ev.pointselect; // table
			this.Elem("chart").data = ev.pointselect;
		});	
	}
	
	/**
	 * Show the popup for the selected map point.
	 * @param {object} mapPoint - Object containing the coordinates of the selected map point
	 * @param {object} f - Layer containing the attributes of the selected polygon
	 * @returns {void}
	 */
	ShowInfoPopup(mapPoint, f) {
		var p = this.config.popup;

		var att = f.attributes;

		var symbol = (att[p.symbol] && att[p.value] != "F") ? att[p.symbol] : ''; /* prevents F from displaying twice */

		var symbol_foot = att[p.symbol] || ''; 

		var symbol_desc = att[p.nulldesc] || '';

		let indicators = `<ul>`;

		this.context.IndicatorItems().forEach(f => {
			indicators += `<li>${f.label}</li>`;
		});

		indicators += `</ul>`;

		let prod = this.context.category.toString()
		let	url = ``;

		if (prod.length == 8) { // Table Viewer Link if available
			url = `
				<b>${this.Nls("Table_Label_Popup1")}</b> ${this.Nls("Table_Label_Popup2")} 
				<a href="${this.config.tableviewer.url}${this.context.category}01" target="_blank">${prod.replace(/(\d{2})(\d{2})(\d{4})/, "$1-$2-$3-01")}</a>
			`;
		}
		
		let indicatorsAndTableSource = `<div><b>${this.Nls("Indicator_Title_Popup")}</b>:${indicators}${url}</div>`;

		var content = `<b>${att[p.uom]}</b>: ${att[p.value]}<sup>${symbol}</sup><br><br>${indicatorsAndTableSource}<br><sup>${symbol_foot}</sup> ${symbol_desc}`;
		
		this.map.popup.open({ location:mapPoint, title:att[p.title], content:content });
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

	/**
	 * Clear map and specified elements when user makes a selector change.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnSelector_Change(ev) {
		this.map.EmptyLayer('main');
		this.map.AddSubLayer('main', this.context.sublayer);

		// Note: This assumes all behaviors have a target, this may change in the future.
		this.map.behaviors.forEach(b => b.target = this.context.sublayer);
		
		this.Elem("styler").Update(this.context);
		this.Elem("legend").Update(this.context);
		this.Elem("table").Update(this.context);
	}
	
	/**
	 * Update the renderer and legend when map style is changed.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnStyler_Change(ev) {	
		this.context.sublayer.renderer = ev.renderer;
		
		this.Elem("legend").Update(this.context);
	}
	
	/**
	 * Update the layer opacity from the event.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnLegend_Opacity(ev) {
		this.map.Layer('main').opacity = ev.opacity;
	}

	/**
	 * Show or hide the legend
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnLegend_LayerVisibility(ev) {
		var l = this.map.layer(ev.data.id);

		if (!l)return;

		l.visible = ev.checked;
	}

	/**
	 * Show or hide the map labels.
	 * @param {object} ev - Event object
	 * @returns{void}
	 */
	onLegend_LabelName(ev) {
		this.map.Layer("main").findSublayerById(this.context.sublayer.id).labelsVisible = ev.checked;
	}
	
	/**
	 * Go to specified location when location search box value changes.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnSearch_Change(ev) {		
		this.map.GoTo(ev.feature.geometry);
	}
	
	/**
	 * Zoom to the selected location when a table row is clicked.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnTable_RowClick(ev) {
		this.map.GoTo(ev.feature.geometry);
	}
	
	/**
	 * Remove item from table and map selection when delete button is clicked on a table row.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnTable_RowButtonClick(ev) {
		this.map.Behavior(this.behavior).layer.remove(ev.graphic);
		this.Elem("table").data = this.map.Behavior(this.behavior).graphics;
		this.Elem("chart").data = this.map.Behavior(this.behavior).graphics;
	}
	
	/**
	 * Show waiting indicator while widget is performing a task.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnWidget_Busy(ev) {
		this.Elem("waiting").Show();
	}
	
	/**
	 * Hide waiting indicator when widget is idle.
	 * @param {object} ev - Event object
	 * @returns {void}
	 */	
	OnWidget_Idle(ev) {
		this.Elem("waiting").Hide();
	}
	
	/**
	 * Show error message when application encounters a problem.
	 * @param {object} error - Error object
	 * @returns {void}
	 */
	OnApplication_Error(error) {
		alert(error.message);
		
		console.error(error);
	}

	/**
	 * Return application HTML.
	 * @returns {string} HTML string
	 */
	Template() {
		return	"<div class='top-container'>" +
					"<img class='button-icon large-icon search' src='./assets/search-24.png' alt='nls(Search_Icon_Alt)' />" +
					"<div handle='search' widget='App.Widgets.Search'></div>" +
				"</div>" +
				"<div handle='map-container' class='map-container'>" +
					"<div handle='map'></div>" +
					"<div handle='waiting' class='waiting' widget='App.Widgets.Waiting'></div>" +
					"<div handle='selector' widget='App.Widgets.Selector'></div>" +
					"<div handle='styler' widget='App.Widgets.Styler'></div>" +
					"<div handle='chart' widget='App.Widgets.WChart'></div>" +
					"<div handle='legend' widget='App.Widgets.Legend'></div>" +
					"<div handle='basemap' widget='App.Widgets.Basemap'></div>" +
					"<div handle='bookmarks' widget='App.Widgets.Bookmarks'></div>" +
				"</div>" +
			    "<div handle='table' class='table' widget='App.Widgets.Table'></div>"
	}
}