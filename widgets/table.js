import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from "../tools/net.js";

export default Core.Templatable("App.Widgets.Table", class Table extends Templated {
	
	set Title(value) { this.Elem("title").innerHTML = value; }
	
	set Headers(value) {
		this.headers = value; 
		
		Dom.Create("th", { }, this.Elem("header"));
		
		this.headers.forEach(h => {
			Dom.Create("th", { innerHTML:h.label }, this.Elem("header"));
		});
	}

	set data(value){
		this.Populate(value)
	}
	

	constructor(container) {	
		super(container);
		
		Dom.AddCss(this.container, 'hidden');
	}

	Update(context) {
		this.context = context; 
		
		Dom.Empty(this.Elem('body'));
		
		Dom.RemoveCss(this.container, 'hidden');
		
		this.UpdateTableVisibility();
		
		this.Title = this.context.IndicatorsLabel();
	}

	//Update the table content with the correct data of the DBU
	Populate(graphics) {
		Dom.Empty(this.Elem('body'));
		
		graphics.forEach(g => {
			var name = g.attributes[this.headers[1].id];
			
			var tr = Dom.Create("tr", { className:"table-row" }, this.Elem("body"));
			
			this.CreateButton(tr, g, name);
			
			this.headers.forEach(f => {				
				Dom.Create("td", { className:"table-cell", innerHTML:g.attributes[f.id] }, tr);
			});
						
			tr.title = Core.Nls("Table_Row_Title", [name]);
			
			tr.addEventListener("click", ev => this.Emit("RowClick", { feature:g }));
		});
		
		this.UpdateTableVisibility();
	}
	
	CreateButton(tr, g, name){
		var td = Dom.Create("td", { className:"table-cell" }, tr);
		var bt = Dom.Create("button", { className:"table-button", title:Core.Nls("Table_Thrash_Title", [name]) }, td);
		var ic = Dom.Create("i", { className:"fa fa-trash" }, bt);
		
		bt.addEventListener("click", ev => {
			ev.stopPropagation();
			
			this.Emit("RowButtonClick", { graphic:g })
		});
	}
	
	UpdateTableVisibility() {
		var isVisible = this.Elem("body").children.length > 0;
		
		Dom.ToggleCss(this.Elem("message"), 'hidden', isVisible);
		Dom.ToggleCss(this.Elem("table"), 'hidden', !isVisible);
	}
	
	Template() {
		return "<div class='table-widget'>" +
				  "<h2 handle='title'></h2>" +
			      "<div handle='message' class='table-message'>nls(Table_Message)</div>"+
			      "<div handle='table' class='table-container hidden'>" + 
					 "<summary handle='description'></summary>" +
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