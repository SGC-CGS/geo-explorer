import Core from './core.js';

const URLS = {
	renderer : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_dyn/MapServer/dynamicLayer/generateRenderer",
	value : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/1/query",
	geography : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/2/query",
	indicator : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/3",
	break : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/4",
	filter : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/8"
}

export default class Requests {
	
	static MapFeatures(features, value, label, description) {
		var locale = Core.locale.toUpperCase();
		
		return features.map(f => {
			return {
				value : f.attributes[value],
				label : f.attributes[`${label}_${locale}`],
				description : f.attributes[`${description}_${locale}`]
			}
		});
	}
	
	static Indicator(id, delegate) {
		var d = Core.Defer();
		
		// TODO: Maybe instantiate and keep a copy?
		var layer = ESRI.layers.FeatureLayer({ url:URLS.indicator });
		
		var query = layer.createQuery();
		
		query.where = id == null ? `ParentThemeId is ${id}` : `ParentThemeId = ${id}`;
		query.returnGeometry = false;
		query.outFields = "*";
		query.returnDistinctValues = true;
		
		layer.queryFeatures(query).then(r => {
			var items = Requests.MapFeatures(r.features, "IndicatorThemeId", "IndicatorTheme", "IndicatorThemeDescription");
			
			if (delegate) items = delegate(items);
			
			d.Resolve(items);
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	static Subject(id) {
		return Requests.Indicator(id, items => {
			// TODO: Remove filter if they fix the backend
			return items.filter(i => i.value % 10000 != 9999);
		});
	}
	
	static Theme(id) {
		return Requests.Indicator(id, items => {
			// TODO: Remove filter if they fix the backend
			return items.filter(i => i.value % 10000 != 9999);
		});
	}
	
	static Filter(id) {
		var d = Core.Defer();
		
		var layer = ESRI.layers.FeatureLayer({ url:URLS.filter });
		
		var query = layer.createQuery();
		
		query.where = `IndicatorThemeId = ${id}`;
		query.returnGeometry = false;
		query.outFields = "*";
		query.returnDistinctValues = true;
		
		layer.queryFeatures(query).then(r => {
			var locale = Core.locale.toUpperCase();
			var dimensions = [];
			
			r.features.forEach(f => {
				var i = f.attributes["DisplayOrder"] - 1;

				if (!dimensions[i]) {
					dimensions[i] = {
						id : f.attributes["DimensionId"],
						type : f.attributes["DimensionType"],
						label : f.attributes[`Dimension_${locale}`],
						values : []
					};
				}
				
				dimensions[i].values.push({
					id : f.attributes["DimensionValueId"],
					label : f.attributes[`Display_${locale}`],
					description : null
				});
			});
			
			var filters = dimensions.filter(d => d.type == 'Filter');
			var values = dimensions.filter(d => d.type == 'Value');
			
			if (values.length > 1) d.Reject(new Error("More than one dimension of type Value received."));
			
			else d.Resolve({ filters:filters, value:values[0] });
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	static Value(ids) {
		var d = Core.Defer();
		
		var layer = ESRI.layers.FeatureLayer({ url:URLS.value });
		
		var query = layer.createQuery();
		
		query.where = `DimensionUniqueKey = '${ids.join("-")}'`;
		query.returnGeometry = false;
		query.outFields = "*";
		query.returnDistinctValues = true;
		
		layer.queryFeatures(query).then(r => {
			if (r.features.length > 1) d.Reject(new Error("Received more than one indicator Id."));
			
			var metadata = r.features[0].attributes;
			
			Requests.Geography(metadata).then(items => d.Resolve(items), error => d.Reject(error));
			
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	static Geography(metadata) {
		var d = Core.Defer();
		
		var layer = ESRI.layers.FeatureLayer({ url:URLS.geography });
		
		var query = layer.createQuery();
		
		query.where = `IndicatorId = '${metadata.IndicatorId}'`;
		query.returnGeometry = false;
		query.outFields = "*";
		query.returnDistinctValues = true;
		
		layer.queryFeatures(query).then(r => {
			var items = Requests.MapFeatures(r.features, "GeographicLevelId", "LevelName", "LevelDescription");
			
			// TODO: Remove filter if they fix the backend
			var data = {
				items : items.filter(item => item.value != "SSSS"),
				metadata : metadata
			}
			
			d.Resolve(data);
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	static Break(id) {
		var d = Core.Defer();
		
		var layer = ESRI.layers.FeatureLayer({ url:URLS.break });
		
		var query = layer.createQuery();
		
		query.where = `BreakAlgorithmId  = ${id}`;
		query.returnGeometry = false;
		query.outFields = "*";
		query.returnDistinctValues = true;
		
		layer.queryFeatures(query).then(r => {
			if (r.features.length > 1) d.Reject(new Error("Received more than one break algorithm."));
			
			var data = r.features[0].attributes;
			
			d.Resolve(data);
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	static Renderer(metadata, breaks, geography) {
		var d = Core.Defer();
		
		var layer = {
			"id": 7,
			"minScale": null,
			"name": "dyn_layer",
			"source": {
				"dataSource": {
					"type": "queryTable",
					"workspaceId": "stcdv_dyn_service",
					"query": metadata.PrimaryQuery,
					"oidFields": "GeographyReferenceId",
					"geometryType": "esriGeometryPolygon" 
				},
				"type":"dataLayer"
			}, 
			"definitionExpression":`GeographicLevelId = '${geography.value}' AND IndicatorId = ${metadata.IndicatorId}`
		}
		
		var classif = {
			"type": "classBreaksDef",
			"classificationField": "Value",
			"classificationMethod": breaks.BreakAlgorithm,
			"breakCount": metadata.DefaultBreaks,
			"colorRamp": {
				"type":"algorithmic",
				"fromColor": metadata.ColorFrom.split(","),
				"toColor":metadata.ColorTo.split(","),
				"algorithm":"esriHSVAlgorithm"
			}
		};
		
		var data = {
			f : "json",
			layer: JSON.stringify(layer),
			where: `GeographicLevelId = '${geography.value}' AND IndicatorId = ${metadata.IndicatorId}`,
			classificationDef: JSON.stringify(classif)
		}
		
		var p = ESRI.request(URLS.renderer, {
			useProxy : true,
			method : "POST",
			responseType  : "json",
			query : (data)
		});
		
		p.then(renderer => {
			var sublayer = { 
					id: 7, 
					visible: true,
					definitionExpression: data.where,
					renderer : ESRI.renderers.support.jsonUtils.fromJSON(renderer.data),
					source: {
						type: "data-layer",
						dataSource: {
							type: "query-table",
							workspaceId: "stcdv_dyn_service",
							query: metadata.PrimaryQuery,
							geometryType: "esriGeometryPolygon",
							oidFields: "GeographyReferenceId"
						}
					}
				}
				
			d.Resolve(sublayer);
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
}