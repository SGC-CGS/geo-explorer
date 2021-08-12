import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';
import Overlay from '../../geo-explorer-api/widgets/overlay.js';
import Menu from '../../geo-explorer-api/components/menu.js';

import wSelector from '../widgets/selector.js';
import wStyler from '../widgets/styler.js';
import wChart from '../widgets/wChart.js';
// import wLegend from '../widgets/legend.js';
import wBasemap from '../../geo-explorer-api/widgets/basemap.js';
import wBookmarks from '../../geo-explorer-api/widgets/bookmarks.js';
import wExport from '../widgets/wExport.js';

/**
 * Search widget module
 * @module widgets/search
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Toolbar", class wToolbar extends Widget {
	
	/**
	 * Get/set the widgets
	 * @type {object}
	 */
	set widgets(value) { this._widgets = value; }
	get widgets() { return this._widgets; }
	
	/**
	 * Get/set the map
	 * @type {object}
	 */
	set map(value) { this._map = value; }
	get map() { return this._map; }
	
	/**
	 * Call constructor of base class (Templated) and initialize search widget
	 * @param {object} container - div container and properties
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);
		
		this.menu = new Menu();
		
		this.widgets = {
			selector : new wSelector(Dom.Create("div")),
			styler : new wStyler(Dom.Create("div")),
			chart : new wChart(Dom.Create("div")),
			// legend : new wLegend(Dom.Create("div")),
			basemap : new wBasemap(Dom.Create("div")),
			bookmarks : new wBookmarks(Dom.Create("div")),
			export : new wExport(Dom.Create("div"))
		}
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @param {string} locale - The app's current language 
	 * @returns {void}
	 */
	Configure(config, map, storage) {
		this.config = config;
		this.map = map;
		this.storage = storage;
		
		for (var id in this.widgets) this.AddWidget(id, this.widgets[id]);
		
		this.widgets.chart.Configure(config.chart);
		this.widgets.basemap.Configure(map);
		this.widgets.bookmarks.Configure(config.bookmarks, map, storage);
		// this.widgets.legend.Configure(config.legend);
		
		this.menu.buttons.forEach(b => Dom.Place(b, this.Elem("menu")));
		
		map.Place([this.Elem("menu")], "top-right");
	}
	
	Widget(id) {
		return this.widgets[id] || null;
	}
	
	/**
	 * Add widget in map overlay.
	 * @param {string} id - Widget Id (ex. "selector")
	 * @param {string} title - Title to show at top of overlay
	 * @param {object} widget - Widget to load in the overlay
	 * @returns {void}
	 */
	AddWidget(id, widget) {
		var overlay = new Overlay();
		
		overlay.Configure({ id:id, widget:widget, title:widget.title, css:id })
		
		this.menu.AddOverlay(overlay);
		
		this.map.Place([overlay.roots[0]], "top-right");
	}
	
	/**
	 * Show widget in map overlay.
	 * @param {string} id - Widget Id (ex. "selector")
	 * @returns {void}
	 */
	ShowWidget(id) {
		var item = this.menu.Item(id);
		
		this.menu.ToggleOverlay(item);
	}
	
	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */
	HTML() {        
		return "<div handle='menu' class='menu'></div>";
	}
})