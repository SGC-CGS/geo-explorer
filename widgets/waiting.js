import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

export default Core.Templatable("App.Widgets.Waiting", class Waiting extends Templated {
	
	static Nls() {
		return {
			"Waiting_Label": {
				"en" : "Working...",
				"fr" : "Chargement..."
			}
		}
	}
	
	constructor(container, options) {	
		super(container, options);
		
		this.Hide();
	}
	
	Show() {
		Dom.RemoveCss(this.container, "hidden");
	}
	
	Hide() {
		Dom.AddCss(this.container, "hidden");
	}
	
	Template() {        
		return "<label handle='label'>nls(Waiting_Label)</label>" +
			   "<i class='fa fa-circle-o-notch fa-spin'></i>";
	}
})