import Core from '../tools/core.js';
import Context from './context.js';

export default class Configuration {
	
	get map() { return this._json.map; }
	
	get mapUrl() { return this._json.map.url; }
	
	get mapOpacity() { return this._json.map.opacity; }
	
	symbol(id) {
		var s = this._json.symbols[id];
		
		if (!s) throw new Error(`Symbol ${0} does not exist is the configuration file.`);
		
		return s;
	}
	
	get context() { return this._context; }
	
	get table() { return this._json.table; }
	
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

	get legendItems(){
		return this._json.legend.items.map(i => {
			return {
				id : i.id,
				label : i.label[Core.locale],
				url : i.url
			}
		});
	}
	
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