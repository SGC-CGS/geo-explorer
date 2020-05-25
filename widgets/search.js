import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';
import Typeahead from '../ui/typeahead/dynamic.js';

export default Core.Templatable("App.Widgets.Search", class Search extends Templated {
	
	constructor(container, options) {	
		super(container, options);
		
		this.Elem("typeahead").storeFn = (value) => {
			return Requests.Typeahead(value, "GeographyReferenceId", "SearchDisplayName");
		}
		
		this.Elem("typeahead").On("Change", this.OnTypeahead_Change.bind(this));
	}
	
	OnTypeahead_Change(ev) {
		Requests.Placename(ev.item.id, ev.item.label).then(feature => {
			this.Emit("Change", { feature:feature });
		}, error => {
			this.Emit("Error", { error:error });
		});
	}
	
	Template() {        
		return "<div handle='root'>" +
				  "<div handle='typeahead' widget='Basic.Components.DynamicTypeahead'></div>" +
				  "<ul handle='list' class='list'></ul>" +
			   "</div>";
	}
})