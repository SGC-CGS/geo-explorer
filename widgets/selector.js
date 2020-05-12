import Overlay from './overlay.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';

export default Core.Templatable("App.Widgets.Selector", class Selector extends Overlay {
	
	constructor(container, options) {	
		super(container, options);
		
		return;
		
		Requests.Subject(null).then(ev => {
			// debugger;
		}, error => {
			this.OnRequests_Error.bind(this);
		});
	}
	
	OnRequests_Error (error) {
		debugger;
	}
	
	Template() {
		return "<div handle='overlay' class='overlay selector'>" +
				  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'>nls(Selector_Title)</h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
				  "<hr>" +
				  "<div class='overlay-body' handle='body'>" + 
					  "<label class=''>nls(Selector_Subject)<select></select></label>" +
					  "<label class=''>nls(Selector_Theme)<select></select></label>" +
					  "<label class=''>nls(Selector_Category)<select></select></label>" +
					  "<label class=''>nls(Selector_Date)<select></select></label>" +
					  "<label class=''>nls(Selector_AgeGroup)<select></select></label>" +
					  "<label class=''>nls(Selector_Sex)<select></select></label>" +
					  "<label class=''>nls(Selector_Indicator)<select></select></label>" +
					  "<label class=''>nls(Selector_Valeur)<select></select></label>" +
					  "<label class=''>nls(Selector_Geography)<select></select></label>" +
				  "</div>" +
			   "</div>";
	}
})