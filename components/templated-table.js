'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Evented from './evented.js';
import Templated from './templated.js';

/**
 * @description
 * Extends templated to create the table body element
 */

export default class templatedTable extends Templated { 

	BuildTemplate() {
		// Use template provided in options first, use Template function second
		var html = this._options.template ? this._options.template : this.Template();
		
		// TODO : I think it still works with empty templates.
		if (!html) return;
		
		// Trailing whitespaces can cause issues when parsing the template, remove them
		html = html.trim();
		
		var nls = this._nls;
		
		// Replace all nls strings in template. Nls string pattern in templates is nls(StringId)
		html = this.Replace(html, /nls\((.*?)\)/, function(m) { return nls.Resource(m); });
		
		this._template = Dom.Create("tbody", { innerHTML:html });
	}
}