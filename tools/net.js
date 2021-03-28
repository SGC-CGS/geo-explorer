import Core from './core.js';

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
	static Get(url, headers, responseType) {
		var d = Core.Defer();
		
		var xhttp = new XMLHttpRequest();
		
		xhttp.onreadystatechange = function() {
			if (this.readyState != 4) return;
		
			if (this.status == 200) d.Resolve(this.response);
			
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
	
		
	static Post(url, data, headers, responseType) {
		var d = Core.Defer();

		var xhttp = new XMLHttpRequest();
		
		xhttp.onreadystatechange = function() {
			if (this.readyState != 4) return;
		
			if (this.status == 200) d.Resolve(this.response);
			
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
	
	static JSON(url) {
		var d = Core.Defer();
		
		Net.Get(url).then(r => d.Resolve(JSON.parse(r)), d.Reject);
				
		return d.promise;
	}
	
	static File(url, name) {
		var d = Core.Defer();
		
		Net.Get(url, null, 'blob').then(b => {			
			d.Resolve(new File([b], name));
		}, d.Reject);
				
		return d.promise;
	}
	
	/**
	* Parses the location query and returns a string dictionary
	*
	* Return : Object, a dictionary of string key values containing the parameters from the location query
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
	*
	* Parameters :
	*	name : String, the name of the parameter to retrieve from the URL
	* Return : String, the value of the parameter from the URL, an empty string if not found
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
	*
	* Parameters :
	*	name : String, the name of the file to download
	*	content : 
	* Return : none
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
	*
	* Parameters : none
	* Return : String, the base path to the web app
	*/
	static AppPath() {
		var path = location.href.split("/");
		
		path.pop();
		
		return path.join("/");
	}
	
	/**
	* Gets the base URL for the app
	*
	* Parameters : none
	* Return : String, the base path to the web app
	*/
	static FilePath(file) {
		file = file.charAt(0) == "/" ? file.substr(1) : file;
		
		var path = [Net.AppPath(), file];
				
		return path.join("/");
	}
}