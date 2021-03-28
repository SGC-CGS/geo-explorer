import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

export default Core.Templatable("App.Widgets.Bookmarks", class Bookmarks extends Templated {
	
	set Map(value) { 
		this.map = value; 
		
        this.bookmarks = new ESRI.widgets.Bookmarks({
			view: this.map.view,
			container: this.Elem("content"),
			editingEnabled: false
        });
	}
	
	set Bookmarks(value) {
		this.bookmarks.bookmarks = value;
	}
	
	static Nls() {
		return {
			"Bookmarks_Title" : {
				"en": "Bookmarks",
				"fr": "Géosignets"
			}
		}
	}
	
	constructor(container, options) {	
		super(container, options);
		
		this.bookmarks = null;
	}
	
	Template() {
		return "<div handle='content'></div>";
	}
})