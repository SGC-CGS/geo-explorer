'use strict';

import IdentifyBehavior from './behaviors/point-identify.js';

import CODR from '../csge-api/tools/codr.js';
import Dom from '../csge-api/tools/dom.js';
import Style from './util/style.js';

import Widget from '../csge-api/components/base/widget.js';
import Map from './components/map.js';
import Configuration from './components/config.js';

import wLegend from '../csge-api/widgets/legend/legend.js';
import wToolbar from '../csge-api/widgets/toolbar.js';
import wWaiting from '../csge-api/widgets/waiting.js';
import wSelector from './widgets/selector.js';
import wInfoPopup from './widgets/infopopup.js';
import wTable from './widgets/table.js';

export default class Application extends Widget { 

	constructor(container, config) {		
		super();

		this.container = container;
		this.config = Configuration.FromJson(config);

        var nlsLnk = document.querySelector("#nls_link");
		
        if (nlsLnk) nlsLnk.setAttribute("href", this.Nls("Nls_Link", [this.config.product]));
		
        // Build map, menu, widgets and other UI components
        this.map = new Map(this.Elem('map'), this.config.Map);

        this.map.RemoveAttribution();
		
		this.navbar = new wToolbar();

		this.widgets = {
			fullscreen: this.navbar.AddEsriWidget("fullscreen", new ESRI.widgets.Fullscreen({ view: this.map.view })),
			home: this.navbar.AddEsriWidget("home", new ESRI.widgets.Home({ view: this.map.view })),
			legend: this.navbar.AddOverlay("legend", new wLegend()),
			waiting: new wWaiting(),
			table: new wTable(this.config.table),
			selector: new wSelector(),
			infoPopup: new wInfoPopup()
		}		
		
		Dom.AddCss(this.navbar.Button("legend"), "esri-icon-layers");
		
		this.widgets.selector.container = this.Elem("selector");
		this.widgets.table.container = this.Elem("table");
		
		this.map.Place(this.navbar.roots, "top-left");
		this.map.Place(this.widgets.waiting.roots, "manual");
		this.map.Place(this.navbar.Item("legend").overlay.roots, "top-right");
		
        this.navbar.DisableButton("legend"); // until data is available on the map
		
		this.widgets.selector.On("Change", this.OnSelector_Change.bind(this));
		
		this.AddPointIdentify();
		
		var p1 = CODR.GetCubeMetadata(this.config.product);
		var p2 = CODR.GetCodeSets();
        
        Promise.all([p1, p2]).then(this.OnCODR_Ready.bind(this), error => this.OnApplication_Error(error));
	}

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Legend_Title", "en", "Show map legend");
		nls.Add("Legend_Title", "fr", "Afficher la légende cartographique");
		nls.Add("TableViewer_Label", "en", "Statistics Canada. Table {0} - {1}");
		nls.Add("TableViewer_Label", "fr", "Statistique Canada. Tableau {0} - {1}");
		nls.Add("RefPeriod_Label", "en", "Reference period {0}");
        nls.Add("RefPeriod_Label", "fr", "Période de référence {0}");
        nls.Add("SkipTheMapLink", "en", "Skip the visual interactive map and go directly to the data table section. The data table will appear once you have selected an indicator above.");
        nls.Add("SkipTheMapLink", "fr", "Ignorez la carte visuelle interactive et accédez directement à la section du tableau de données. Le tableau de données apparaîtra lorsque vous aurez sélectionné un indicateur ci-haut.");
        nls.Add("Map_Header", "en", "Thematic map for ");
        nls.Add("Map_Header", "fr", "Carte thématique pour ");
        nls.Add("Table_Header", "en", "Data table for ");
        nls.Add("Table_Header", "fr", "Tableau de données pour ");
        nls.Add("Skip_Link", "en", "Skip the visual interactive dashboard and go directly to the Statistics Canada table.");
        nls.Add("Skip_Link", "fr", "Ignorer le tableau de bord visuel interactif et aller directement au tableau de Statistique Canada.");
        nls.Add("Skip_Link_Label", "en", "Start of visual interactive dashboard");
        nls.Add("Skip_Link_Label", "fr", "Début du tableau de bord interactif visuel");

        // Local dev
        nls.Add("Nls_Link", "en", "/Dev/geo-explorer-lite/index-fr.html?pid={0}");
        nls.Add("Nls_Link", "fr", "/Dev/geo-explorer-lite/index-en.html?pid={0}");

        // Server deployments
        //nls.Add("Nls_Link", "en", "/geo-explorer/geo-explorer-lite/index-fr.html?pid={0}");
        //nls.Add("Nls_Link", "fr", "/geo-explorer/geo-explorer-lite/index-en.html?pid={0}");
	}
	
	AddPointIdentify() {
		// point identify click behavior
		this.behavior = this.map.AddBehavior("identify", new IdentifyBehavior(this.map));
		
		this.behavior.symbol = this.config.Symbol("identify");
		
		this.behavior.On('Busy', ev => this.widgets.waiting.Show());
		this.behavior.On('Idle', ev => this.widgets.waiting.Hide());
		this.behavior.On('Error', this.OnApplication_Error.bind(this));
		this.behavior.On('Change', this.OnIdentify_Change.bind(this));
		
        this.behavior.Activate();
	}

    OnCODR_Ready(responses) {
		this.metadata = responses[0];
		this.codesets = responses[1];
		
		this.Elem("app-title").innerHTML = this.metadata.productName;
		
		this.widgets.infoPopup.Configure(this.map, this.config, this.metadata, this.codesets);
		this.widgets.selector.Configure(this.metadata);

		// Format the product ID according to CODR practices (DD-DD-DDDD)
		this.Elem("link").innerHTML = this.Nls("TableViewer_Label", [this.metadata.productLabel, this.metadata.name]);
		this.Elem("link").href = this.metadata.tvLink; 
		
		// Create the drop down lists from the dimensions and memebers
		
		Dom.RemoveCss(document.body, 'wait');
		
		this.Resize();
		
		if (!this.config.initialSelection) return;
		
		this.widgets.selector.ApplyInitialSelection(this.config.initialSelection);
	}

    OnSelector_Change(ev) {
        var geo = this.widgets.selector.GetSelectedGeoLevelName().toLowerCase();
        var indicator = geo + ", " + this.metadata.IndicatorLabel(ev.coordinates);

        this.Elem("indicator").innerHTML = this.Nls("Map_Header") + indicator;
        this.Elem("tableHeader").innerHTML = this.Nls("Table_Header") + indicator;
		this.Elem("refper").innerHTML = this.Nls("RefPeriod_Label", [this.metadata.date]);
		
		this.widgets.waiting.Show();
		
		this.Resize();

        CODR.GetCoordinateData(this.metadata, ev.coordinates).then(data => {
			this.data = data;			
			var uoms = [];
			
			for (var id in data) {
				var uom = this.codesets.uom(data[id].uom);
		
				if (uoms.indexOf(uom) == -1) uoms.push(uom);
			}
			
			this.LoadLayer(ev.geo, data, uoms[0]);
            this.LoadTable(data);     
			this.Resize();
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
		
        var renderer = Style.Renderer(data, this.config.Id(decodedGeo), this.config.ramp, this.config.defColor);
		
        if (renderer) {
			var identify = this.config.Identify(decodedGeo)
            var layer = this.map.AddFeatureLayer("geo", url, exp, identify.id, renderer, 0);

            this.behavior.Clear();
            this.behavior.target = layer;

            this.widgets.legend.LoadClassBreaks(this.map.layers.geo.renderer, uom);

            this.WaitForLayer(layer);
        }
        else {
            this.widgets.waiting.Hide();
            this.widgets.legend.EmptyClassBreaks();
			this.navbar.DisableButton("legend"); // until data is available on the map
        }
    }

    LoadTable(data) {
        this.widgets.table.Clear();
        this.widgets.table.Populate(this.metadata, data, this.codesets);
    }
	
	WaitForLayer(layer) {
		this.map.view.whenLayerView(layer).then(layerView => {				
			layerView.when(() => {
				this.navbar.EnableButton("legend");
				this.navbar.ShowOverlay(this.navbar.Item("legend"));
                this.widgets.waiting.Hide();
			}, this.OnApplication_Error.bind(this));
		}, this.OnApplication_Error.bind(this))
	}
	
    OnIdentify_Change(ev) {
		this.widgets.infoPopup.Show(ev.mapPoint, ev.feature, this.data);
    }
	
	OnApplication_Error(error) {
		this.widgets.waiting.Hide();
		
		alert(error.message);
		
		console.error(error);
	}

	Resize() {
		var data = { event:"resize", height:document.body.getBoundingClientRect().height };
		
		top.postMessage(JSON.stringify(data), "*");  
	}

	HTML() {		
        return  "<h1 handle='app-title' class='mrgn-tp-sm'></h1>" +
				"<div class='text-center'>" +
					"<a href='#bttmsec' class='wb-inv wb-show-onfocus wb-sl'>nls(Skip_Link)</a>" +
				"</div>" +
				"<div class='wb-inv'>nls(Skip_Link_Label)</div>" +
				"<div handle='selector' class='selector'></div>" +
                "<div class='text-center mrgn-tp-md'><a href='#table' class='wb-inv wb-show-onfocus wb-sl'>nls(SkipTheMapLink)</a></div>" +
				"<h2 handle='indicator' property='name' class='indicator mrgn-tp-sm'></h2>" + 
				"<label handle='refper' property='name' class='mrgn-tp-sm'></label>" + 
				"<div handle='mapcontainer' class='map-container'>" +
                    "<div handle='map'></div>" +
				"</div>" +
				"<div>" + 
					"<a id='bttmsec' handle='link' target='_blank' class='pull-left'></a>" +
                "</div>" +
				"<h2 handle='tableHeader' property='name' class='tableHeader mrgn-tp-lg'></h2>" +
				"<div id='table' handle='table' class='table'></div>";
	}
}

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