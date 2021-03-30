import Core from './core.js';

/**
 * Net module
 * @module tools/net
 */
export default class Net {
	
	/**
	* Create and send a web request using GET
	* @param {string} url - The request URL
	* @param {string[]} headers - Http request headers
	* @param {string} responseType - specifies type of data for response
	* @returns {promise} Promise
	*/
	static Get(url, headers, responseType) {
		var d = Core.Defer();
		
		var xhttp = new XMLHttpRequest();
		
		xhttp.onreadystatechange = function() {
			if (this.readyState != 4) return; // 4 - DONE
		
			if (this.status == 200) d.Resolve(this.response); // 200 - OK
			
			else d.Reject({ status:this.status, response:this.response });
		};
		
		xhttp.open("GET", url, true);
		
		if (headers) {
			for (var id in headers) xhttp.setRequestHeader(id, headers[id]);
		}
		
		if (responseType) xhttp.responseType = responseType;   
		
		xhttp.send();
		
		return d.promise;
	}

	/**
	 * Create and send a web request using POST
	 * @param {string} url - The request URL
	 * @param {string} data - Request body
	 * @param {string[]} headers - Http request headers
	 * @param {string} responseType - specifies type of data for response
	 * @returns {promise} Promise
	 */	
	static Post(url, data, headers, responseType) {
		var d = Core.Defer();

		var xhttp = new XMLHttpRequest();
		
		xhttp.onreadystatechange = function() {
			if (this.readyState != 4) return; // 4 - DONE
		
			if (this.status == 200) d.Resolve(this.response); // 200 - OK
			
			else d.Reject({ status:this.status, response:this.response });
		};
		
		xhttp.open("POST", url, true);
			
		if (responseType) xhttp.responseType = responseType;
					
		if (headers) {
			for (var id in headers) xhttp.setRequestHeader(id, headers[id]);
		}
		
		(data) ? xhttp.send(data) : xhttp.send();
		
		return d.promise;
	}
	
	/**
	 * Get JSON from URL
	 * @param {string} url for JSON file
	 * @returns (promise) Promise with parsed JSON if resolved
	 */
	static JSON(url) {
		var d = Core.Defer();
		
		Net.Get(url).then(r => d.Resolve(JSON.parse(r)), d.Reject);
				
		return d.promise;
	}
	
	/**
	 * Create file object on successful request
	 * @param {string} url - The request URL
	 * @param {string} name - The name of the file 
	 * @returns {promise} Promise
	 */
	static File(url, name) {
		var d = Core.Defer();
		
		Net.Get(url, null, 'blob').then(b => {			
			d.Resolve(new File([b], name));
		}, d.Reject);
				
		return d.promise;
	}
	
	/**
	* Parses the location query and returns a string dictionary
	* @returns {object} A dictionary of string key values containing the parameters from the location query
	*/
	static ParseUrlQuery() {
		var params = {};
		var query = location.search.slice(1);
		
		if (query.length == 0) return params;
		
		query.split("&").forEach(p => {
			var lr = p.split("=");
			
			params[lr[0]] = lr[1];
		});
		
		return params;
	}
	
	/**
	* Get a parameter value from the document URL
	* @param {string} name - The name of the parameter to retrieve from the URL
	* @returns {string} The value of the parameter from the URL, an empty string if not found
	*/
	static GetUrlParameter (name) {				
		name = name.replace(/[\[\]]/g, '\\$&');
		
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
		
		var results = regex.exec(window.location.href);
		
		if (!results) return null;
		
		if (!results[2]) return '';
		
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}
	
	/**
	* Download content as a file
	* @param {string} name - The name of the file to download
	* @param {string} content - Content from page
	* @returns {void}
	*/
	static Download(name, content) {
		var link = document.createElement("a");
		
		link.href = "data:application/octet-stream," + encodeURIComponent(content);
		link.download = name;
		link.click();
		link = null;
	}
	
	/**
	* Gets the base URL for the app
	* @returns {string} - The base path to the web app
	*/
	static AppPath() {
		var path = location.href.split("/");
		
		path.pop();
		
		return path.join("/");
	}
	
	/**
	* Gets the URL for the app and file
	* @param {string} file - The filename to which path will be added
	* @returns {string} The URL for the app and the file
	*/
	static FilePath(file) {
		file = file.charAt(0) == "/" ? file.substr(1) : file;
		
		var path = [Net.AppPath(), file];
				
		return path.join("/");
	}
}