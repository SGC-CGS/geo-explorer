'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Evented from './evented.js';
import Node from './node.js';
import Templated from './templated.js';

export default class templatedTable extends Templated { 

	BuildTemplate() {
		// Use template provided in options first, use Template function second
		var html = this.options.template ? this.options.template : this.Template();
		
		// TODO : I think it still works with empty templates.
		if (!html) return;
		
		// Trailing whitespaces can cause issues when parsing the template, remove them
		html = html.trim();
		
		// Replace all nls strings in template. Nls string pattern in templates is nls(StringId)
		html = this.Replace(html, /nls\((.*?)\)/, function(m) { return Core.Nls(m); });
		
		this.template = Dom.Create("tbody", { innerHTML:html });
	}
}