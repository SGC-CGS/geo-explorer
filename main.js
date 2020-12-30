import Core from "../geo-explorer/tools/core.js";
import Dom from "../geo-explorer/tools/dom.js";
import Net from "../geo-explorer/tools/net.js";

import Application from "./application.js";

Core.WaitForDocument().then(DocumentReady);

window.ESRI = null;

function DocumentReady() {	
	var p1 = Net.JSON(`./nls.json`);
	var p2 = Net.JSON(`./application.json`);
	var p3 = LoadEsri();

	Promise.all([p1, p2, p3]).then(Start, Fail);
}

function Start(responses) {	
	Core.locale = document.documentElement.lang || "en";
	Core.nls = responses[0];
	
	var config = responses[1];
	
	config.data = {
		product: Net.GetUrlParameter("pid"),
		coordinates: Net.GetUrlParameter("coordinates"),
		geo: Net.GetUrlParameter("geo")
	}
	
	if (!config.data.product || !config.data.coordinates || !config.data.geo) {
		throw new Error("Missing URL parameter, pid (Product id), geo (geographic level) and/or coordinates.");
	}
	
	config.data.product = +config.data.product;
	
	if (isNaN(config.data.product)) {
		throw new Error("pid (Product id) provided is not a number.");
	}
	
	config.data.coordinates = config.data.coordinates.split(".").map(c => {
		return c == "*" ? c : +c;		
	});
	
	if (config.data.coordinates.indexOf("*") == -1) {
		throw new Error("No geometry dimension identified in coordinates provided. The geometry dimension must be identified by an asterisk (*)");
	}
	
	var div = Dom.Node(document.body, "#app-container");
	
	var app = new Application(div, config);
}

function Fail(response) {
	alert("Unable to load application.");
	
	throw(new Error("Unable to load application."));
}

function LoadEsri() {
	var d = Core.Defer();

	var esriJs = document.createElement('script');

	esriJs.addEventListener("load", (ev) => {
		require(["esri/renderers/support/jsonUtils", 
				 "esri/renderers/Renderer",
				 "esri/renderers/SimpleRenderer",
				 "esri/renderers/UniqueValueRenderer",
				 "esri/renderers/ClassBreaksRenderer",
				 "esri/symbols/SimpleFillSymbol",
				 "esri/request", 
				 "esri/layers/MapImageLayer", 
				 "esri/layers/FeatureLayer", 
				 "esri/layers/GraphicsLayer", 
				 "esri/layers/support/Sublayer", 
				 "esri/core/urlUtils", 
				 "esri/core/watchUtils", 
				 "esri/Map", 
				 "esri/Graphic", 
				 "esri/views/MapView", 
				 "esri/views/draw/Draw",
				 "esri/widgets/BasemapGallery", 
				 "esri/widgets/Bookmarks", 
				 "esri/widgets/Fullscreen"], 
				 
				 function(jsonUtils, 
						  Renderer, 
						  SimpleRenderer, 
						  UniqueValueRenderer, 
						  ClassBreaksRenderer, 
						  SimpleFillSymbol, 
						  request, 
						  MapImageLayer, 
						  FeatureLayer, 
						  GraphicsLayer, 
						  Sublayer, 
						  urlUtils, 
						  watchUtils, 
						  Map, 
						  Graphic, 
						  MapView, 
						  Draw, 
						  BasemapGallery, 
						  Bookmarks, 
						  Fullscreen) {
			
			window.ESRI = {
				core : { 
					urlUtils : urlUtils,
					watchUtils : watchUtils
				},
				request : request,
				Map : Map,
				Graphic : Graphic,
				views : {
					MapView : MapView,
					draw : {
						Draw : Draw
					}
				},
				renderers : {
					Renderer : Renderer,
					SimpleRenderer : SimpleRenderer,
					UniqueValueRenderer : UniqueValueRenderer,
					ClassBreaksRenderer : ClassBreaksRenderer,
					support : {
						jsonUtils : jsonUtils
					}
				},
				symbols : {
					SimpleFillSymbol : SimpleFillSymbol
				},
				layers : {
					MapImageLayer : MapImageLayer,
					FeatureLayer : FeatureLayer,
					GraphicsLayer : GraphicsLayer,
					support : {
						Sublayer : Sublayer
					}
				},
				widgets : {
					Fullscreen : Fullscreen,
					BasemapGallery : BasemapGallery,
					Bookmarks : Bookmarks
				}
			}

			urlUtils.addProxyRule({
				urlPrefix: "www97.statcan.gc.ca",
				proxyUrl: `${location.origin}/../geo-explorer-proxy/proxy.ashx`
			});
			
			d.Resolve();
		});
	});
	
	esriJs.setAttribute('src','./reference/dojo.js');
	
	document.head.appendChild(esriJs);
	
	return d.promise;
}