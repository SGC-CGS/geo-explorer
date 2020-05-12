import Core from './core.js';


const URLS = {
	subject : "https://www97.statcan.gc.ca/arcgis/rest/services/CHSP/stcdv_lookup/MapServer/3"
}

export default class Net {
	
	/**
	* Execute a web request
	*
	* Parameters :
	*	url : String, the request URL
	* Return : none
	*
	* TODO : This should return a promise object but (ie11)
	*
	*/
	static Subject(id) {
		var d = Core.Defer();
		
		var layer = ESRI.layers.FeatureLayer({ url:URLS.subject });
		
		var query = layer.createQuery();
		
		query.where = id == null ? `ParentThemeId is ${id}` : `ParentThemeId = ${id}`;
		query.returnGeometry = false;
		query.outFields = "*";
		query.returnDistinctValues = true;
		
		layer.queryFeatures(query).then(r => { d.Resolve(r.features) }, error => { d.Reject(error) });
		
		return d.promise;
	}
}