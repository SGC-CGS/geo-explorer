import Core from "./tools/core.js";
import Dom from "./tools/dom.js";
import Net from "./tools/net.js";

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
	
	var app = new Application(div, responses[1]);
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
				 "esri/request", 
				 "esri/layers/MapImageLayer", 
				 "esri/layers/FeatureLayer", 
				 "esri/core/urlUtils", 
				 "esri/Map", 
				 "esri/views/MapView"], 
				 
				 function(jsonUtils, 
						  request, 
						  MapImageLayer, 
						  FeatureLayer, 
						  urlUtils, 
						  Map, 
						  MapView) {
			
			window.ESRI = {
				core : { 
					urlUtils : urlUtils
				},
				request : request,
				Map : Map,
				views : {
					MapView : MapView
				},
				renderers : {
					support : {
						jsonUtils : jsonUtils
					}
				},
				layers : {
					MapImageLayer : MapImageLayer,
					FeatureLayer : FeatureLayer
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