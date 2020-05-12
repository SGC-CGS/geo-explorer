import Overlay from './overlay.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';

export default Core.Templatable("App.Widgets.Legend", class Legend extends Overlay {
	
	constructor(container, options) {	
		super(container, options);
	}
	
	Template() {
		return "<div handle='overlay' class='overlay legend'>" +
				  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'>nls(Legend_Title)</h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
				  "<hr>" +
				  "<div class='overlay-body' handle='body'>" + 

				  "</div>" +
			   "</div>";
	}
})