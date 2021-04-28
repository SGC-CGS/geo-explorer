import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from "../tools/net.js";

/**
 * Table widget module
 * @module widgets/table
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Table", class Table extends Templated {
	
	/**
	 * Set table title
	 */
	set title(value) { this.Elem("title").innerHTML = value; }
	
	/**
	 * Get/set table headers
	 */
	get headers() { return this._headers; }
	
	set headers(value) {
		this._headers = value; 
		
		Dom.Create("th", { }, this.Elem("header"));
		
		this._headers.forEach(h => {
			Dom.Create("th", { innerHTML:h.label }, this.Elem("header"));
		});
	}

	set data(selection){
		this.Populate(selection.items);
	}
	
	/**
	 Return messages for table widget in both languages
	 * @returns {object.<string, string>} Table text for each language
	 */
	static Nls(nls) {
		nls.Add("Table_Message", "en", "Please select geometries on the map to show their attributes in the table.");
		nls.Add("Table_Message", "fr", "Veuillez sélectionner des géométries sur la carte afin d'afficher leur attributs dans le tableau.");	
		nls.Add("Table_Row_Title", "en", "Click to zoom to geometry ({0})");
		nls.Add("Table_Row_Title", "fr", "Cliquer pour zoomer sur la géométrie ({0})");	
		nls.Add("Table_Thrash_Title", "en", "Click to remove geometry ({0}) from selection");
		nls.Add("Table_Thrash_Title", "fr", "Cliquer retirer la géométrie ({0}) de la sélection");	
	}
	
	/**
	 * Call constructor of base class (Templated) and initialize table widget
	 * @param {object} container - div table container and properties
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);
		
		Dom.AddCss(this.container, 'hidden');
	}

	/**
	 * Clears and hides table element
	 * @param {object} context - Context object
	 * @returns {void}
	 */
	Update(context) {
		this.context = context; 
		
		Dom.Empty(this.Elem('body'));
		
		Dom.RemoveCss(this.container, 'hidden');
		
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
			var name = g.attributes[this.headers[1].id];
			
			var tr = Dom.Create("tr", { className:"table-row" }, this.Elem("body"));
			
			this.CreateButton(tr, g, name);
			
			this.headers.forEach(f => {				
				Dom.Create("td", { className:"table-cell", innerHTML:g.attributes[f.id] }, tr);
			});
						
			tr.title = this.Nls("Table_Row_Title", [name]);
			
			tr.addEventListener("click", ev => this.Emit("RowClick", { feature:g }));
		});
		
		this.UpdateTableVisibility();
	}

	/**
	 * Create trash button for each row of table
	 * @param {object} tr - Table row
	 * @param {object} g - Accessor for map
	 * @param {string} name - Name of location in table row
	 * @returns {void}
	 */
	CreateButton(tr, g, name){
		var td = Dom.Create("td", { className:"table-cell" }, tr);
		var bt = Dom.Create("button", { className:"table-button", title:this.Nls("Table_Thrash_Title", [name]) }, td);
		var ic = Dom.Create("i", { className:"fa fa-trash" }, bt);
		
		bt.addEventListener("click", ev => {
			ev.stopPropagation();
			
			this.Emit("RowButtonClick", { graphic:g })
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
	Template() {
		return "<div class='table-widget'>" +
				  "<h2 handle='title'></h2>" +
			      "<div handle='message' class='table-message'>nls(Table_Message)</div>"+
			      "<div handle='table' class='table-container hidden'>" + 
					 // "<summary handle='description'></summary>" +
				     "<table>" +
				        "<thead>" + 
				           "<tr handle='header'></tr>" + 
				        "</thead>" +
				        "<tbody handle='body'></tbody>" + 
				     "</table>" + 
			      "</div>" + 
			   "</div>"
	}
})