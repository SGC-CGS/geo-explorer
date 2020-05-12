import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';

export default Core.Templatable("App.Widgets.Search", class Search extends Templated {
	
	constructor(container, options) {	
		super(container, options);
	}
	
	
	Template() {        
		return "<div handle='root' class='typeahead collapsed'>" +
				  "<input handle='input' type='text' class='input' placeholder='nls(Search_Typeahead_Title)' title='nls(Search_Typeahead_Title)'>" + 
				  "<ul handle='list' class='list'></ul>" +
			   "</div>";
	}
})