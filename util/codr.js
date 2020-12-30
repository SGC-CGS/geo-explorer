import Core from '../../geo-explorer/tools/core.js';
import Net from '../../geo-explorer/tools/net.js';

import Metadata from '../components/metadata.js';
import Vector from '../components/vector.js';

const URLS = {
	metadata : "https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata",
	data : "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods"
}

export default class CODR {
	
	static Post(url, data) {
		var proxy = "http://localhost/Dev/geo-explorer-proxy/proxy.ashx?";
		var body = JSON.stringify(data);
		var headers = { "Content-Type":"application/json" };
		
		return Net.Post(proxy + url, body, headers, "application/json");
	}
	
	static GetCubeMetadata(product) {
		var d = Core.Defer();

		var p = CODR.Post(URLS.metadata, [{"productId":product}]);
		
		p.then(response => {
			var metadata = Metadata.FromResponse(response);
			
			d.Resolve(metadata);
		}, error => {
			var message = `Unable to retrieve cube metadata for product id ${product}. The getCubeMetadata service returned an error.`;
			
			d.Reject(new Error(message));
		});
		
		return d.promise;
	}
	
	static GetRequests(metadata, coordinates) {
		return metadata.geo.members.map(m => {
			var request = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			
			for (var i = 0; i < coordinates.length; i++) request[i] = coordinates[i];
			
			request[metadata.geoIndex] = m.id;
			
			return { "productId":metadata.id, "coordinate":request.join("."), "latestN":1 }
		});
	}
	
	static GetCoordinateDataByBatch(metadata, data, datapoints) {
		var bust = Math.random() * Math.pow(10,18);
		
		return CODR.Post(URLS.data + "?bust=" + bust, data.splice(0, 300)).then(response => {		
			var vectors = Vector.FromResponse(response);
			
			vectors.forEach(v => {
				var id = v.coordinate[metadata.geoIndex];
				var member = metadata.geo.Member(id);
				
				datapoints[member.code] = v.datapoints[0];
			});
		});
	}
	
	static GetCoordinateData(metadata, coordinates) {
		var d = Core.Defer();
		
		if (metadata.dimensions.length != coordinates.length) {
			d.Reject(new Error("Length mismatch between the metadata dimensions and coordinates provided."));
		}
		
		if (metadata.geo == null) {
			d.Reject(new Error("No geometry dimension found on the product specified"));
		}
		
		if (metadata.geoIndex != coordinates.indexOf("*")) {
			d.Reject(new Error("Geography dimension misidentified in the coordinates provided."));
		}

		var datapoints = {};	
		var data = CODR.GetRequests(metadata, coordinates);
		
		CODR.GetCoordinateDataByBatch(metadata, data, datapoints).then(DataBatch_Success, DataBatch_Failed);
		
		function DataBatch_Success() {
			if (data.length > 0) {
				CODR.GetCoordinateDataByBatch(metadata, data, datapoints).then(DataBatch_Success, DataBatch_Failed);
			}
			else d.Resolve(datapoints);
		}
		
		function DataBatch_Failed(error) {
			var message = `Unable to retrieve data for requested coordinates. The getDataFromCubePidCoordAndLatestNPeriods service returned an error.`;
			
			d.Reject(new Error(message));
		}

		return d.promise;
	}
	
	static GeoLookup(code) {
		var lookup = {
			"CAN" : 0,
			"PR" : 2,
			"CD" : 3,
			"CSD" : 5,
			"CMA" : 503	
		}
		
		/*
		var lookup = {
			"0" : "CAN",
			"2" : "PR",
			"3" : "CD",
			"5" : "CSD",
			"503" : "CMA"			
		}
		*/
		
		return lookup[code] || null;
	}

	
	static GeoLevels(metadata) {		
		var levels = [];
		
		metadata.geo.members.forEach(d => {
			var geo = CODR.GeoLookup(d.geoLevel);
			
			if (geo == null) return;
			
			if (levels.indexOf(geo) == -1) levels.push(geo);
		});
		
		return levels;
	}
}