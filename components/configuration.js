import Core from '../tools/core.js';

export default class Configuration {
	
	get Map() { return this.json.map; }
	
	get MapUrl() { return this.json.map.url; }
	
	get MapOpacity() { return this.json.map.opacity; }
	
	Symbol(id) {
		var s = this.json.symbols[id];
		
		if (!s) throw new Error(`Symbol ${0} does not exist is the configuration file.`);
		
		return s;
	}
	
	get Context() { return this.json.context; }
	
	get ContextSubject() { return this.json.context.subject; }
	
	get ContextTheme() { return this.json.context.theme; }
	
	get ContextCategory() { return this.json.context.category; }
	
	get ContextFilters() { return this.json.context.filters; }
	
	get ContextValue() { return this.json.context.value; }
	
	get ContextGeography() { return this.json.context.geography; }
	
	get Table() { return this.json.table; }
	
	get TableHeaders() { 
		return this.json.table.headers.map(h => {
			return {
				id : h.id[Core.locale],
				label : h.label[Core.locale]
			}
		}); 
	}

	get LegendItems(){
		return this.json.legend.items.map(i => {
			return {
				id : i.id,
				label : i.label[Core.locale],
				url : i.url
			}
		});
	}
	
	get Bookmarks() {
		var bookmarks = this.json.bookmarks.sort((a,b) => {
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
		this.json = json;
	}
}