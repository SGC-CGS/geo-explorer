'use strict';

import Core from '../geo-explorer/tools/core.js';
import CODR from '../geo-explorer/tools/codr.js';
import Dom from '../geo-explorer/tools/dom.js';
import Templated from '../geo-explorer/components/templated.js';
import Menu from '../geo-explorer/widgets/menu.js';
import Waiting from '../geo-explorer/widgets/waiting.js';
import Basemap from '../geo-explorer/widgets/basemap.js';
import Overlay from '../geo-explorer/widgets/overlay.js';
import IdentifyBehavior from '../geo-explorer/behaviors/point-identify.js';
import SimpleLegend from './widgets/SimpleLegend.js';
import Selector from './widgets/selector.js';
import Table from './widgets/SimpleTable.js';
import Configuration from './components/config.js';
import Style from './util/style.js';
import Map from './map.js';

export default class Application extends Templated { 

	static Nls(nls) {		
		nls.Add("Basemap_Title", "en", "Change basemap");
		nls.Add("Basemap_Title", "fr", "Changer de fond de carte");
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
	}

	constructor(node, config) {		
		super(node);

		this.config = Configuration.FromJson(config);

		// Build map, menu, widgets and other UI components
		this.map = new Map(this.Elem('map'), { center:[-100, 60], zoom:4 });
		this.menu = new Menu();
		
		this.AddPointIdentify();
		this.AddOverlay(this.menu, "basemap", this.Nls("Basemap_Title"), this.Elem("basemap"), "top-right");
		this.AddOverlay(this.menu, "legend", this.Nls("Legend_Title"), this.Elem("legend"), "top-right");
        
		// Move all widgets inside the map div, required for fullscreen
		this.map.Place(this.menu.buttons, "top-left");
        this.map.Place([this.Elem("waiting").container], "manual");
		
		this.Elem('basemap').Map = this.map;

		this.Node("selector").On("Change", this.OnSelector_Change.bind(this));
			
        this.LoadCodrData(this.config.product);
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
            var formattedId = metadata.id;
            if (metadata.id.length > 4) {
                formattedId = formattedId.substring(0, 2) + "-" + formattedId.substring(2, 4) + "-" + formattedId.substring(4);
            }
            this.Elem("link").innerHTML = this.Nls("TableViewer_Label", [formattedId]); 
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
		this.Elem("indicator").innerHTML = this.metadata.IndicatorLabel(ev.coordinates);
		this.Elem("refper").innerHTML = this.Nls("RefPeriod_Label", [this.metadata.date]);
		this.Elem("waiting").Show();

        CODR.GetCoordinateData(this.metadata, ev.coordinates).then(data => {
			this.data = data;			
			
			this.LoadLayer(ev.geo, data);
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

            this.LoadTable(data);            
		}
    }

    LoadTable(data) {
        this.Elem("table").Clear();
        this.Elem("table").headers = this.config.TableHeaders;
        this.Elem("table").Populate(this.metadata.geoMembers, data, this.codesets);
    }
	
	WaitForLayer(layer) {
		this.map.view.whenLayerView(layer).then(layerView => {				
			// listen until the layerView is loaded
			layerView.when(() => {
				this.menu.SetOverlay(this.menu.Item("legend"));
				this.Elem("waiting").Hide()
			}, this.OnApplication_Error.bind(this));
		}, this.OnApplication_Error.bind(this))
	}
	
    OnIdentify_Change(ev) {
        // Get the polygon name and id as the bubble title. For example: Ottawa(350421)
        var geo = CODR.GeoLookup(this.metadata.geoLevel);
        var identify = this.config.Identify(geo);
        var fid = ev.feature.attributes[identify.id];
	
        // Get the value corresponding to the datapoint, properly formatted for French and English 
        // Ex: French: 35 024, 56   -   English 35, 204.56        
        var title = ev.feature.attributes[identify.name] + " (" + fid + ")";

        // Get the vintage / reference period
        var dataPoint = this.metadata.geoMembers.filter(dp => dp.code == fid);
        var refPer = "";
        if (dataPoint && dataPoint.length > 0) {
            refPer = dataPoint = dataPoint[0].vintage;
        }

        var content = this.codesets.FormatDP_HTMLTable(this.data[fid], refPer);
		
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
                "<div class='text-center'><a href='#simpletable' class='wb-inv wb-show-onfocus wb-sl'>nls(SkipTheMapLink)</a></div>" +
				"<h2 handle='indicator' property='name' class='indicator mrgn-tp-sm'></h2>" + 
				"<label handle='refper' property='name' class='mrgn-tp-sm'></label>" + 
				"<div class='map-container hidden' handle='mapcontainer'>" +
                    "<div handle='map'></div>" +
                    "<div handle='legend' class='legend' widget='App.Widgets.SimpleLegend'></div>" +
                    "<div handle='basemap' class='basemap' widget='App.Widgets.Basemap'></div>" +
                    "<div handle='waiting' class='waiting' widget='App.Widgets.Waiting'></div>" +
				"</div>" +
				"<div class='pull-right'>" + 
					"<a handle='link' target='_blank'></a>" +
                "</div>" +
                "<div id='simpletable' handle='table' class='table' widget='App.Widgets.SimpleTable'></div>";
	}
}