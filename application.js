'use strict';

import Core from '../geo-explorer-api/tools/core.js';
import CODR from '../geo-explorer-api/tools/codr.js';
import Dom from '../geo-explorer-api/tools/dom.js';
import Templated from '../geo-explorer-api/components/templated.js';
import Menu from '../geo-explorer-api/widgets/menu.js';
import Waiting from '../geo-explorer-api/widgets/waiting.js';
import Overlay from '../geo-explorer-api/widgets/overlay.js';
import IdentifyBehavior from '../geo-explorer-api/behaviors/point-identify.js';
import SimpleLegend from './widgets/SimpleLegend.js';
import Selector from './widgets/selector.js';
import Table from './widgets/SimpleTable.js';
import Configuration from './components/config.js';
import Style from './util/style.js';
import Map from './map.js';

export default class Application extends Templated { 

	static Nls(nls) {		
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
		nls.Add("Fullscreen_Title", "en", "Fullscreen");
		nls.Add("Fullscreen_Title", "fr", "Plein écran");		
		nls.Add("Home_Title", "en", "Default map view");
        nls.Add("Home_Title", "fr", "Vue cartographique par défaut");		
        nls.Add("Table_Header", "en", "Data Table for ");
        nls.Add("Table_Header", "fr", "Tableau de données pour ");
	}

	constructor(node, config) {		
		super(node);

		this.config = Configuration.FromJson(config);

        // Build map, menu, widgets and other UI components
        this.map = new Map(this.Elem('map'), {
            center: [-100, 60],
            zoom: 5,
            basemap: this.config.Basemap
        });
		this.menu = new Menu();
		
		this.AddPointIdentify();
		this.AddOverlay(this.menu, "legend", this.Nls("Legend_Title"), this.Elem("legend"), "top-right");
        
		// Move all widgets inside the map div, required for fullscreen
		this.map.Place(this.menu.buttons, "top-left");
        this.map.Place([this.Elem("waiting").container], "manual");
		
		this.Node("selector").On("Change", this.OnSelector_Change.bind(this));
			
        this.LoadCodrData(this.config.product);

		this.map.view.when(d => {	

			// Work around to allow nls use on button title. 


			this.map.view.container.querySelector(".esri-fullscreen").title = this.Nls("Fullscreen_Title"); 
			this.map.view.container.querySelector(".esri-home").title = this.Nls("Home_Title"); 	
		}, error => this.OnApplication_Error(error));

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
		var options = { title:title, widget:widget, css:id };
		var overlay = new Overlay(this.Elem("map-container"), options);
		
		menu.AddOverlay(id, title, overlay);
		
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
        var selectedGeo = this.Elem("selector").GetSelectedGeoLevelName();
        this.indicatorTitle = selectedGeo + ", " + this.metadata.IndicatorLabel(ev.coordinates);

        this.Elem("indicator").innerHTML = this.indicatorTitle;
        this.Elem("tableHeader").innerHTML = this.Nls("Table_Header") + this.indicatorTitle + ":";
		this.Elem("refper").innerHTML = this.Nls("RefPeriod_Label", [this.metadata.date]);
		this.Elem("waiting").Show();

        CODR.GetCoordinateData(this.metadata, ev.coordinates).then(data => {
			this.data = data;			
			
            this.LoadLayer(ev.geo, data);

            this.LoadTable(data);        
		}, error => this.OnApplication_Error(error));
	}
	
    LoadLayer(geo, data) {		
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
            var layer = this.map.AddFeatureLayer("geo", url, exp, this.config.Id(decodedGeo), renderer, 0);

            this.WaitForLayer(layer);

            this.behavior.Clear();
            this.behavior.target = layer;

            this.Elem("legend").LoadClassBreaks(this.map.layers.geo.renderer);
        }
        else {
            // Remove the waiting symbol
            this.Elem("waiting").Hide();
            this.Elem("legend").EmptyClassBreaks();
        }
    }

    LoadTable(data) {
        this.Elem("table").Clear();
        this.Elem("table").Populate(this.metadata, data, this.codesets);
    }
	
	WaitForLayer(layer) {
		this.map.view.whenLayerView(layer).then(layerView => {				
			// listen until the layerView is loaded
			layerView.when(() => {
				this.menu.SetOverlay(this.menu.Item("legend"));
                this.Elem("waiting").Hide();
			}, this.OnApplication_Error.bind(this));
		}, this.OnApplication_Error.bind(this))
	}
	
    OnIdentify_Change(ev) {
        // Get the polygon name and id as the bubble title. For example: Ottawa(350421)
        var geo = CODR.GeoLookup(this.metadata.geoLevel);
        var identify = this.config.Identify(geo);
        var fid = ev.feature.attributes[identify.id];
        var member = this.metadata.geoMembers.find(dp => dp.code == fid);

        var geoVintage = "";
        if (member) {
            geoVintage = member.vintage;
        }

        // Derive the DGUID from the vintage, type, schema and geographic feature id
        var dguid = CODR.GetDGUID(this.metadata.geoLevel, geoVintage, fid);
        var title = ev.feature.attributes[identify.name] + " (" + dguid + ")";

        // Get the value corresponding to the datapoint, properly formatted for French and English
        // Ex: French: 35 024, 56   -   English 35, 204.56        
        var content = this.codesets.FormatDP_HTMLTable(this.data[fid], geoVintage);
		
		this.map.popup.open({ location:ev.mapPoint, title:title, content: content });
    }
		
	OnApplication_Error(error) {
		this.Elem("waiting").Hide();
		
		alert(error.message);
		
		console.error(error);
	}

	Template() {		
        return  "<div class='row'>" +
                    "<h2 handle='loadingtitle' class='col-md-12 mrgn-tp-sm'>nls(LoadingData_Title)</h2>" +
				"</div>" +
                "<div handle='selector' class='selector' widget='App.Widgets.Selector'></div>" +
                "<div class='text-center mrgn-tp-md'><a href='#simpletable' class='wb-inv wb-show-onfocus wb-sl'>nls(SkipTheMapLink)</a></div>" +
				"<h2 handle='indicator' property='name' class='indicator mrgn-tp-sm'></h2>" + 
				"<label handle='refper' property='name' class='mrgn-tp-sm'></label>" + 
				"<div class='map-container hidden' handle='mapcontainer'>" +
                    "<div handle='map'></div>" +
                    "<div handle='legend' class='legend' widget='App.Widgets.SimpleLegend'></div>" +
                    "<div handle='waiting' class='waiting' widget='App.Widgets.Waiting'></div>" +
				"</div>" +
				"<div class='pull-right'>" + 
					"<a handle='link' target='_blank'></a>" +
                "</div>" +
                "<label handle='tableHeader' property='name' class='tableHeader mrgn-tp-lg'></label>" +
                "<div id='simpletable' handle='table' class='table' widget='App.Widgets.SimpleTable'></div>";
	}
}