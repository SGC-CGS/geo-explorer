import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from "../tools/net.js";

export default Core.Templatable("App.Widgets.Table", class Table extends Templated {
	
	set Title(value) { this.Elem("title").innerHTML = value; }
	
	constructor(container) {	
		super(container);
				
		this.current = {
			item : null,
			page : 1,
			max : null
		}

		// this.Node('prev').On('click', this.OnButtonPrev_Handler.bind(this));
		// this.Node('next').On('click', this.OnButtonNext_Handler.bind(this));
		
		Dom.AddCss(this.container, 'hidden');
	}

	Initialize(config) {
		this.config = config; 
		
		Dom.Create("th", { }, this.Elem("header"));
			
		config.headers.forEach(h => {
			Dom.Create("th", { innerHTML:h.label[Core.locale] }, this.Elem("header"));
		});
	}

	Update(context) {
		this.context = context; 
		
		Dom.Empty(this.Node('body'));
		
		Dom.RemoveCss(this.container, 'hidden');
		Dom.RemoveCss(this.Elem("message"), 'hidden');
		Dom.AddCss(this.Elem("table"), 'hidden')
		
		this.Title = this.context.IndicatorsLabel();
	}

	//Update the table content with the correct data of the DBU
	Populate(graphics) {
		Dom.Empty(this.Node('body'));
		Dom.AddCss(this.Elem("message"), 'hidden');
		Dom.RemoveCss(this.Elem("table"), 'hidden');
		
		graphics.forEach(g => {
			var name = g.attributes[this.config.headers[1].id[Core.locale]];
			
			var tr = Dom.Create("tr", { className:"table-row" }, this.Elem("body"));
				
			var td = Dom.Create("td", { className:"table-cell" }, tr);
			var bt = Dom.Create("button", { className:"table-button", title:Core.Nls("Table_Thrash_Title", [name]) }, td);
			var ic = Dom.Create("i", { className:"fa fa-trash" }, bt);
			
			this.config.headers.forEach(f => {
				var id = f.id[Core.locale];
				
				Dom.Create("td", { className:"table-cell", innerHTML:g.attributes[id] }, tr);
			});
						
			tr.title = Core.Nls("Table_Row_Title", [name]);
			
			tr.addEventListener("click", ev => {
				this.Emit("RowClick", { graphic:g });
			})
		});
	}
	/*
	OnButtonPrev_Handler(ev) {
		this.current.page--;
		
		this.UpdateTable(this.current.item, this.current.page);
	}

	OnButtonNext_Handler(ev) {
		this.current.page++;
		
		this.UpdateTable(this.current.item, this.current.page);
	}
	*/
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
				     //"<div class='navigation'>" + 
					 //   "<button handle='prev' title='nls(Table_Previous_Button)' disabled><img src='assets/arrow-left.png'></button>"+
					 //   "<span handle='current' class='current'></span>"+ 
					 //   "<button handle='next' title='nls(Table_Next_Button)' disabled><img src='assets/arrow-right.png'></button>"+
				     //"</div>" + 
			      "</div>" + 
			   "</div>"
	}
	
	
	
	UpdateTable(item, page) {	
		this.current.page = page || 1;
		this.current.item = item;
		this.current.max = this.summary[item.id] || 0;
	}

	ToggleButtons() {
		this.Node('prev').disabled = (this.current.page <= 1);
		this.Node('next').disabled = (this.current.page >= this.current.max);
	}
})