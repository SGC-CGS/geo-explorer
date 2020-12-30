'use strict';

import Core from '../geo-explorer/tools/core.js';
import CODR from './util/codr.js';
import Templated from '../geo-explorer/components/templated.js';
import Map from './map.js';
import Menu from '../geo-explorer/widgets/menu.js';
import Search from '../geo-explorer/widgets/search.js';
import Waiting from '../geo-explorer/widgets/waiting.js';
import Basemap from '../geo-explorer/widgets/basemap.js';
import Bookmarks from '../geo-explorer/widgets/bookmarks.js';
import Configuration from './components/config.js';
import Style from './util/style.js';

export default class Application extends Templated { 

	constructor(node, config) {		
		super(node);

		this.config = Configuration.FromJson(config);

		// Build context, map, menu, widgets and other UI components
		this.map = new Map(this.Elem('map'));
		this.menu = new Menu();
		
		this.menu.AddOverlay("basemap", Core.Nls("Basemap_Title"), this.Elem("basemap"));

		// Move all widgets inside the map div, required for fullscreen
		this.map.Place(this.menu.Buttons, "bottom-left");
		this.map.Place([this.Elem("basemap").container], "bottom-left");

		// Hookup events to map	
		this.map.On('Busy', this.OnWidget_Busy.bind(this));
		this.map.On('Idle', this.OnWidget_Idle.bind(this));
		this.map.On('Error', this.OnApplication_Error.bind(this));
		
		this.Elem('basemap').Map = this.map;
		
		var p = this.LoadCodrData(this.config.product, this.config.coordinates, this.config.geo);
		
		p.then(this.OnCodr_Ready.bind(this), this.OnApplication_Error.bind(this));
	}
	
	LoadCodrData(product, coordinates, geo) {
		var d = Core.Defer();
		
		CODR.GetCubeMetadata(product).then(metadata => {			
			var code = CODR.GeoLookup(geo);
			
			metadata.geo.members = metadata.geo.members.filter(m => m.geoLevel == code);
			
			CODR.GetCoordinateData(metadata, coordinates).then(data => {
				d.Resolve({ metadata:metadata, data:data });
			}, error => d.Reject(error));
		}, error => d.Reject(error));
		
		return d.promise;
	}
	
	LoadLayer(geo) {		
		var url = this.config.layer;
		
		if (!url) {
			d.Reject(new Error("Geographic Level (geoLevel) requested is not supported."));
			
			return;
		}
		
		var ids = this.metadata.geo.members.map(m => `'${m.code}'`).join(",");
		var exp = `${this.config.id} IN (${ids})`;
		
		var renderer = Style.Renderer(this.data, this.config.id, this.config.colors);
		
		return this.map.AddFeatureLayer("geo", url, exp, this.config.id, renderer);
	}
	
	OnCodr_Ready(response) {
		this.metadata = response.metadata;
		this.data = response.data;
		
		this.layer = this.LoadLayer(this.config.geo);
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
				"</div>" +
				"<div class='map-container'>" +
					"<div handle='map'></div>" +
					"<div handle='basemap' class='basemap' widget='App.Widgets.Basemap'></div>" +
				"</div>";
	}
}