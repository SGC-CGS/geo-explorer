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
	
	constructor(json) {
		this.json = json;
	}
}