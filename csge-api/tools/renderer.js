import Core from './core.js';

/**
 * Requests module
 * @module tools/renderer
 */
export default class Renderer {
	
	static DataSourceV1(query) {
		return {
			"type": "queryTable",
			"workspaceId": "stcdv_dyn_service",
			"query": query,
			"oidFields": "GeographyReferenceId",
			"geometryType": "esriGeometryPolygon" 
		}
	}
	
	static DataSourceV2(query) {
		return {
			"type": "query-table",
			"workspaceId": "stcdv_dyn_service",
			"query": query,
			"oidFields": "GeographyReferenceId",
			"geometryType": "polygon" 
		}
	}
	
	static Layer(dataSource) {
		return {
			"id": 7,
			"minScale": null,
			"name": "dyn_layer",
			"source": {
				"dataSource": dataSource,
				"type":"dataLayer"
			}
		}
	}
	
	static Classification(breaks, colors) {
		return {
			"type": "classBreaksDef",
			"classificationField": "Value",
			"classificationMethod": breaks.algo,
			"breakCount": breaks.n,
			"colorRamp": {
				"type":"algorithmic",
				"fromColor": colors.start,
				"toColor":colors.end,
				"algorithm":"esriHSVAlgorithm"
			}
		}
	}
	
	static Data(layer, classif) {
		return {
			f : "json",
			layer: JSON.stringify(layer),
			classificationDef: JSON.stringify(classif)
		}
	}
	
	static Font() {
		return {
			size: 9,
			style: "normal",
			decoration: "none",
			weight: "normal",
			family: "Arial"
		}
	}
	
	static TextSymbol()  {
		return {
			type: "text",
			color: [255, 255, 255, 255],
			haloColor: [0, 0, 0, 255],
			haloSize: 2,
			verticalAlignment: "bottom",
			horizontalAlignment: "left",
			rightToLeft: false,
			angle: 0,
			xoffset: 0,
			yoffset: 0,
			rotated: false,
			kerning: true,
			font: Renderer.Font()
		}
	}
	
	
	static LabelingInfo(labelExpression) {
		return [{
			labelExpression: labelExpression,
			labelPlacement: "always-horizontal",
			useCodedValues: false,
			maxScale: 0,
			minScale: 0,
			where: null,
			symbol: Renderer.TextSymbol(),
			minScale: 0,
			maxScale: 0
		}];
	}
	
	static DefaultSymbol(color) {
		return {
			type: "simple-fill", 
			color: color,
			style: "solid",
			outline: {  
				color: [0, 0, 0, 1],
				width: 1
			}
		}
	}
	
	static Sublayer(renderer, dataSource, labelingInfo) {
		return { 
			id: 7, 
			visible: true,
			labelsVisible: false,
			renderer : ESRI.renderers.support.jsonUtils.fromJSON(renderer.data),
			source: {
				type: "data-layer",
				dataSource: dataSource
			},
			labelingInfo: labelingInfo
		}
	}
	
	/**
	 * Setup ESRI layer
	 * @param {object} context - Object with current indicator
	 * @returns {promise} Promise with sublayer if resolved
	 */
	static Renderer(context) {
		var meta = context.metadata;
		var d = Core.Defer();
		
		var query = `${meta.query} WHERE (g.GeographicLevelId = '${context.geography}')`;
		var dataSource = Renderer.DataSourceV1(query);
		var layer = Renderer.Layer(dataSource);
		var classif = Renderer.Classification(meta.breaks, meta.colors);
		var data = Renderer.Data(layer, classif);
		
		var p = ESRI.request(URLS.renderer, {
			useProxy : true,
			method : "POST",
			responseType  : "json",
			query : (data)
		});
		
		p.then(renderer => {
			renderer.defaultSymbol = Renderer.DefaultSymbol([125,125,125, 1]);
			
			var dataSource = Renderer.DataSourceV2(query);
			var labelingInfo = Renderer.LabelingInfo("[DisplayNameShort_EN]");
			var json = Renderer.Sublayer(renderer, dataSource, labelingInfo);			
			var sublayer = new ESRI.layers.support.Sublayer(json);
			
			d.Resolve(sublayer);
		}, error => { d.Reject(new Error(error.message)) });
		
		return d.promise;
	}
}