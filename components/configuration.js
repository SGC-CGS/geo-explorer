import Core from '../tools/core.js';
import Context from './context.js';

/**
 * Grab all the JSON content from application.json
 * and use get accessors to retrieve parts of the content.
 * You can see the accessors being used in application.js.
 * @module components/configuration
 */
export default class Configuration {
	
	/**
	 * Get the map object and all its contents
	 */
	get map() { return this._json.map; }
	
	/**
	 * Get the MapServer url for the map
	 */
	get mapUrl() { return this._json.map.url; }
	
	/**
	 * Get the opacity of the map
	 */
	get mapOpacity() { return this._json.map.opacity; }
	
	/**
	 * Get symbol properties from JSON object
	 * @param {string} id - Symbol name (ex. selection, identify)
	 * @returns {object} Object containing symbol properties (type, color, style, outline)
	 */
	symbol(id) {
		var s = this._json.symbols[id];
		
		if (!s) throw new Error(`Symbol ${0} does not exist is the configuration file.`);
		
		return s;
	}
	
	/**
	 * Get the context object and all its contents (subject, theme, category, etc.)
	 */
	get context() { return this._context; }
	

	/**
	 * Get the chart configuration
	 */
	get chart() { 
		return {
			field : this._json.chart.field[Core.locale]
		}
	}
	
	/**
	 * Get the table object and all its contents (headers)
	 */
	get table() { return this._json.table; }
	
	/**
	 * Get the ids (field names) and labels for the table header.
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
	 * Return label name from JSON object - This function does not appear to be in use.
	 */
	get labelName() {
		return this._json.name.label[Core.locale];
	}

	/**
	 * Get the id, label, and url for the legend items
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
	 * Get the bookmarks in alphabetical order along with their extents
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
	 * Initialize configuration class by setting json and context (data) 
	 * @param {object} json - json with page content (bookmarks, colors, context, layers, legend, map, symbols, tables)
	 * @returns {void}
	 */	
	constructor(json) {
		this._json = json;
		
		this._context = new Context(json.context);
	}
}