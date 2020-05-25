import Typeahead from './typeahead.js';
import Core from '../../tools/core.js';

export default Core.Templatable("Basic.Components.StaticTypeahead", class StaticTypeahead extends Typeahead {

	constructor(container, options) {	
		super(container, options);
	}
	
	Refresh(mask) {
		var d = Core.Defer();
		
		var items = this._store.filter(i => compare(i.data.label, mask));
		
		d.Resolve(items);
		
		function compare(label, mask) {
			return label.toLowerCase().indexOf(mask.toLowerCase()) !== -1
		}
		
		return d.promise;
	}
})