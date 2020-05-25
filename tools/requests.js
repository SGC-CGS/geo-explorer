import Core from './core.js';

const URLS = {
	renderer : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_dyn/MapServer/dynamicLayer/generateRenderer",
	placename : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/0",
	value : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/1",
	geography : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/2",
	indicator : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/3",
	breaks : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/4",
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
	
	static Query(layer, where, geometry, returnGeometry, outFields, distinct, orderBy) {
		var query = layer.createQuery();
		
		query.returnGeometry = !!returnGeometry;
		query.returnDistinctValues = !!distinct;
		
		if (outFields) query.outFields = outFields;
		if (where) query.where = where;
		if (geometry) query.geometry = geometry;
		if (orderBy) query.orderByFields = orderBy;
		
		return layer.queryFeatures(query);
	}
	
	static QueryGeometry(layer, geometry) {
		return Requests.Query(layer, null, geometry, true, "*", null, null);
	}
	
	static QueryUrl(url, where, geometry, returnGeometry, outFields, distinct, orderBy) {		
		var layer = ESRI.layers.FeatureLayer({ url:url });
		
		return Requests.Query(layer, where, geometry, returnGeometry, outFields, distinct, orderBy);
	}
	
	static QueryTable(url, where, returnGeometry) {		
		return Requests.QueryUrl(url, where, null, !!returnGeometry, "*", true, null);
	}
	
	static Indicator(id, delegate) {
		var d = Core.Defer();
		
		var where = (id == null) ? `ParentThemeId is ${id}` : `ParentThemeId = ${id}`;
		
		Requests.QueryTable(URLS.indicator, where).then(r => {
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
		
		var where = `IndicatorThemeId = ${id}`;
		
		Requests.QueryTable(URLS.filter, where).then(r => {
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
		
		var where = `DimensionUniqueKey = '${ids.join("-")}'`;
		
		Requests.QueryTable(URLS.value, where).then(r => {
			if (r.features.length > 1) d.Reject(new Error("Received more than one indicator Id."));
			
			var metadata = r.features[0].attributes;
			
			Requests.Geography(metadata).then(items => d.Resolve(items), error => d.Reject(error));
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	static Geography(metadata) {
		var d = Core.Defer();
		
		var where = `IndicatorId = '${metadata.IndicatorId}'`;
		
		Requests.QueryTable(URLS.geography, where).then(r => {
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
		
		var where = `BreakAlgorithmId  = ${id}`;
		
		Requests.QueryTable(URLS.breaks, where).then(r => {
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
			"definitionExpression":`GeographicLevelId = '${geography}' AND IndicatorId = ${metadata.IndicatorId}`
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
			where: `GeographicLevelId = '${geography}' AND IndicatorId = ${metadata.IndicatorId}`,
			classificationDef: JSON.stringify(classif)
		}
		
		var p = ESRI.request(URLS.renderer, {
			useProxy : true,
			method : "POST",
			responseType  : "json",
			query : (data)
		});
		
		p.then(renderer => {
			var sublayer = new ESRI.layers.support.Sublayer({ 
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
			});
				
			d.Resolve({ method:renderer.data.classificationMethod, sublayer:sublayer });
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	static Typeahead(value, idField, labelField) { 
		var d = Core.Defer();
		
		var where = `UPPER(${labelField}) LIKE UPPER('${value}%') AND Lang = '${Core.locale.toUpperCase()}'`;
		
		Requests.QueryUrl(URLS.placename, where, null, false, [idField, labelField], false, [`${labelField} DESC`]).then(r => {
			var items = r.features.map(f => {
				return {
					id : f.attributes[idField],
					label : f.attributes[labelField],
					feature : f
				}
			})
			
			d.Resolve(items);	
		}, error => {
			d.Reject(error);
		})
		
		return d.promise;
	}
	
	static Identify(layer, geometry) {
		var d = Core.Defer();
		
		Requests.QueryGeometry(layer, geometry).then(r => {
			d.Resolve(r.features[0]);
		}, error => {
			d.Reject(error);
		})
		
		return d.promise;
	}
	
	static Placename(id, label) { 
		var d = Core.Defer();
		
		var where = `GeographyReferenceId = '${id}' and SearchDisplayName = '${label}'`;
		
		Requests.QueryTable(URLS.placename, where, true).then(r => {
			d.Resolve(r.features[0]);	
		}, error => {
			d.Reject(error);
		});
		
		return d.promise;
	}
}