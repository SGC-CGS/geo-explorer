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

export default class Main extends Templated { 

	constructor(node, config) {		
		super(node);

		this.config = config;
		this.map = new Map(this.Elem('map'));
		this.menu = new Menu(this.map.view.ui);
		
		this.menu.AddOverlay("select", Core.Nls("Selector_Title"), this.Elem("selector"));
		this.menu.AddOverlay("styler", Core.Nls("Styler_Title"), this.Elem("styler"));
		this.menu.AddOverlay("legend", Core.Nls("Legend_Title"), this.Elem("legend"));

		this.Node('selector').On('Change', this.OnSelector_Change.bind(this));
		this.Node('selector').On('Error', this.OnApplication_Error.bind(this));
		
		this.Node('styler').On('Change', this.OnStyler_Change.bind(this));
		this.Node('styler').On('Error', this.OnApplication_Error.bind(this));
		
		this.Node('search').On('Change', this.OnSearch_Change.bind(this));
		this.Node('search').On('Error', this.OnApplication_Error.bind(this));
		
		this.Node('legend').On('Opacity', this.OnLegend_Opacity.bind(this));
		
		this.map.On("Click", this.OnMap_Click.bind(this));
		this.map.On("Error", this.OnApplication_Error.bind(this));
		
		this.map.AddMapImageLayer('main', this.config.map.url, this.config.map.opacity);
		this.map.AddGraphicsLayer('identify');

		this.Elem('legend').opacity = this.config.map.opacity;

		this.context = new Context();

		this.context.Initialize(config.context).then(d => {
			this.map.AddSubLayer('main', this.context.sublayer);
			
			this.Elem("selector").Update(this.context);
			this.Elem("styler").Update(this.context);
			this.Elem("legend").Update(this.context);
			
			this.menu.SetOverlay(this.menu.Item("legend"));
		});
	}
	
	OnSelector_Change(ev) {		
		this.map.EmptyLayer('main');
		this.map.AddSubLayer('main', this.context.sublayer);
		
		this.Elem("styler").Update(this.context);
		this.Elem("legend").Update(this.context);
	}
	
	OnStyler_Change(ev) {
		this.context.sublayer.renderer = ev.renderer;
		
		this.Elem("legend").Update(this.context);
	}
	
	OnSearch_Change(ev) {
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnMap_Click(ev) {		
		this.map.Identify(this.context.sublayer, ev.mapPoint).then((r) => {
			var f = r.feature;
			
			this.map.ClearGraphics('identify');
			this.map.AddGraphic('identify', f.geometry, f.attributes, this.config.symbols.identify);
			
			this.map.Popup(ev.mapPoint, r.content, r.title);
		}, error => this.OnApplication_Error(error));
	}
	
	OnLegend_Opacity(ev) {
		this.map.Layer('main').opacity = ev.opacity;
	}
	
	OnApplication_Error(ev) {
		alert(ev.error.toString());
	}

	Template() {
		return	"<div class='top-container'>" +
					"<img class='button-icon large-icon search' src='./assets/search-24.png' alt='nls(Search_Icon_Alt)' />" +
					"<div handle='search' widget='App.Widgets.Search'></div>" +
				"</div>" +
				"<div class='map-container'>" +
					"<div handle='map'></div>" +
					"<div handle='selector' widget='App.Widgets.Selector'></div>" +
					"<div handle='styler' widget='App.Widgets.Styler'></div>" +
					"<div handle='legend' widget='App.Widgets.Legend'></div>" +
				"</div>";
	}
}