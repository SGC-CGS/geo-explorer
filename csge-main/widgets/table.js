import Widget from '../../csge-api/components/base/widget.js';
import Core from '../../csge-api/tools/core.js';
import Dom from '../../csge-api/tools/dom.js';

/**
 * Table widget module
 * @module widgets/table
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Table", class wTable extends Widget {
	
	/**
	 * Get / set table title
	 */
	get title() { return this.Elem("title").innerHTML }

	set title(value) { this.Elem("title").innerHTML = value; }
	
	/**
	 * Call constructor of base class (Templated) and initialize table widget
	 * @param {object} container - div table container and properties
	 * @returns {void}
	 */
	constructor(...config) {	
		super(...config);
		
		Dom.AddCss(this.roots[0], 'hidden');
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(map, config, selection) {
		this.map = map;
		
		this.config.headers = config.headers.map(h => {
			return {
				id: h.id[Core.locale],
				label: h.label[Core.locale]
			}
		});

		// For removing all rows from selection
		var tr = Dom.Create("tr", { }, this.Elem("header"));
		var th = Dom.Create("th", { }, tr);
		this.CreateButton(th, null, this.Nls("Table_Trash_All_Title"), "fa fa-trash"); 
		
		this.config.headers.forEach(h => {
			Dom.Create("th", { innerHTML:h.label }, tr);
		});
		
		this.selection = selection;
		
		this.selection.On("change", ev => this.Populate(ev.graphics));
	}
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Table_Message", "en", "Please select geometries on the map to show their attributes in the table.");
		nls.Add("Table_Message", "fr", "Veuillez sélectionner des géométries sur la carte afin d'afficher leur attributs dans le tableau.");	
		nls.Add("Table_Row_Title", "en", "Click to zoom to geometry ({0})");
		nls.Add("Table_Row_Title", "fr", "Cliquer pour zoomer sur la géométrie ({0})");	
		nls.Add("Table_Trash_Item_Title", "en", "Click to remove geometry ({0}) from selection");
		nls.Add("Table_Trash_Item_Title", "fr", "Cliquer retirer la géométrie ({0}) de la sélection");	
		nls.Add("Table_Trash_All_Title", "en", "Click to remove all geometries from selection");
		nls.Add("Table_Trash_All_Title", "fr", "Cliquer retirer toutes les géométries de la sélection");			
	}

	/**
	 * Clears and hides table element
	 * @param {object} context - Context object
	 * @returns {void}
	 */
	Update(context) {
		this.context = context; 
		
		Dom.RemoveCss(this.roots[0], 'hidden');
		
		this.UpdateTableVisibility();
		
		this.title = this.context.IndicatorsLabel();
	}

	/**
	 * Update the table content with the correct data of the DBU 
	 * @param {object} graphics - Selected locations from map
	 * @returns {void}
	 */
	Populate(graphics) {
		Dom.Empty(this.Elem('body'));
		
		graphics.forEach(g => {
			var name = g.attributes[this.config.headers[1].id];
			var title = this.Nls("Table_Trash_Item_Title", [name]);
			var tr = Dom.Create("tr", { className:"table-row" }, this.Elem("body"));
			var td = Dom.Create("td", { className:"table-cell" }, tr);

			this.CreateButton(td, g, title, "fa fa-remove"); // For deleting row from selection
			
			this.config.headers.forEach(f => {				
				Dom.Create("td", { className:"table-cell", innerHTML:g.attributes[f.id] }, tr);
			});
			
			tr.title = this.Nls("Table_Row_Title", [name]);
			
			tr.addEventListener("click", ev => {
				this.map.GoTo(g.geometry);
				
				this.Emit("RowClick", { feature:g })
			});
		});
		
		this.UpdateTableVisibility();
	}

	/**
	 * Create trash button for each row of table
	 * @param {string} cell - Table cell element for holding button (td/th)
	 * @param {object} g - Accessor for map
	 * @param {string} title Localized button title
	 * @param {string} icon - fa icon name
	 * @returns {void}
	 */
	CreateButton(cell, g, title, icon){
		var bt = Dom.Create("button", { className:"table-button", title:title }, cell);
		var ic = Dom.Create("i", { className:icon }, bt);
		
		bt.addEventListener("click", ev => {
			ev.stopPropagation();
			
            g ? this.selection.Remove(g) : this.selection.RemoveAll();
		});
	}
	
	/**
	 * Update CSS to toggle table visibility
	 * @returns void
	 */
	UpdateTableVisibility() {
		var isVisible = this.Elem("body").children.length > 0;
		
		Dom.ToggleCss(this.Elem("message"), 'hidden', isVisible);
		Dom.ToggleCss(this.Elem("table"), 'hidden', !isVisible);
    }
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for table widget
	 */
	HTML() {
		return "<div class='table-widget'>" +
				  "<h2 handle='title'></h2>" +
			      "<div handle='message' class='table-message'>nls(Table_Message)</div>"+
			      "<div handle='table' class='table-container hidden'>" + 
					 // "<summary handle='description'></summary>" +
				     "<table>" +
				        "<thead handle='header'></thead>" +
				        "<tbody handle='body'></tbody>" + 
				     "</table>" + 
			      "</div>" + 
			   "</div>"
	}
})