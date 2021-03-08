'use strict';

import Core from './tools/core.js';
import Templated from './components/templated.js';
import Context from './components/context.js';
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
import Dom from './tools/dom.js';

export default class Application extends Templated { 

	constructor(node, config) {		
		super(node);

		this.config = config;

		// Build context, map, menu, widgets and other UI components
		this.context = new Context();
		this.map = new Map(this.Elem('map'));
		this.menu = new Menu();
		this.bMenu = new Menu();

		this.menu.AddOverlay("selector", Core.Nls("Selector_Title"), this.Elem("selector"));
		this.menu.AddOverlay("styler", Core.Nls("Styler_Title"), this.Elem("styler"));
		this.menu.AddOverlay("legend", Core.Nls("Legend_Title"), this.Elem("legend"));
		this.menu.AddOverlay("bookmarks", Core.Nls("Bookmarks_Title"), this.Elem("bookmarks"));
		this.menu.AddButton("behaviour", Core.Nls("Behaviour_Title"));
		this.bMenu.AddOverlay("basemap", Core.Nls("Basemap_Title"), this.Elem("basemap"));

		// Move all widgets inside the map div, required for fullscreen
		this.map.Place(this.bMenu.Buttons, "bottom-left");
		this.map.Place(this.menu.Buttons, "top-left");
		this.map.Place([this.Elem("basemap").container], "bottom-left");
		this.map.Place(this.Elems("selector", "styler", "legend", "bookmarks").map(e => e.container), "top-right");
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
		
		this.map.AddMapImageLayer('main', this.config.MapUrl, this.config.MapOpacity);

		this.Elem("table").Headers = this.config.TableHeaders;
		this.Elem('legend').Opacity = this.config.MapOpacity;
		this.Elem('basemap').Map = this.map;
		this.Elem('bookmarks').Map = this.map;
		this.Elem('bookmarks').Bookmarks = this.config.Bookmarks;
	
	    this.config.LegendItems.forEach(i => {
			this.map.AddFeatureLayer(i.id, i.url, i.labels, false);
			this.Elem("legend").AddContextLayer(i.label, i, false);
		})

		this.context.Initialize(config.Context).then(d => {	

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
	
	AddSelectBehavior(map, context, config) {
		var options = {
			layer: context.sublayer,
			field: "GeographyReferenceId",
			symbol: config.Symbol("selection")
		}
		
		var behavior = this.map.AddBehavior("selection", new SelectBehavior(map, options));
		
		this.HandleEvents(behavior, this.OnMap_SelectDraw.bind(this));
	}
	
	AddIdentifyBehavior(map, context, config) {
		var options = {
			layer: context.sublayer,
			symbol: config.Symbol("identify")
		}
		
		var behavior = this.map.AddBehavior("identify", new IdentifyBehavior(map, options));

		this.HandleEvents(behavior);	
	}
	
	HandleEvents(node, changeHandler) {
		if (changeHandler) node.On('Change', changeHandler);
		
		node.On('Busy', this.OnWidget_Busy.bind(this));
		node.On('Idle', this.OnWidget_Idle.bind(this));
		node.On('Error', this.OnApplication_Error.bind(this));
	}
	
    BehaviourButton_Click(ev){
		this.map.Behavior(this.behavior).Deactivate();

		this.behavior = (this.behavior == "identify") ? "selection" : "identify";

		this.map.Behavior(this.behavior).Activate();
	}

	OnSelector_Change(ev) {
		this.map.EmptyLayer('main');
		this.map.AddSubLayer('main', this.context.sublayer);
		
		this.map.Behavior("selection").Reset({ layer:this.context.sublayer });
		
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
		var l = this.map.Layer(ev.data.id);

		if (!l)return;

		l.visible = ev.checked;
	}

	onLegend_LabelName(ev) {
		this.map.layers["main"].findSublayerById(this.context.sublayer.id).labelsVisible = ev.checked;
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
		this.map.Behavior("selection").Layer.remove(ev.graphic);
				
		this.Elem("table").Populate(this.map.Behavior("selection").Graphics);
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
					"<div handle='basemap' class='basemap' widget='App.Widgets.Basemap'></div>" +
					"<div handle='bookmarks' class='bookmarks' widget='App.Widgets.Bookmarks'></div>" +
				"</div>" +
			    "<div handle='table' class='table' widget='App.Widgets.Table'></div>"
	}
}