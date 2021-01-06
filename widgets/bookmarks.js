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
		this.bookmarks = value;
		return;
		var bookmarks = value.sort((a,b) => {
			if (a.name > b.name) return 1;
			
			if (a.name < b.name) return -1;
			
			return 0;
		})
		
		this.bookmarks.bookmarks = bookmarks.map(b => {
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