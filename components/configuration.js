import Core from '../../geo-explorer-api/tools/core.js';
import Context from './context.js';

/**
 * Configuration module
 * @module components/configuration
 * @description Grab all the JSON content from application.json
 * and use get accessors to retrieve parts of the content.
 * You can see the accessors being used in application.js.
 */
export default class Configuration {
	
	/**
	 * @description get the map object and all its contents
	 */
	get map() { return this._json.map; }
	
	/**
	 * @description get the MapServer url for the map
	 */
	get mapUrl() { return this._json.map.url; }
	
	/**
	 * @description get the opacity of the map
	 */
	get mapOpacity() { return this._json.map.opacity; }
	
	symbol(id) {
		var s = this._json.symbols[id];
		
		if (!s) throw new Error(`Symbol ${0} does not exist is the configuration file.`);
		
		return s;
	}
	
	/**
	 * @description get the context object and all its contents 
	 * (subject, theme, category, etc.)
	 */
	get context() { return this._context; }
	

	/**
	 * @description get the chart configuration
	 * (field)
	 */
	get chart() { 
		return {
			field : this._json.chart.field[Core.locale]
		}
	}
	
	/**
	 * @description get the table object and all its contents 
	 * (headers)
	 */
	get table() { return this._json.table; }
	
	/**
	 * @description Get the ids and labels for the table header.
	 * @returns object containing ids and labels in the website's current language
	 */
	get tableHeaders() { 
		return this._json.table.headers.map(h => {
			return {
				id : h.id[Core.locale],
				label : h.label[Core.locale]
			}
		}); 
	}

	get labelName() {
		return this._json.name.label[Core.locale];
	}

	/**
	 * @description Get the id, label, and url for the legend items
	 * @returns object containing id, label and url of legend items
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
	 * @description Get the bookmarks in alphabetical order along 
	 * with their extents
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
	
	constructor(json) {
		this._json = json;
		
		this._context = new Context(json.context);
	}
}