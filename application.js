'use strict';

import Core from '../geo-explorer-api/tools/core.js';
import CODR from '../geo-explorer-api/tools/codr.js';
import Dom from '../geo-explorer-api/tools/dom.js';
import Widget from '../geo-explorer-api/components/base/widget.js';
import Menu from '../geo-explorer-api/components/menu.js';
import IdentifyBehavior from '../geo-explorer-api/behaviors/point-identify.js';
import Waiting from '../geo-explorer-api/widgets/waiting.js';
import Overlay from '../geo-explorer-api/widgets/overlay.js';
import Navbar from '../geo-explorer-api/widgets/navbar.js';
import Legend from '../geo-explorer-api/widgets/legend/legend.js';
import Selector from './widgets/selector.js';
import Table from './widgets/table.js';
import Configuration from './components/config.js';
import Style from './util/style.js';
import Map from './components/map.js';

export default class Application extends Widget { 

	
	constructor(container, config) {		
		super(container);

		this.config = Configuration.FromJson(config);

        // Build map, menu, widgets and other UI components
        this.map = new Map(this.Elem('map'), this.config.Map);
		
		this.menu = new Menu();
		
		this.navbar = new Navbar();
		this.navbar.Configure(this.map);
		
		this.AddPointIdentify();
        this.AddOverlay(this.menu, "legend", this.Nls("Legend_Title"), this.Elem("legend"), "top-right");
        this.menu.DisableMenuButton("legend"); // until data is available on the map
        
		// Move all widgets inside the map div, required for fullscreen
		this.map.Place(this.menu.buttons, "top-left");
        this.map.Place([this.Elem("waiting").container], "manual");
		
		this.Node("selector").On("Change", this.OnSelector_Change.bind(this));
		
        this.LoadCodrData(this.config.product);

		/* 
		// NOTE: This should work but for some reason, it only works on every other click.
		// Listen for SceneView click events
		this.map.view.on("click", ev => {  
			// Search for symbols on click's position
			this.map.view.hitTest(ev.screenPoint).then(response => {
				// Retrieve the first symbol
				var result = response.results[0];
				
				if (!result) return;

				this.ShowInfoPopup(result.mapPoint, result.graphic);

				// We now have access to its attributes
				console.log(result.graphic.attributes);
			});
		}); 
		*/
	}

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Title", "en", "Legend");
		nls.Add("Legend_Title", "fr", "Légende");
		nls.Add("LoadingData_Title", "en", "Loading Data...");
		nls.Add("LoadingData_Title", "fr", "Chargement des données...");
		nls.Add("TableViewer_Label", "en", "Statistics Canada. Table {0}");
		nls.Add("TableViewer_Label", "fr", "Statistique Canada. Tableau {0}");
		nls.Add("RefPeriod_Label", "en", "Reference period {0}");
        nls.Add("RefPeriod_Label", "fr", "Période de référence {0}");
        nls.Add("SkipTheMapLink", "en", "Skip the visual interactive map and go directly to the information table section.");
        nls.Add("SkipTheMapLink", "fr", "Ignorez la carte visuelle interactive et accédez directement à la section du tableau d'informations.");
        nls.Add("Map_Header", "en", "Thematic map for ");
        nls.Add("Map_Header", "fr", "Carte thématique pour ");
        nls.Add("Table_Header", "en", "Data table for ");
        nls.Add("Table_Header", "fr", "Tableau de données pour ");
	}
	
	AddPointIdentify() {
		// point identify click behavior
		this.behavior = this.map.AddBehavior("identify", new IdentifyBehavior(this.map));
		
		this.behavior.symbol = this.config.Symbol("identify");
		
		this.behavior.On('Busy', ev => this.Elem("waiting").Show());
		this.behavior.On('Idle', ev => this.Elem("waiting").Hide());
		this.behavior.On('Error', this.OnApplication_Error.bind(this));
		this.behavior.On('Change', this.OnIdentify_Change.bind(this));
		
        this.behavior.Activate();
	}
	
	AddOverlay(menu, id, title, widget, position) {
		var overlay = new Overlay();
		
		overlay.Configure({ id:id, widget:widget, title:title, css:id });
		
		menu.AddOverlay(overlay);
		
		this.map.Place([overlay.roots[0]], position);
	}

	LoadCodrData(product) {
        CODR.GetCubeMetadata(product).then(metadata => {	
            this.metadata = metadata;
	
			document.querySelector("#app-title").innerHTML = metadata.productName;

			// Format the product ID according to CODR practices (DD-DD-DDDD)
            var formattedId = metadata.productLabel;
            this.tableLinkText = this.Nls("TableViewer_Label", [formattedId]);
            this.Elem("link").innerHTML = this.tableLinkText + " - " + this.metadata.name; 
			this.Elem("link").href = metadata.tvLink; 
			
            // Create the drop down lists from the dimensions and memebers
			this.Elem("selector").Initialize(this.metadata);

            this.Elem("mapcontainer").className = "map-container";
            this.Elem("loadingtitle").className = "loading-title hidden";
			
			if (!this.config.initialSelection) return;
			
			this.Elem("selector").ApplyInitialSelection(this.config.initialSelection);
        }, error => this.OnApplication_Error(error));

        CODR.GetCodeSets().then(codesets => {
            this.codesets = codesets;
        }, error => this.OnApplication_Error(error));
    }

    OnSelector_Change(ev) {
        var geo = this.Elem("selector").GetSelectedGeoLevelName().toLowerCase();
        var indicator = geo + ", " + this.metadata.IndicatorLabel(ev.coordinates);

        this.Elem("indicator").innerHTML = this.Nls("Map_Header") + indicator;
        this.Elem("tableHeader").innerHTML = this.Nls("Table_Header") + indicator;
		this.Elem("refper").innerHTML = this.Nls("RefPeriod_Label", [this.metadata.date]);
		this.Elem("waiting").Show();

        CODR.GetCoordinateData(this.metadata, ev.coordinates).then(data => {
			this.data = data;			
			var uoms = [];
			
			for (var id in data) {
				var uom = this.codesets.uom(data[id].uom);
		
				if (uoms.indexOf(uom) == -1) uoms.push(uom);
			}
			
			this.LoadLayer(ev.geo, data, uoms[0]);
            this.LoadTable(data);        
		}, error => this.OnApplication_Error(error));
	}
	
    LoadLayer(geo, data, uom) {		
		var decodedGeo = CODR.GeoLookup(geo);
        var url = this.config.Layer(decodedGeo);
		
		if (!url) {
            this.OnApplication_Error(new Error("Geographic Level (geoLevel) requested is not supported."));			
			return;
		}
		
        var ids = this.metadata.geoMembers.map(m => `'${m.code}'`).join(",");
        var exp = `${this.config.Id(decodedGeo)} IN (${ids})`;
		
        // Remove the current layer if it exists before adding a new one
        this.map.RemoveFeatureLayer("geo");
		
        var renderer = Style.Renderer(data, this.config.Id(decodedGeo), this.config.ramps, this.config.defColor);
		
        if (renderer) {
			var identify = this.config.Identify(decodedGeo)
            var layer = this.map.AddFeatureLayer("geo", url, exp, identify.id, renderer, 0);

            this.WaitForLayer(layer);

            this.behavior.Clear();
            this.behavior.target = layer;

            this.Elem("legend").LoadClassBreaks(this.map.layers.geo.renderer, uom);
            this.menu.EnableMenuButton("legend");
        }
        else {
            // Remove the waiting symbol
            this.Elem("waiting").Hide();
            this.Elem("legend").EmptyClassBreaks();
            this.menu.DisableMenuButton("legend"); // until data is available on the map
        }
    }

    LoadTable(data) {
        this.Elem("table").Clear();
        this.Elem("table").Populate(this.metadata, data, this.codesets);
    }
	
	WaitForLayer(layer) {
		this.map.view.whenLayerView(layer).then(layerView => {				
			layerView.when(() => {
				this.menu.SetOverlay(this.menu.Item("legend"));
                this.Elem("waiting").Hide();
			}, this.OnApplication_Error.bind(this));
		}, this.OnApplication_Error.bind(this))
	}
	
    OnIdentify_Change(ev) {
		this.ShowInfoPopup(ev.mapPoint, ev.feature);
    }
	
	ShowInfoPopup(mapPoint, feature) {
        // Get the polygon name and id as the bubble title. For example: Ottawa(350421)
        var geo = CODR.GeoLookup(this.metadata.geoLevel);
        var identify = this.config.Identify(geo);
        var fid = feature.attributes[identify.id];
        var member = this.metadata.geoMembers.find(dp => dp.code == fid);

        var geoVintage = "";
        if (member) {
            geoVintage = member.vintage;
        }

        // Derive the DGUID from the vintage, type, schema and geographic feature id
        var dguid = CODR.GetDGUID(this.metadata.geoLevel, geoVintage, fid);
        var title = feature.attributes[identify.name] + " (" + dguid + ")";

        // Get the value corresponding to the datapoint, properly formatted for French and English
        // Ex: French: 35 024, 56   -   English 35, 204.56        
        var content = this.codesets.FormatDP_HTMLTable(this.data[fid], geoVintage);
		
		this.map.popup.open({ location:mapPoint, title:title, content: content });
	}
	
	OnApplication_Error(error) {
		this.Elem("waiting").Hide();
		
		alert(error.message);
		
		console.error(error);
	}

	HTML() {		
        return  "<div class='row'>" +
                    "<h2 handle='loadingtitle' class='col-md-12 mrgn-tp-sm'>nls(LoadingData_Title)</h2>" +
				"</div>" +
                "<div handle='selector' class='selector' widget='App.Widgets.Selector'></div>" +
                "<div class='text-center mrgn-tp-md'><a href='#table' class='wb-inv wb-show-onfocus wb-sl'>nls(SkipTheMapLink)</a></div>" +
				"<h2 handle='indicator' property='name' class='indicator mrgn-tp-sm'></h2>" + 
				"<label handle='refper' property='name' class='mrgn-tp-sm'></label>" + 
				"<div class='map-container hidden' handle='mapcontainer'>" +
                    "<div handle='map'></div>" +
                    "<div handle='legend' class='legend' widget='Api.Widgets.Legend'></div>" +
                    "<div handle='waiting' class='waiting' widget='Api.Widgets.Waiting'></div>" +
				"</div>" +
				"<div class='pull-right'>" + 
					"<a handle='link' target='_blank'></a>" +
                "</div>" +
				"<h2 handle='tableHeader' property='name' class='tableHeader mrgn-tp-lg'></h2>" +
                "<div id='table' handle='table' class='table' widget='App.Widgets.Table'></div>";
	}
}