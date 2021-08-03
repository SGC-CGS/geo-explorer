import Core from './core.js';

let _config = null;

const URLS = {
	renderer : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_dyn/MapServer/dynamicLayer/generateRenderer",
	placename : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/0",
	value : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/1",
	geography : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/2",
	indicator : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/3",
	breaks : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/4",
	filter : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/8"
}

/**
 * Requests module
 * @module tools/requests
 */
export default class Requests {
	
	/**
	* Get or set the config string
	* @type {string}
	 */
	static set config(value) { _config = value; }
	
	static get config() { return _config; }
	
	/**
	 * Build item for select list
	 * @param {object} f - Feature layer
	 * @param {string} value - Field name 
	 * @param {string} label - Display label
	 * @param {string} description - Field Description
	 * @param {string} locale - For language display (EN, FR)
	 * @returns {object} Object with label and value
	 */
	static MakeItem(f, value, label, description, locale) {
		var item = {
				value : f.attributes[value],
				label : f.attributes[`${label}_${locale}`]
			} 
			
		if (description) item.description = f.attributes[`${description}_${locale}`]
		
		return item;
	}
	
	/**
	 * Get locale, build theme selection lists, add to map
	 * @param {object} features - Feature layers
	 * @param {string} value - Field name
	 * @param {string} label - Label name
	 * @param {string} description  - Field description
	 * @returns {object} Selection items for map
	 */
	static MakeItems(features, value, label, description) {
		var locale = Core.locale.toUpperCase();
		
		return features.map(f => {
			return Requests.MakeItem(f, value, label, description, locale);
		});
	}
	
	/**
	 * Reformat indicator metadata as new object
	 * @param {oject} attr Metadata for an indicator
	 * @returns {object} Newly formatted metadata
	 */
	static MakeMetadata(attr) {
		return {
			indicator : attr.IndicatorId,
			query : attr.PrimaryQuery,
			breaks : {
				n : attr.DefaultBreaks,
				algoId : attr.DefaultBreaksAlgorithmId,
				algo : null
			},
			colors : {
				start : attr.ColorFrom.split(","),
				end : attr.ColorTo.split(",")
			}
		}
	}
	
	/**
	 * Build and execute query for features from a layer
	 * @param {object} layer - Feature layer to query
	 * @param {string} where - Where clause for the query
	 * @param {geometry} geometry - Geometry to apply to the spatial filter
	 * @param {boolean} returnGeometry - If true, include geometry in the feature set
	 * @param {string[]} outFields - Attribute fields to include in the feature set (* for all)
	 * @param {boolean} distinct - If true, return distinct values based on outFields
	 * @param {string[]} orderBy - Sort fields for query
	 * @returns {object} Layer of queried features
	 */
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
	
	/**
	 * Query layer based on given geometry
	 * @param {object} layer - Feature layer to query
	 * @param {geometry} geometry - Geometry to apply to the spatial filter 
	 * @returns {object} Layer of queried features
	 */
	static QueryGeometry(layer, geometry) {
		return Requests.Query(layer, null, geometry, true, "*", null, null);
	}
	
	/**
	 * Set feature layer and execute query 
	 * @param {string} url - Rest service URL
	 * @param {string} where - Where clause for query
	 * @param {geometry} geometry - Geometry to apply to the spatial filter 
	 * @param {boolean} returnGeometry - If true, include geometry in the feature set
	 * @param {string[]} outFields - Attribute fields to include in the feature set (* for all)
	 * @param {boolean} distinct - If true, return distinct values based on outFields
	 * @param {string[]} orderBy - Sort fields for query
	 * @returns {object} Query results
	 */
	static QueryUrl(url, where, geometry, returnGeometry, outFields, distinct, orderBy) {		
		var layer = new ESRI.layers.FeatureLayer({ url:url });
		
		return Requests.Query(layer, where, geometry, returnGeometry, outFields, distinct, orderBy);
	}
	
	/**
	 * Execute basic query
	 * @param {string} url - Rest service URL
	 * @param {string} where - Where clause for query 
	 * @param {boolean} returnGeometry - If true, include geometry in the feature set 
	 * @returns {object} Query results
	 */
	static QueryTable(url, where, returnGeometry) {		
		return Requests.QueryUrl(url, where, null, !!returnGeometry, "*", true, null);
	}
	
	/**
	 * Build and execute query for indicator and make theme select lists
	 * @param {number} id - (Null when page first loads)
	 * @returns {promise} Promise with items if resolved
	 */
	static Indicator(id) {
		var d = Core.Defer();
		
		var where = (id == null) ? `ParentThemeId is ${id}` : `ParentThemeId = ${id}`;
		
		Requests.QueryTable(URLS.indicator, where).then(r => {
			var items = Requests.MakeItems(r.features, "IndicatorThemeId", "IndicatorTheme", "IndicatorThemeDescription");
			
			items = items.filter(i => i.value % 10000 != 9999);
						
			d.Resolve(items);
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	/**
	 * Build and execute query for specified product ID, then build dimension arrays from results
	 * @param {number} id - Product ID
	 * @returns {promise} Promise with select items if resolved
	 */
	static Category(id) {
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
				
				var item = Requests.MakeItem(f, "DimensionValueId", "Display", null, locale);
				
				dimensions[i].values.push(item);
			});
			
			var filters = dimensions.filter(d => d.type == 'Filter');
			var values = dimensions.filter(d => d.type == 'Value');
			
			if (values.length > 1) d.Reject(new Error("More than one dimension of type Value received."));
			
			else d.Resolve({ filters:filters, value:values[0].values });
		}, error => { d.Reject(error) });
		
		return d.promise;
	}

	/**
	 * Look up metadata for indicators
	 * @param {number[]} indicators - Array of indicator IDs
	 * @returns {promise} Promise with metadata if resolved
	 */
	static Metadata(indicators) {
		var d = Core.Defer();
		
		var where = `DimensionUniqueKey = '${indicators.join("-")}'`;
		
		Requests.QueryTable(URLS.value, where).then(r => {
			if (r.features.length > 1) d.Reject(new Error("Received more than one indicator Id."));

			if (r.features.length == 0) d.Reject(new Error("No indicator Id received."));
			
			var metadata = this.MakeMetadata(r.features[0].attributes);
			
			Requests.Break(metadata.breaks.algoId).then(breaks => {
				metadata.breaks.algo = breaks.BreakAlgorithm;
				
				d.Resolve(metadata);
			}, error => { d.Reject(error) });
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	/**
	 * Get select list filters for indicator 
	 * @param {number} indicatorId - Indicator ID
	 * @returns {promise} Promise with items if resolved
	 */
	static Geography(indicatorId) {
		var d = Core.Defer();
		
		var where = `IndicatorId = '${indicatorId}'`;
		
		Requests.QueryTable(URLS.geography, where).then(r => {
			var items = Requests.MakeItems(r.features, "GeographicLevelId", "LevelName", "LevelDescription");
			
			items = items.filter(item => item.value != "SSSS");
			
			d.Resolve(items);
		}, error => { d.Reject(error) });
		
		return d.promise;
	}
	
	/**
	 * Build and execute query to get info on break algorithms
	 * @param {number} id - Break algorithm Id 
	 * @returns {promise} Promise with feature data if resolved
	 */
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
	
	/**
	 * Setup ESRI layer
	 * @param {object} context - Object with current indicator
	 * @returns {promise} Promise with sublayer if resolved
	 */
	static Renderer(context) {
		var meta = context.metadata;
		
		var d = Core.Defer();
		
		var layer = {
			"id": 7,
			"minScale": null,
			"name": "dyn_layer",
			"source": {
				"dataSource": {
					"type": "queryTable",
					"workspaceId": "stcdv_dyn_service",
					"query": meta.query,
					"oidFields": "GeographyReferenceId",
					"geometryType": "esriGeometryPolygon" 
				},
				"type":"dataLayer"
			}, 
			"definitionExpression":`GeographicLevelId = '${context.geography}' AND IndicatorId = ${meta.indicator}`
		}
		
		var classif = {
			"type": "classBreaksDef",
			"classificationField": "Value",
			"classificationMethod": meta.breaks.algo,
			"breakCount": meta.breaks.n,
			"colorRamp": {
				"type":"algorithmic",
				"fromColor": meta.colors.start,
				"toColor":meta.colors.end,
				"algorithm":"esriHSVAlgorithm"
			}
		};
		
		var data = {
			f : "json",
			layer: JSON.stringify(layer),
			where: `GeographicLevelId = '${context.geography}' AND IndicatorId = ${meta.indicator}`,
			classificationDef: JSON.stringify(classif)
		}
		
		var p = ESRI.request(URLS.renderer, {
			useProxy : true,
			method : "POST",
			responseType  : "json",
			query : (data)
		});
		
		p.then(renderer => {
			// For color palettes
			let len = renderer.data.classBreakInfos.length;
			if(meta.colors.palette != undefined) {
				for (let index = 0; index < len; index++) {
					let metaColor = meta.colors.palette[index];
					renderer.data.classBreakInfos[index].symbol.color = Core.HexToRgb(metaColor, 255);
				}
			}
			
			var sublayer = new ESRI.layers.support.Sublayer({ 
				id: 7, 
				visible: true,
				labelsVisible: false,
				definitionExpression: data.where,
				renderer : ESRI.renderers.support.jsonUtils.fromJSON(renderer.data),
				source: {
					type: "data-layer",
					dataSource: {
						type: "query-table",
						workspaceId: "stcdv_dyn_service",
						query: meta.query,
						geometryType: "polygon",
						oidFields: "GeographyReferenceId"
					}
				},
				labelingInfo: [{
					labelExpression: "[DisplayNameShort_EN]",
					labelPlacement: "always-horizontal",
					useCodedValues: false,
                    maxScale: 0,
                    minScale: 0,
                    where: null,
					symbol: {
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
					  font: {
						size: 9,
						style: "normal",
						decoration: "none",
						weight: "normal",
						family: "Arial"
					  }
					},
					minScale: 0,
					maxScale: 0
				  }]
			});
			
			sublayer.renderer.defaultSymbol = {
				type: "simple-fill", 
				color: [125,125,125, 1],
				style: "solid",
				outline: {  
					color: [0, 0, 0, 1],
					width: 1
				}
			}
			
			d.Resolve(sublayer);
		}, error => { d.Reject(new Error(error.message)) });
		
		return d.promise;
	}
	
	/**
	 * Retrieve data for specified geometry
	 * @param {object} layer - Feature layer
	 * @param {object} geometry - Geometry from user click
	 * @returns {promise} Promise with feature data if resolved
	 */
	static Identify(layer, geometry) {
		var d = Core.Defer();
		
		Requests.QueryGeometry(layer, geometry).then(r => {
			d.Resolve({ feature:r.features[0], geometry:geometry });
		}, error => d.Reject(error));
		
		return d.promise;
	}
	
	/**
	 * Query for autocompleting text entry when user searches for a location
	 * @param {string} value - Search string entered by user
	 * @returns {promise} Promise with query result if resolved
	 */
	static Typeahead(value) { 
		var d = Core.Defer();
		
		var fields = ["GeographyReferenceId", "SearchDisplayName"];
		var where = `UPPER(SearchDisplayName) LIKE UPPER('${value}%') AND Lang = '${Core.locale.toUpperCase()}'`;
		
		Requests.QueryUrl(URLS.placename, where, null, false, fields, false, [`SearchDisplayName DESC`]).then(r => {
			var items = r.features.map(f => {
				return {
					id : f.attributes[fields[0]],
					label : f.attributes[fields[1]],
					feature : f
				}
			})
			
			d.Resolve(items);	
		}, error => {
			d.Reject(error);
		})
		
		return d.promise;
	}
	
	/**
	 * Build and execute query on layer for matching id and label
	 * @param {string} id - DGUID
	 * @param {string} label - Descriptive place name for DGUID
	 * @returns {promise} Promise with feature data if resolved
	 */
	static Placename(id, label) { 
		var d = Core.Defer();
		
		var where = `GeographyReferenceId = '${id}' and SearchDisplayName = '${label}'`;
		
		Requests.QueryUrl(URLS.placename, where, null, true).then(r => {
			d.Resolve(r.features[0]);	
		}, error => {
			d.Reject(error);
		});
		
		return d.promise;
	}
}