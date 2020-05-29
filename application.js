 'use strict';

import Core from './tools/core.js';
import Dom from './tools/dom.js';
import Net from './tools/net.js';
import Requests from './tools/requests.js';
import Templated from './components/templated.js';

import Map from './components/map.js';
import Selector from './widgets/selector.js';
import Legend from './widgets/legend.js';
import Search from './widgets/search.js';

export default class Main extends Templated { 

	constructor(node, config) {		
		super(node);

		this.current = { button:null, overlay:null };
		this.queryLayer = null;
		this.config = config;
		
		this.Node('bSelect').On("click", this.OnMenuButton_Click.bind(this, this.Elem("selector")));
		this.Node('bLegend').On("click", this.OnMenuButton_Click.bind(this, this.Elem("legend")));
		
		this.Node('selector').On('Hide', this.OnOverlay_Hide.bind(this, this.Elem('bSelect')));
		this.Node('selector').On('Change', this.OnSelector_Change.bind(this));
		this.Node('selector').On('Error', this.OnApplication_Error.bind(this));

		this.Node('legend').On('Hide', this.OnOverlay_Hide.bind(this, this.Elem('bLegend')));
		this.Node('legend').On('Change', this.OnLegend_Change.bind(this));
		this.Node('legend').On('Error', this.OnApplication_Error.bind(this));
		
		this.Node('search').On('Change', this.OnSearch_Change.bind(this));
		this.Node('search').On('Error', this.OnApplication_Error.bind(this));

		this.map = new Map(this.Elem('map'));
		
		this.map.On("Click", this.OnMap_Click.bind(this));
		
		this.map.AddMapImageLayer('main', "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_dyn/MapServer/", 0.75);
		this.map.AddGraphicsLayer('identify');
		
		this.Elem("selector").InitialRenderer();
		
		// Move the buttons to the ArcGIS Menu top-left.
		this.map.view.ui.add(this.Elem("bSelect"), "top-left");
		this.map.view.ui.add(this.Elem("bLegend"), "top-left");
	}
	
	OnMenuButton_Click(overlay, ev) {
		var isSame = this.current.overlay == overlay;
		
		if (this.current.overlay) this.current.overlay.Hide();
		
		if (this.current.button) Dom.RemoveCss(this.current.button, "checked");
		
		if (!isSame) {
			this.current = { button:ev.target, overlay:overlay };
			
			this.current.overlay.Show();
			
			Dom.AddCss(this.current.button, "checked");
		}
	}
	
	OnOverlay_Hide(button, ev) {
		Dom.RemoveCss(this.current.button, "checked");
		
		this.current = { button:null, overlay:null };
	}
	
	OnSelector_Change(ev) {		
		this.map.EmptyLayer('main');
		
		Requests.Renderer(ev.metadata).then(sublayer => {
			this.queryLayer = sublayer;
		
			this.map.AddSubLayer('main', sublayer);
			
			this.Elem("legend").Update(ev.metadata, sublayer);
		}, (error) => this.OnApplication_Error({ error:error }));
	}
	
	OnLegend_Change(ev) {
		var symbol = this.queryLayer.renderer.classBreakInfos[0].symbol;
		
		var json = this.queryLayer.renderer.toJSON();
		
		json.min = ev.breaks[0].min;
		
		json.classBreakInfos = ev.breaks.map(b => {
			symbol.color = b.color;
			
			return {
				description : "",
				label : `${b.min} - ${b.max}`,
				classMaxValue: b.max,
				symbol: symbol.toJSON()
			}
		})
		
		this.queryLayer.renderer = ESRI.renderers.support.jsonUtils.fromJSON(json);		
	}
	
	OnSearch_Change(ev) {
		this.map.GoTo(ev.feature.geometry);
	}
	
	OnMap_Click(ev) {		
		this.Emit("Click", ev);
		
		Requests.Identify(this.queryLayer, ev.mapPoint).then(f => {
			var locale = Core.locale.toUpperCase();
			var symbol = this.config.symbols.identify;
			
			this.map.ClearGraphics('identify');
			this.map.AddGraphic('identify', f.geometry, f.attributes, symbol);	
			
			var content = `<b>${f.attributes["UOM_EN"]}</b>: ${f.attributes["FormattedValue_EN"]}<br><br>`;
			
			content += f.attributes["IndicatorDisplay_EN"];
			
			this.map.Popup(ev.mapPoint, content, f.attributes["DisplayNameShort_EN"]);
		}, error => {
			this.OnApplication_Error(error);
		})
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
					"<div handle='legend' widget='App.Widgets.Legend'></div>" +
					"<button handle='bSelect' title='nls(Selector_Title)' class='button-icon large-icon select'></button>" +
					"<button handle='bLegend' title='nls(Legend_Title)' class='button-icon large-icon legend'></button>" +
				"</div>";
	}
}