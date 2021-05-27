import Core from '../../geo-explorer-api/tools/core.js';
import Context from './context.js';

/**
 * Configuration module
 * @module components/configuration
 * @description Grab all the JSON content from application.json
 * and use get accessors to retrieve content for application.js.
 */
export default class Configuration {
	
	/**
	 * Get the map object from the json
	 */
	get map() { return this._json.map; }
	
	/**
	 * Get the MapServer url for the map from the json
	 */
	get mapUrl() { return this._json.map.url; }
	
	/**
	 *Get the opacity of the map from the json
	 */
	get mapOpacity() { return this._json.map.opacity; }
	
	/**
	 * Get polygon symbology for specified behavior id
	 * @param {string} id - Behavior id
	 * @returns symbol - Symbol for the specified id
	 */
	symbol(id) {
		var s = this._json.symbols[id];
		
		if (!s) throw new Error(`Symbol ${0} does not exist is the configuration file.`);
		
		return s;
	}
	
	/**
	 * Get the context object (subject, theme, category, etc.)
	 */
	get context() { return this._context; }
	

	/**
	 * Get the chart configuration (field)
	 */
	get chart() { 
		return {
			field : this._json.chart.field[Core.locale]
		}
	}
	
	/**
	 * Get the table object (headers)
	 */
	get table() { return this._json.table; }
	
	/**
	 * Get the object with ids and labels for the table header.
	 */
	get tableHeaders() { 
		return this._json.table.headers.map(h => {
			return {
				id : h.id[Core.locale],
				label : h.label[Core.locale]
			}
		}); 
	}

	/**
	 * Get a label from the json for locale
	 */
	get labelName() {
		return this._json.name.label[Core.locale];
	}

	/**
	 * Get the object with id, label, and url for the legend items
	 */
	get legendItems(){
		return this._json.legend.items.map(i => {
			return {
				id : i.id,
				label : i.label[Core.locale],
				url : i.url
			}
		});
	}
	
	/**
	 * Get the alphabetized bookmarks and their extents
	 */
	get bookmarks() {
		var bookmarks = this._json.bookmarks.sort((a,b) => {
			if (a.name > b.name) return 1;
			
			if (a.name < b.name) return -1;
			
			return 0;
		})
		
		return bookmarks.map(b => {
			return {
				name : b.name,
				extent : {
					xmin : b.extent[0][0],
					xmax : b.extent[1][0],
					ymin : b.extent[0][1],
					ymax : b.extent[1][1],
				}
			}
		}); 
	}

	/**
	 * Get fields by locale for popup from json 
	 */
	 get popup() {
		var p = this._json.popup
		return {
			title : p.title[Core.locale],
			uom : p.uom[Core.locale],
			value : p.value[Core.locale],
			indicator : p.indicator[Core.locale],
			symbol : p.symbol[Core.locale],
			nulldesc : p.nulldesc[Core.locale]
		}; 
	}	
	
	/**
	 * Initialize configuration class from application json
	 * @param {object} json - application json data
	 * @returns {void}
	 */
	constructor(json) {
		this._json = json;
		
		this._context = new Context(json.context);
	}
}