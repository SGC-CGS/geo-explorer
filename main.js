import Core from "./tools/core.js";
import Dom from "./tools/dom.js";
import Net from "./tools/net.js";
import Requests from "./tools/requests.js";
import Configuration from "./components/configuration.js";

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
	
	var div = Dom.Node(document.body, "#app-container");
	
	var app = new Application(div, new Configuration(responses[1]));
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
				 "esri/widgets/BasemapToggle",
				 "esri/widgets/BasemapGallery", 
				 "esri/widgets/BasemapLayerList", 
				 "esri/widgets/Fullscreen"], 
				 
				 
				 
				 function(jsonUtils, 
						  Renderer, 
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
						  BasemapToggle, 
						  BasemapGallery, 
						  BasemapLayerList, 
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
					support : {
						jsonUtils : jsonUtils
					}
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
					BasemapToggle : BasemapToggle,
					BasemapLayerList : BasemapLayerList,
					BasemapGallery : BasemapGallery
				}
			}

			urlUtils.addProxyRule({
				urlPrefix: "www97.statcan.gc.ca",
				proxyUrl: `${location.origin}/geo-explorer-proxy/proxy.ashx`
			});
			
			d.Resolve();
		});
	});
	
	esriJs.setAttribute('src','./reference/dojo.js');
	
	document.head.appendChild(esriJs);
	
	return d.promise;
}