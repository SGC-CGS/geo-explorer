 'use strict';

import Core from './tools/core.js';
import Dom from './tools/dom.js';
import Net from './tools/net.js';
import Requests from './tools/requests.js';
import Templated from './components/templated.js';

import Selector from './widgets/selector.js';
import Legend from './widgets/legend.js';
import Search from './widgets/search.js';

export default class Main extends Templated { 

	constructor(node, config) {		
		super(node);

		this.current = { button:null, overlay:null };
		this.config = config;
		
		this.Node('bSelect').On("click", this.OnMenuButton_Click.bind(this, this.Elem("selector")));
		this.Node('bLegend').On("click", this.OnMenuButton_Click.bind(this, this.Elem("legend")));
		
		this.Node('selector').On('Hide', this.OnOverlay_Hide.bind(this, this.Elem('bSelect')));
		this.Node('legend').On('Hide', this.OnOverlay_Hide.bind(this, this.Elem('bLegend')));
		
		// TEMP STUFF
		var proxy = "http://localhost/geo-explorer-proxy/proxy.ashx";
		
		ESRI.core.urlUtils.addProxyRule({
			urlPrefix: "www97.statcan.gc.ca",
			proxyUrl: proxy
		});
		
		// Sample feature layer
		const qLayer = new ESRI.layers.FeatureLayer({
			url: "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/3"
		});
		/*
		// Sample query to feature layer
		var query = qLayer.createQuery();
		
		query.where = "ParentThemeId is null";
		
		qLayer.queryFeatures(query).then(r => {

		}, error => {

		})
		*/
		// Generate Renderer test
		// DATA
		var layer = {"id":7,"minScale":null,"name":"dyn_layer","source":{"dataSource":{"type":"queryTable","workspaceId":"stcdv_dyn_service","query":"SELECT iv.value AS Value, CASE WHEN iv.value IS NULL THEN nr.symbol ELSE Format(iv.value, 'N0', 'en-US') END AS FormattedValue_EN,  CASE WHEN iv.value IS NULL THEN nr.symbol ELSE Format(iv.value, 'N0', 'fr-CA') END AS FormattedValue_FR, grfi.GeographyReferenceId, g.DisplayNameShort_EN, g.DisplayNameShort_FR, g.DisplayNameLong_EN, g.DisplayNameLong_FR, g.ProvTerrName_EN, g.ProvTerrName_FR, g.Shape, i.IndicatorName_EN, i.IndicatorName_FR, i.IndicatorId, i.IndicatorDisplay_EN, i.IndicatorDisplay_FR, i.UOM_EN, i.UOM_FR, g.GeographicLevelId, gl.LevelName_EN, gl.LevelName_FR, gl.LevelDescription_EN, gl.LevelDescription_FR, g.EntityName_EN, g.EntityName_FR, nr.Symbol, nr.Description_EN as NullDescription_EN, nr.Description_FR as NullDescription_FR FROM gis.geographyreference AS g INNER JOIN gis.geographyreferenceforindicator AS grfi ON g.geographyreferenceid = grfi.geographyreferenceid  INNER JOIN (select * from gis.indicator where indicatorId = 216708) AS i ON grfi.indicatorid = i.indicatorid  INNER JOIN gis.geographiclevel AS gl ON g.geographiclevelid = gl.geographiclevelid  INNER JOIN gis.geographiclevelforindicator AS glfi  ON i.indicatorid = glfi.indicatorid  AND gl.geographiclevelid = glfi.geographiclevelid  INNER JOIN gis.indicatorvalues AS iv  ON iv.indicatorvalueid = grfi.indicatorvalueid  INNER JOIN gis.indicatortheme AS it ON i.indicatorthemeid = it.indicatorthemeid  LEFT OUTER JOIN gis.indicatornullreason AS nr  ON iv.nullreasonid = nr.nullreasonid","oidFields":"GeographyReferenceId","geometryType":"esriGeometryPolygon"},"type":"dataLayer"},"definitionExpression":"GeographicLevelId = 'A0007' AND IndicatorId = 216708"};
		
		var classif = {"type":"classBreaksDef","classificationField":"Value","classificationMethod":"esriClassifyNaturalBreaks","breakCount":5,"colorRamp":{"type":"algorithmic","fromColor":[255,204,188,255],"toColor":[183,28,28,255],"algorithm":"esriHSVAlgorithm"}};
		
		var data = {
			f : "json",
			layer: JSON.stringify(layer),
			where: "GeographicLevelId = 'A0007' AND IndicatorId = 216708",
			classificationDef: JSON.stringify(classif)
		}
			
		var p = ESRI.request("https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_dyn/MapServer/dynamicLayer/generateRenderer", {
			useProxy : true,
			method : "POST",
			responseType  : "json",
			query : (data)
		});
		
		p.then(renderer => {			
			// Sample feature layer events
			const mLayer = new ESRI.layers.MapImageLayer({
				url: "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_dyn/MapServer/",
				imageFormat : "png8",
				opacity : 0.75,
				dpi : 96,
				sublayers: [{ 
					id: 7, 
					visible: true,
					definitionExpression:data.where,
					renderer : ESRI.renderers.support.jsonUtils.fromJSON(renderer.data),
					source: {
						type: "data-layer",
						dataSource: {
							type: "query-table",
							workspaceId: "stcdv_dyn_service",
							query: "SELECT iv.value AS Value, CASE WHEN iv.value IS NULL THEN nr.symbol ELSE Format(iv.value, 'N0', 'en-US') END AS FormattedValue_EN,  CASE WHEN iv.value IS NULL THEN nr.symbol ELSE Format(iv.value, 'N0', 'fr-CA') END AS FormattedValue_FR, grfi.GeographyReferenceId, g.DisplayNameShort_EN, g.DisplayNameShort_FR, g.DisplayNameLong_EN, g.DisplayNameLong_FR, g.ProvTerrName_EN, g.ProvTerrName_FR, g.Shape, i.IndicatorName_EN, i.IndicatorName_FR, i.IndicatorId, i.IndicatorDisplay_EN, i.IndicatorDisplay_FR, i.UOM_EN, i.UOM_FR, g.GeographicLevelId, gl.LevelName_EN, gl.LevelName_FR, gl.LevelDescription_EN, gl.LevelDescription_FR, g.EntityName_EN, g.EntityName_FR, nr.Symbol, nr.Description_EN as NullDescription_EN, nr.Description_FR as NullDescription_FR FROM gis.geographyreference AS g INNER JOIN gis.geographyreferenceforindicator AS grfi ON g.geographyreferenceid = grfi.geographyreferenceid  INNER JOIN (select * from gis.indicator where indicatorId = 216708) AS i ON grfi.indicatorid = i.indicatorid  INNER JOIN gis.geographiclevel AS gl ON g.geographiclevelid = gl.geographiclevelid  INNER JOIN gis.geographiclevelforindicator AS glfi  ON i.indicatorid = glfi.indicatorid  AND gl.geographiclevelid = glfi.geographiclevelid  INNER JOIN gis.indicatorvalues AS iv  ON iv.indicatorvalueid = grfi.indicatorvalueid  INNER JOIN gis.indicatortheme AS it ON i.indicatorthemeid = it.indicatorthemeid  LEFT OUTER JOIN gis.indicatornullreason AS nr  ON iv.nullreasonid = nr.nullreasonid WHERE gl.GeographicLevelId = 'A0007' AND i.IndicatorId = 216708",
							geometryType: "esriGeometryPolygon",
							oidFields: "GeographyReferenceId"
						}
					}
				}]
			});
			
			var map = new ESRI.Map({ basemap: "streets", layers: [mLayer] });
				
			var view = new ESRI.views.MapView({
				animation : false,
				center: [-100, 63],
				container: this.Elem('map'), // Reference to the scene div created in step 5
				map: map, // Reference to the map object created before the scene
				zoom: 4 // Sets zoom level based on level of detail (LOD)
			});
			
			mLayer.on("layerview-create", (ev) => {

			})
			
			map.add(mLayer);
		})
	}
	
	OnMenuButton_Click(overlay, ev) {
		if (this.current.overlay) this.current.overlay.Hide();
		
		if (this.current.button) Dom.RemoveCss(this.current.button, "checked");
		
		if (this.current.overlay == overlay) this.current = { button:null, overlay:null };
		
		else {
			this.current = { button:ev.target, overlay:overlay };
			
			this.current.overlay.Show();
			
			Dom.AddCss(this.current.button, "checked");
		}
	}
	
	OnOverlay_Hide(button, ev) {
		Dom.RemoveCss(this.current.button, "checked");
		
		this.current = { button:null, overlay:null };
	}
	
	OnError(error) {
		debugger;
	}
	
	OnEsri_Ready(ev) {
		
		
	}

	Template() {
		return	"<div class='top-container'>" +
					"<img class='button-icon search' src='./assets/search-24.png' alt='nls(Search_Icon_Alt)' />" +
					"<div handle='search' widget='App.Widgets.Search'></div>" +
				"</div>" +
				"<div class='map-container'>" +
					"<div handle='map'></div>" +
					"<div handle='selector' widget='App.Widgets.Selector'></div>" +
					"<div handle='legend' widget='App.Widgets.Legend'></div>" +
					"<div class='menu-container menu-overlay'>" +
						"<button handle='bSelect' title='nls(Selector_Title)' class='button-icon select'></button>" +
						"<button handle='bLegend' title='nls(Legend_Title)' class='button-icon legend'></button>" +
					"</div>" +
				"</div>";
	}
}