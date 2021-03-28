'use strict';

import Core from './tools/core.js';
import Templated from './components/templated.js';
import Map from './components/map.js';
import SelectBehavior from './behaviors/rectangle-select.js';
import IdentifyBehavior from './behaviors/point-identify.js';
import Menu from './widgets/menu.js';
import Selector from './widgets/selector.js';
import Styler from './widgets/styler/styler.js';
import Legend from './widgets/legend/legend.js';
import Search from './widgets/search.js';
import Waiting from './widgets/waiting.js';
import Basemap from './widgets/basemap.js';
import Bookmarks from './widgets/bookmarks.js';
import Table from './widgets/table.js';
import Overlay from './widgets/overlay.js';
import Dom from './tools/dom.js';

export default class Application extends Templated { 

	get config() { return this._config; }
	
	get context() { return this._config.context; }

	static Nls() {
		return {
			"Selector_Title" : {
				"en" : "Select Data",
				"fr" : "Sélectionner des données"
			},
			"Styler_Title" : {
				"en" : "Change map style",
				"fr" : "Modifier le style de la carte"
			},
			"Legend_Title" : {
				"en" : "Map legend",
				"fr" : "Légende de la carte"
			},
			"Bookmarks_Title" : {
				"en": "Bookmarks",
				"fr": "Géosignets"
			},
			"Behaviour_Title" : {
				"en" : "Toggle map click behaviour",
				"fr" : "Basculer le comportement des clics sur la carte"
			},
			"Basemap_Title" : {
				"en": "Change basemap",
				"fr": "Changer de fond de carte"
			},
			"Search_Icon_Alt" : {
				"en" : "Magnifying glass",
				"fr" : "Loupe"
			}
		}
	}

	constructor(node, config) {		
		super(node);

		this._config = config;

		// Build map, menus, widgets and other UI components
		this.map = new Map(this.Elem('map'));
		this.menu = new Menu();
		this.bMenu = new Menu();

		this.AddOverlay(this.menu, "selector", this.Nls("Selector_Title"), this.Elem("selector"), "top-right");
		this.AddOverlay(this.menu, "styler", this.Nls("Styler_Title"), this.Elem("styler"), "top-right");
		this.AddOverlay(this.menu, "legend", this.Nls("Legend_Title"), this.Elem("legend"), "top-right");
		this.AddOverlay(this.menu, "bookmarks", this.Nls("Bookmarks_Title"), this.Elem("bookmarks"), "top-right");
		this.AddOverlay(this.bMenu, "basemap", this.Nls("Basemap_Title"), this.Elem("basemap"), "bottom-left");
		this.menu.AddButton("behaviour", this.Nls("Behaviour_Title"));

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

		this.menu.Button("behaviour").addEventListener("click", this.BehaviourButton_Click.bind(this));
		
		this.Node("table").On("RowClick", this.OnTable_RowClick.bind(this));
		this.Node("table").On("RowButtonClick", this.OnTable_RowButtonClick.bind(this));
		this.Node('legend').On('Opacity', this.OnLegend_Opacity.bind(this));
		this.Node('legend').On('LayerVisibility', this.OnLegend_LayerVisibility.bind(this));
		
		this.Node('legend').On('LabelName', this.onLegend_LabelName.bind(this));
		
		this.map.AddMapImageLayer('main', this.config.mapUrl, this.config.mapOpacity);

		this.Elem("table").headers = this.config.tableHeaders;
		this.Elem('legend').Opacity = this.config.mapOpacity;
		this.Elem('basemap').Map = this.map;
		this.Elem('bookmarks').Map = this.map;
		this.Elem('bookmarks').Bookmarks = this.config.bookmarks;
		/*
	    this.config.legendItems.forEach(i => {
			this.map.AddFeatureLayer(i.id, i.url, i.labels, false);
			this.Elem("legend").AddContextLayer(i.label, i, false);
		})
		*/
		this.context.Initialize(config.context).then(d => {	
			this.map.AddSubLayer('main', this.context.sublayer);
			
			this.Elem("selector").Update(this.context);
			this.Elem("styler").Update(this.context);
			this.Elem("legend").Update(this.context);
			this.Elem("table").Update(this.context);
			
			this.menu.SetOverlay(this.menu.Item("legend"));			

			this.AddSelectBehavior(this.map, this.context, this.config);
			this.AddIdentifyBehavior(this.map, this.context, this.config);

			this.map.Behavior("identify").Activate();
			this.behavior = "identify";
		}, error => this.OnApplication_Error(error));
	}
	
	AddOverlay(menu, id, title, widget, position) {
		var overlay = new Overlay(this.Elem("map-container"));
		
		// TODO: roots[0] is awkward
		Dom.AddCss(overlay.roots[0], id);
		
		overlay.widget = widget;
		overlay.title = title;
		
		menu.AddOverlay(id, title, overlay);
		
		this.map.Place([overlay.roots[0]], position);
	}
	
	AddSelectBehavior(map, context, config) {
		var behavior = this.map.AddBehavior("selection", new SelectBehavior(map));
		
		behavior.target = context.sublayer;
		behavior.field = "GeographyReferenceId";
		behavior.symbol = config.symbol("selection");
		
		this.HandleEvents(behavior, this.OnMap_SelectDraw.bind(this));
	}
	
	AddIdentifyBehavior(map, context, config) {
		var behavior = this.map.AddBehavior("identify", new IdentifyBehavior(map));

		behavior.target = context.sublayer;
		behavior.symbol = config.symbol("identify");

		this.HandleEvents(behavior);	
	}
	
	HandleEvents(node, changeHandler) {
		if (changeHandler) node.On('Change', changeHandler);
		
		node.On('Busy', this.OnWidget_Busy.bind(this));
		node.On('Idle', this.OnWidget_Idle.bind(this));
		node.On('Error', ev => this.OnApplication_Error(ev.error));
	}
	
    BehaviourButton_Click(ev){
		this.map.Behavior(this.behavior).Deactivate();

		this.behavior = (this.behavior == "identify") ? "selection" : "identify";

		this.map.Behavior(this.behavior).Activate();
	}

	OnSelector_Change(ev) {
		this.map.EmptyLayer('main');
		this.map.AddSubLayer('main', this.context.sublayer);
		
		this.map.Behavior("selection").target = this.context.sublayer;
		this.map.Behavior("identify").target = this.context.sublayer;
		
		this.Elem("styler").Update(this.context);
		this.Elem("legend").Update(this.context);
		this.Elem("table").Update(this.context);
	}
	
	OnStyler_Change(ev) {	
		this.context.sublayer.renderer = ev.renderer;
		
		this.Elem("legend").Update(this.context);
	}
	
	OnLegend_Opacity(ev) {
		this.map.Layer('main').opacity = ev.opacity;
	}

	OnLegend_LayerVisibility(ev) {
		var l = this.map.layer(ev.data.id);

		if (!l)return;

		l.visible = ev.checked;
	}

	onLegend_LabelName(ev) {
		this.map.Layer("main").findSublayerById(this.context.sublayer.id).labelsVisible = ev.checked;
	}
	
	OnSearch_Change(ev) {		
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnTable_RowClick(ev) {
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnMap_SelectDraw(ev) {
		this.Elem("table").Populate(ev.selection);
	}
	
	OnTable_RowButtonClick(ev) {
		this.map.Behavior("selection").layer.remove(ev.graphic);
				
		this.Elem("table").Populate(this.map.Behavior("selection").graphics);
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

	Template() {
		return	"<div class='top-container'>" +
					"<img class='button-icon large-icon search' src='./assets/search-24.png' alt='nls(Search_Icon_Alt)' />" +
					"<div handle='search' widget='App.Widgets.Search'></div>" +
				"</div>" +
				"<div handle='map-container' class='map-container'>" +
					"<div handle='map'></div>" +
					"<div handle='waiting' class='waiting' widget='App.Widgets.Waiting'></div>" +
					"<div handle='selector' class='selector' widget='App.Widgets.Selector'></div>" +
					"<div handle='styler' class='styler' widget='App.Widgets.Styler'></div>" +
					"<div handle='legend' class='legend' widget='App.Widgets.Legend'></div>" +
					"<div handle='basemap' class='basemap' widget='App.Widgets.Basemap'></div>" +
					"<div handle='bookmarks' class='bookmarks' widget='App.Widgets.Bookmarks'></div>" +
				"</div>" +
			    "<div handle='table' class='table' widget='App.Widgets.Table'></div>"
	}
}