import Overlay from './overlay.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

export default Core.Templatable("App.Widgets.Bookmarks", class Bookmarks extends Overlay {
	
	set Map(value) { 
		this.map = value; 
		
        this.bookmarks = new ESRI.widgets.Bookmarks({
          view: this.map.view,
		  container: this.Elem("body"),
          editingEnabled: false
        });
	}
	
	set Bookmarks(value) {
		this.bookmarks.bookmarks = value;
	}
	
	constructor(container, options) {	
		super(container, options);
		
		this.bookmarks = null;
	}
	
	Template() {
		return	  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'>nls(Bookmarks_Title)</h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
				  "<hr>" +
				  "<div class='overlay-body' handle='body'>" + 

				  "</div>";
	}
})