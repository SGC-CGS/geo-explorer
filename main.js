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

function CheckUrlEmpty(config) {
	// if (config.subject === NaN && config.theme === NaN && config.category === NaN && config.filters === null && config.value === NaN && config.geography === null) {
	// 	return true;
	// } else if (config === undefined) {
	// 	return true;
	// } else {
	// 	return false;
	// }
	if (!config.subject && !config.theme && !config.category && !config.filters && !config.value  && !config.geography ) {
		return true;
	} else {
		return false;
	}
}

function Start(responses) {	
	Core.locale = document.documentElement.lang || "en";
	Core.nls = responses[0];

	// load inital data
	var config = new Configuration(responses[1]);

	config.data = {
		subject: parseInt(Net.GetUrlParameter("sub")),
		theme: parseInt(Net.GetUrlParameter("theme")),
		category: parseInt(Net.GetUrlParameter("cat")),
		filters: Net.GetUrlParameter("filters"),
		value: parseInt(Net.GetUrlParameter("val")),
		geography: Net.GetUrlParameter("geo")
	}

	var test = CheckUrlEmpty(config.data);
		

	if (test){
		config.data.subject = 13;
        config.data.theme = 1399;
        config.data.category = 13100113;
        config.data.filters = "3046.3001.3007.3021";
        config.data.value = 3037;
        config.data.geography = "A0007";
	}
	
	if (!config.data.subject || !config.data.theme || !config.data.category || !config.data.filters || !config.data.value || !config.data.geography) {
		throw new Error("Missing URL parameter");
	}

	if (!config.data.filters.includes(".") && config.data.filters) {
		throw new Error("incorrect filter formate")
	}
	
	if (isNaN(config.data.subject)) {
		throw new Error("subject provided is not a number.");
	}

	if (isNaN(config.data.theme)) {
		throw new Error("theme provided is not a number.");
	}

	if (isNaN(config.data.category)) {
		throw new Error("category provided is not a number.");
	}

	if (isNaN(config.data.value)) {
		throw new Error("value provided is not a number.");
	}

	if (!isNaN(config.data.geography)) {
		throw new Error("incorrect geography formate")
	}
	
	config.data.filters = config.data.filters.split(".").map(c => {
		return parseInt(c);		
	});

	config.Context.subject = config.data.subject;
	config.Context.theme = config.data.theme;
	config.Context.category = config.data.category;
	config.Context.filters = config.data.filters;
	config.Context.value = config.data.value;
	config.Context.geography = config.data.geography;
	

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
					Bookmarks : Bookmarks
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