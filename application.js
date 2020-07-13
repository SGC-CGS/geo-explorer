 'use strict';

import Core from './tools/core.js';
import Dom from './tools/dom.js';
import Net from './tools/net.js';
import Requests from './tools/requests.js';
import Templated from './components/templated.js';

import Context from './components/context.js';
import Map from './components/map.js';
import Menu from './widgets/menu.js';
import Selector from './widgets/selector.js';
import Styler from './widgets/styler.js';
import Legend from './widgets/legend.js';
import Search from './widgets/search.js';
import Waiting from './widgets/waiting.js';
import Table from './widgets/table.js';

export default class Main extends Templated { 

	constructor(node, config) {		
		super(node);

		this.config = config;

		// Build map, menu, widgets and other UI components
		this.map = new Map(this.Elem('map'));
		this.menu = new Menu(this.map);
		
		this.menu.AddOverlay("selector", Core.Nls("Selector_Title"), this.Elem("selector"));
		this.menu.AddOverlay("styler", Core.Nls("Styler_Title"), this.Elem("styler"));
		this.menu.AddOverlay("legend", Core.Nls("Legend_Title"), this.Elem("legend"));

		// Move all widgets inside the map div, required for fullscreen
		this.map.Place(this.Elem("selector").container, "top-right");
		this.map.Place(this.Elem("styler").container, "top-right");
		this.map.Place(this.Elem("legend").container, "top-right");
		this.map.Place(this.Elem("waiting").container, "bottom-right");
		
		for (var id in this.menu.items) this.map.Place(this.menu.items[id].button, "top-left");
		
		// Hookup events to UI
		this.HandleWidgetEvents(this.Node('selector'), this.OnSelector_Change.bind(this));
		this.HandleWidgetEvents(this.Node('styler'), this.OnStyler_Change.bind(this));
		this.HandleWidgetEvents(this.Node('search'), this.OnSearch_Change.bind(this));
		
		this.Node("table").On("RowClick", this.OnTable_RowClick.bind(this));
		this.Node("table").On("RowButtonClick", this.OnTable_RowButtonClick.bind(this));
		this.Node('legend').On('Opacity', this.OnLegend_Opacity.bind(this));
		
		// Hookup events to map
		this.map.On("Click", this.OnMap_Click.bind(this));
		this.map.On("Select-Draw", this.OnMap_SelectDraw.bind(this));
		this.map.On("Error", this.OnApplication_Error.bind(this));
		
		// Initialize application
		this.map.AddMapImageLayer('main', this.config.map.url, this.config.map.opacity);
		this.map.AddGraphicsLayer('identify');
		this.map.AddGraphicsLayer('selection');

		this.Elem('legend').opacity = this.config.map.opacity;

		this.context = new Context();

		this.context.On("Error", this.OnApplication_Error.bind(this));
		
		this.Elem("waiting").Show();
		
		this.context.Initialize(config.context).then(d => {		
			this.Elem("waiting").Hide();
		
			this.map.AddSubLayer('main', this.context.sublayer);
			
			this.Elem("table").Initialize(this.config.table);
			
			this.Elem("selector").Update(this.context);
			this.Elem("styler").Update(this.context);
			this.Elem("legend").Update(this.context);
			this.Elem("table").Update(this.context);
			
			this.menu.SetOverlay(this.menu.Item("legend"));
		}, error => this.OnApplication_Error(error));
	}
	
	HandleWidgetEvents(node, changeHandler) {
		node.On('Change', changeHandler);
		node.On('Busy', this.OnWidget_Busy.bind(this));
		node.On('Idle', this.OnWidget_Idle.bind(this));
		node.On('Error', this.OnApplication_Error.bind(this));
	}
	
	OnSelector_Change(ev) {	
		this.Elem("waiting").Hide();
		
		this.map.EmptyLayer('main');
		this.map.AddSubLayer('main', this.context.sublayer);
		
		this.map.ClearGraphics('identify');
		this.map.ClearGraphics('selection');
			
		this.Elem("styler").Update(this.context);
		this.Elem("legend").Update(this.context);
		this.Elem("table").Update(this.context);
	}
	
	OnStyler_Change(ev) {
		this.Elem("waiting").Hide();
		
		this.context.sublayer.renderer = ev.renderer;
		
		this.Elem("legend").Update(this.context);
	}
	
	OnSearch_Change(ev) {
		this.Elem("waiting").Hide();
		
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnMap_Click(ev) {
		return;
		
		this.Elem("waiting").Show();
		
		this.map.Identify(this.context.sublayer, ev.mapPoint).then((r) => {
			this.Elem("waiting").Hide();
			
			this.map.ClearGraphics('identify');
			
			this.map.AddGraphic('identify', r.feature, this.config.symbols.identify);
			
			this.map.Popup(ev.mapPoint, r.content, r.title);
		}, error => this.OnApplication_Error(error));
	}
	
	OnMap_SelectDraw(ev) {
		this.Elem("waiting").Show();
		
		Requests.QueryGeometry(this.context.sublayer, ev.geometry).then(r => {
			this.Elem("waiting").Hide();
			
			var field = "GeographyReferenceId";
			var graphics = this.map.Layer("selection").graphics;
			
			r.features.forEach(f => {
				var exists = graphics.find(g => g.attributes[field] == f.attributes[field]);
				
				if (exists) this.map.RemoveGraphic("selection", exists);
				
				else this.map.AddGraphic('selection', f, this.config.symbols.identify);
			});

			this.Elem("table").Populate(this.map.Layer("selection").graphics);
		});
	}
		
	OnLegend_Opacity(ev) {
		this.map.Layer('main').opacity = ev.opacity;
	}
	
	OnTable_RowClick(ev) {
		this.map.GoTo(ev.graphic.geometry);
	}
	
	OnTable_RowButtonClick(ev) {
		this.map.RemoveGraphic("selection", ev.graphic);
		
		this.Elem("table").Populate(this.map.Layer("selection").graphics);
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
				"<div class='map-container'>" +
					"<div handle='map'></div>" +
					"<div handle='selector' class='selector' widget='App.Widgets.Selector'></div>" +
					"<div handle='styler' class='styler' widget='App.Widgets.Styler'></div>" +
					"<div handle='legend' class='legend' widget='App.Widgets.Legend'></div>" +
					"<div handle='waiting' class='waiting' widget='App.Widgets.Waiting'></div>" +
				"</div>" +
			    "<div handle='table' class='table' widget='App.Widgets.Table'></div>";;
	}
}