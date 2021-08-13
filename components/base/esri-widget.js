import Widget from './widget.js';
import Core from '../../tools/core.js';

/**
 * Search widget module
 * @module widgets/search
 * @extends Widget
 */
export default Core.Templatable("Api.Widgets.EsriWidget", class EsriWidget extends Widget {

	get roots() { return [this.widget]; }
	
	set wrapped(value) { this._wrapped = value;	}
	get wrapped() { return this._wrapped;	}
	
	constructor(...config) {	
		super(...config);
	}
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @param {string} locale - The app's current language 
	 * @returns {void}
	 */
	Configure(wrapped) {
		this.wrapped = wrapped;
	}
})