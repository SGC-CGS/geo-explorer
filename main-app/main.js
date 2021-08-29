import Core from "../geo-explorer-api/tools/core.js";
import Dom from "../geo-explorer-api/tools/dom.js";
import Net from "../geo-explorer-api/tools/net.js";
import Requests from "../geo-explorer-api/tools/requests.js";

import Application from "./application.js";

if (wb && wb.isReady) DocumentReady();

else $(document).on("wb-ready.wb", ev => DocumentReady());

function DocumentReady() {	
	var p1 = Net.JSON(`./application.json`);
	var p2 = LoadEsri();

	Promise.all([p1, p2]).then(Start, Fail);
}

function Start(responses) {	
	var params = Net.ParseUrlQuery();

	if (params.subject) responses[0].context.subject = +params.subject;
	if (params.theme) responses[0].context.theme = +params.theme;
	if (params.category) responses[0].context.category = +params.category;
	if (params.filters) responses[0].context.filters = params.filters.split(".").map(f => +f);
	if (params.value) responses[0].context.value = +params.value;
	if (params.geography) responses[0].context.geography = params.geography;
	
	var div = Dom.Node(document.body, "#app-container");
	
	var app = new Application(div, responses[0]);
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
				 "esri/Color", 
				 "esri/Map", 
				 "esri/Graphic", 
				 "esri/views/MapView", 
				 "esri/views/draw/Draw",
				 "esri/widgets/BasemapGallery", 
				 "esri/widgets/Bookmarks", 
				 "esri/widgets/Fullscreen", 
				 "esri/widgets/Home",
                 "esri/intl"], 				 
				 
				 function(jsonUtils, 
						  Renderer, 
						  request, 
						  MapImageLayer, 
						  FeatureLayer, 
						  GraphicsLayer, 
						  Sublayer, 
						  urlUtils, 
						  watchUtils, 
						  Color, 
						  Map, 
						  Graphic, 
						  MapView, 
						  Draw, 
						  BasemapGallery, 
						  Bookmarks, 
						  Fullscreen,
						  Home,
						  intl) {							  
			
			window.ESRI = {
                intl : intl,
				core : { 
					urlUtils : urlUtils,
					watchUtils : watchUtils
				},
				request : request,
				Color : Color,
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
					BasemapGallery : BasemapGallery,
					Bookmarks : Bookmarks,
					Home: Home
				}
			}

			// TODO: This won't hold once deployed. Need to find a better way of setting the proxy.
			var ext = (navigator.appVersion.indexOf("Win") == -1) ? "jsp" : "ashx";
			
			urlUtils.addProxyRule({
				urlPrefix: "www97.statcan.gc.ca",
				proxyUrl: `${location.origin}/geo-explorer-proxy/proxy.${ext}`
			});
			
			d.Resolve();
		});
	});
	
	esriJs.setAttribute('src','./reference/dojo.js');
	
	document.head.appendChild(esriJs);
	
	return d.promise;
}