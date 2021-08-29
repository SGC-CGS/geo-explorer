import Core from './core.js';
import Net from './net.js';

import Nls from '../components/base/nls.js';
import Metadata from '../components/codr/metadata.js';
import Datapoint from '../components/codr/datapoint.js';
import Vector from '../components/codr/vector.js';
import CodeSets from '../components/codr/codesets.js';

const URLS = {
    metadata: "https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata",
    data: "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods",
    codesets: "https://www150.statcan.gc.ca/t1/wds/rest/getCodeSets"
}

/**
 * CODR module
 * @module tools/codr
 * @description This class is used to create requests and connect to CODR web services.
 */
export default class CODR {
	
	static geoLookup = {
		"0": "CAN",
		"1": "GRC",
		"2": "PR",
		"3": "CD",
		"4": "FDR",
		"5": "CSD",
		"6": "DP",
		"7": "HR",
		"8": "LHIN",
		"11": "FSA",
		"500": "ER",
		"501": "CAR",
		"502": "CCS",
		"503": "CMA",
		"504": "CA",
		"505": "CMAP",
		"506": "CAP",
		"507": "CT",
		"510": "PC",
		"511": "PCP",
		"512": "DA",
		"513": "DB",
		"516": "ADA"
    }

    static geoType = {
        "PR": "A",
        "GRC": "A",
        "CD": "A",
        "CCS": "S",
        "CSD": "A"
    }

    static geoSchema = {
        "PR": "0002",
        "GRC": "0001",
        "CD": "0003",
        "CCS": "0502",
        "CSD": "0005"
    }
	
	static GeoNls() {
		var nls = new Nls();
		
		nls.Add("0", "en", "Country");
		nls.Add("0", "fr", "Pays");
		nls.Add("1", "en", "Geographical region of Canada");
		nls.Add("1", "fr", "Région géographique du Canada");
		nls.Add("2", "en", "Province or territory");
		nls.Add("2", "fr", "Province ou territoire");
		nls.Add("3", "en", "Census division");
		nls.Add("3", "fr", "Division de recensement");
		nls.Add("4", "en", "Federal electoral district");
		nls.Add("4", "fr", "Circonscription électorale fédérale");
		nls.Add("5","en","Census subdivision");
		nls.Add("5","fr","Subdivision de recensement");
		nls.Add("6","en","Designated place");
		nls.Add("6","fr","Localité désignée");
		nls.Add("7","en","Health region");
		nls.Add("7","fr","Région sociosanitaire");
		nls.Add("8","en","Local health integration network");
		nls.Add("8","fr","Réseau local d'intégration des services de santé");
		nls.Add("11","en","Forward sortation area");
		nls.Add("11","fr","Région de tri d'acheminement");
		nls.Add("500","en","Economic region");
		nls.Add("500","fr","Région économique");
		nls.Add("501","en","Census agricultural region");
		nls.Add("501","fr","Région agricole de recensement");
		nls.Add("502","en","Census consolidated subdivision");
		nls.Add("502","fr","Subdivision de recensement unifiée");
		nls.Add("503","en","Census metropolitan area");
		nls.Add("503","fr","Région métropolitaine de recensement");
		nls.Add("504","en","Census agglomeration");
		nls.Add("504","fr","Agglomération de recensement");
		nls.Add("505","en","Census metropolitan area part");
		nls.Add("505","fr","Partie de région métropolitaine de recensement");
		nls.Add("506","en","Census agglomeration part");
		nls.Add("506","fr","Partie d'agglomération de recensement");
		nls.Add("507","en","Census tract");
		nls.Add("507","fr","Secteur de recensement");
		nls.Add("510","en","Population centre");
		nls.Add("510","fr","Centre de population");
		nls.Add("511","en","Population centre part");
		nls.Add("511","fr","Partie de centre de population");
		nls.Add("512","en","Dissemination area");
		nls.Add("512","fr","Aire de diffusion");
		nls.Add("513","en","Dissemination block");
		nls.Add("513","fr","Îlot de diffusion");
		nls.Add("516","en","Aggregate Dissemination Area");
		nls.Add("516","fr","Aire de diffusion aggrégée");
		
		return nls;
	}
	
	static Post(url, data) {
        var proxy = `${location.origin}/geo-explorer-proxy/proxy.ashx?`;
		var body = JSON.stringify(data);
		var headers = { "Content-Type":"application/json" };
		
		return Net.Post(proxy + url, body, headers, "json");
    }

    static Get(url) {
        var proxy = `${location.origin}/geo-explorer-proxy/proxy.ashx?`;
        var headers = { "Content-Type": "application/json" };

        return Net.Get(proxy + url, headers, "json");
    }

    /**
     * @description
     * Get cube metadata by product id
     * @param {String} product - product id
     */
	static GetCubeMetadata(product) {
		var d = Core.Defer();
		var p = CODR.Post(URLS.metadata, [{"productId":product}]);
		
		p.then(response => {
			if (response[0].status == "FAILED") d.Reject(new Error(response[0].object));
			
			else {
				var metadata = Metadata.FromResponse(response);
				
				d.Resolve(metadata);
			}
		}, error => {
			var message = `Unable to retrieve cube metadata for product id ${product}. The getCubeMetadata service returned an error.`;
			
			d.Reject(new Error(message));
		});
		
		return d.promise;
	}

    /**
     * @description
     * Get requests
     * @param {String} metadata - metadata
     * @param {String} coordinates - coordinates
     */
	static GetRequests(metadata, coordinates) {
        return metadata.geoMembers.map(m => {
			var request = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			
			for (var i = 0; i < coordinates.length; i++) request[i] = coordinates[i];
			
			request[metadata.geoIndex] = m.id;
			
			return { "productId":metadata.id, "coordinate":request.join("."), "latestN":1 }
		});
	}

    /**
     * @description
     * Get Coordinate data by batch
     * @param {String} metadata - metadata
     * @param {String} data - data
     * @param {String} datapoints - datapoints
     */
	static GetCoordinateDataByBatch(metadata, data, datapoints) {
		var bust = Math.random() * Math.pow(10,18);
		
		return CODR.Post(URLS.data + "?bust=" + bust, data.splice(0, 300)).then(response => {		
			var vectors = Vector.FromResponse(response);
			
			vectors.forEach(v => {
				var id = v.coordinate[metadata.geoIndex];
				var member = metadata.geoDimension.Member(id);
				
				datapoints[member.code] = v.datapoints[0];
			});
		});
	}

    /**
     * @description
     * Get Coordinate data
     * @param {String} metadata - metadata
     * @param {String} coordinates - coordinates
     */
	static GetCoordinateData(metadata, coordinates) {
		var d = Core.Defer();
		
		if (metadata.dimensions.length != coordinates.length) {
			d.Reject(new Error("Length mismatch between the metadata dimensions and coordinates provided."));
		}
		
		if (metadata.geoDimension == null) {
			d.Reject(new Error("No geometry dimension found on the product specified"));
		}
		
		var datapoints = {};	
		var data = CODR.GetRequests(metadata, coordinates);
		
		CODR.GetCoordinateDataByBatch(metadata, data, datapoints).then(DataBatch_Success, DataBatch_Failed);
		
		function DataBatch_Success() {
			if (data.length > 0) {
				return CODR.GetCoordinateDataByBatch(metadata, data, datapoints).then(DataBatch_Success, DataBatch_Failed);
			}
			
			var id = coordinates[metadata.lastDimensionIndex];
			var mem = metadata.lastDimension.Member(id);
			
			for (var dp in datapoints) {
				if (datapoints[dp]) datapoints[dp].uom = mem.uom;
				
				// TODO: Not sure about this.
				// I have no clue where to get scalar factor in this case. It should probably be on the dimension member but it's not.
				else datapoints[dp] = Datapoint.UnavailableDatapoint(metadata.date, 0, metadata.release, metadata.frequency, mem.uom);
			}
			
			d.Resolve(datapoints);
		}
		
		function DataBatch_Failed(error) {
			var message = `Unable to retrieve data for requested coordinates. The getDataFromCubePidCoordAndLatestNPeriods service returned an error.`;
			
			d.Reject(new Error(message));
		}

		return d.promise;
    }

    /**
     * @description
     * Get codesets
     */
    static GetCodeSets() {
        var d = Core.Defer();

        var p = CODR.Get(URLS.codesets);

        p.then(response => {
            d.Resolve(CodeSets.FromResponse(response));
        }, error => {
            var message = `Unable to retrieve code sets. The getCodeSets service returned an error.`;

            d.Reject(new Error(message));
        });

        return d.promise;
    }

    /**
     * @description
     * Get geo by code
     * @param {String} code - code
     */
	static GeoLookup(code) {
		return CODR.geoLookup[code];
    }

    /**
     * Derive the DGUID from the vintage, type, schema and the feature ID
     * @param {any} geoLevel
     * @param {any} vintage
     * @param {any} featureID
     */
    static GetDGUID(geoLevel, vintage, featureID) {
        var geo = this.GeoLookup(geoLevel);

        return vintage + this.geoType[geo] + this.geoSchema[geo] + featureID;
    }

   
    /**
     * @description
     * Get geo levels
     * @param {String} metadata - metadata
     */
	static GeoLevels(metadata) {
		var geoNls = CODR.GeoNls();
        var levels = [];
		
		metadata.geoDimension.members.forEach(d => {			
			if (d.geoLevel == null) return;

			// TODO: We need all the census geo levels at least
            var allowedGeoLevels = [1, 2, 3, 5, 502];
            if (allowedGeoLevels.indexOf(d.geoLevel) < 0) return;
			
            if (levels.findIndex(l => l.id == d.geoLevel) != -1) return;
			
            levels.push({ id:d.geoLevel, "name":geoNls.Resource(d.geoLevel) });
		});

        return levels;
	}
}