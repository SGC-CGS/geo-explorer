import Templated from '../components/templated.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';
import Select from '../ui/select.js';

export default Core.Templatable("App.Widgets.Selector", class Selector extends Templated {
	
	static Nls() {
		return {
			"Selector_Title" : {
				"en" : "Select Data",
				"fr" : "Sélectionner des données"
			},
			"Selector_Subject" : {
				"en" : "Subject",
				"fr" : "Sujet"
			},
			"Selector_Subject_Placeholder" : {
				"en": "Select a subject",
				"fr": "Sélectionnez un sujet"
			},
			"Selector_Theme" : {
				"en" : "Theme",
				"fr" : "Thème"
			},
			"Selector_Theme_Placeholder" : {
				"en": "*... Select a theme",
				"fr": "*... Sélectionnez un thème"
			},
			"Selector_Category" : {
				"en" : "Category (Product)",
				"fr" : "Catégorie (Produit)"
			},
			"Selector_Category_Placeholder" : {
				"en" : "*... Select a product",
				"fr" : "*... Sélectionnez un produit"
			},
			"Selector_Value" : {
				"en" : "Value to Display",
				"fr" : "Valeur à afficher"
			},
			"Selector_Value_Placeholder" : {
				"en" : "*... Select a value to Display",
				"fr" : "*... Sélectionnez une valeur à afficher"
			},
			"Selector_Geography" : {
				"en" : "Geographic Level",
				"fr" : "Niveau géographique"
			},
			"Selector_Geography_Placeholder" : {
				"en" : "*... Select a geographic Level",
				"fr" : "*... Sélectionnez un niveau géographique"
			},
			"Selector_Filter_Label" : {
				"en" : "Filters",
				"fr" : "Filtres"
			},
			"Selector_Filter_Instructions" : {
				"en" : "Select a subject, theme and category (product) to show available filters.",
				"fr" : "Sélectionner un sujet, thème et catégorie (produit) pour afficher les filtres disponibles."
			},
			"Selector_Button_Apply" : {
				"en" : "Apply",
				"fr" : "Appliquer"
			},
			"Selector_Button_Close" : {
				"en" : "Cancel",
				"fr" : "Annuler"
			}
		}
	}
	
	constructor(container, options) {	
		super(container, options);
		this.filters = [];
		this.metadata = null;
		
		this.Node("sSubject").On("Change", this.OnSubject_Change.bind(this));
		this.Node("sTheme").On("Change", this.OnTheme_Change.bind(this));
		this.Node("sCategory").On("Change", this.OnCategory_Change.bind(this));
		this.Node("sValue").On("Change", this.OnValue_Change.bind(this));
		this.Node("sGeography").On("Change", this.OnGeography_Change.bind(this));
		
		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));
		
		this.Elem('sSubject').placeholder = this.Nls("Selector_Subject_Placeholder");
		this.Elem('sTheme').placeholder = this.Nls("Selector_Theme_Placeholder");
		this.Elem('sCategory').placeholder = this.Nls("Selector_Category_Placeholder");
		this.Elem('sValue').placeholder = this.Nls("Selector_Value_Placeholder");
		this.Elem('sGeography').placeholder = this.Nls("Selector_Geography_Placeholder");
		
		this.Elem('sTheme').disabled = true;
		this.Elem('sCategory').disabled = true;
		this.Elem('sValue').disabled = true;
		this.Elem('sGeography').disabled = true;
		this.Elem('bApply').disabled = true;
	}
	
	Update(context) {
		this.context = context;
		
		this.LoadDropDown(this.Elem("sSubject"), context.Lookup("subjects"));
		this.LoadDropDown(this.Elem("sTheme"), context.Lookup("themes"));
		this.LoadDropDown(this.Elem("sCategory"), context.Lookup("categories"));
		this.LoadDropDown(this.Elem("sGeography"), context.Lookup("geographies"));
		this.LoadDropDown(this.Elem('sValue'), context.Lookup("values"));
		
		this.LoadFilters(context.Lookup("filters"));
		
		this.Elem("sSubject").Select(i => i.value == context.subject);
		this.Elem("sTheme").Select(i => i.value == context.theme);
		this.Elem("sCategory").Select(i => i.value == context.category);
		this.Elem("sGeography").Select(i => i.value == context.geography);
		this.Elem("sValue").Select(i => i.value == context.value);
		
		this.filters.forEach((f, i) => {
			f.Select(j => j.value == context.filters[i]);
		});
	}
		
	LoadDropDown(select, items) {
		select.Empty();
		
		items.forEach(item => select.Add(item.label, item.description, item));
		
		select.disabled = false;
	}
	
	ResetFilter() {
		this.filters = [];
		
		Dom.Empty(this.Elem('filter'));
		Dom.RemoveCss(this.Elem("instructions"), "hidden");
	}
	
	LoadFilters(filters) {		
		Dom.AddCss(this.Elem("instructions"), "hidden");
		
		this.filters = filters.map(d => {
			var label = Dom.Create("label", { innerHTML:d.label }, this.Elem('filter'));
			var div = Dom.Create("div", null, this.Elem('filter'));
			var select = new Select(div);
			
			d.values.forEach(item => select.Add(item.label, null, item));
			
			select.Elem("root").firstChild.selected = true;
			
			select.On("Change", this.OnValue_Change.bind(this));
			
			return select;
		});
	}
	
	Disable(elements) {
		elements.forEach(e => {
			this.Elem(e).disabled = true;
			
			this.Elem(e).value = -1;
		});
		
		if (elements.indexOf('sValue') == -1) return;
		
		this.ResetFilter();
	}
	
	OnSubject_Change(ev) {
		this.Disable(['sTheme', 'sCategory', 'sValue', 'sGeography', 'bApply']);
		
		this.Emit("Busy");
		
		this.context.ChangeSubject(ev.item.value).then(c => {
			this.Emit("Idle");
		
			this.LoadDropDown(this.Elem("sTheme"), this.context.Lookup("themes"));
		}, error => this.OnRequests_Error(error));		
	}
	
	OnTheme_Change(ev) {
		this.Disable(['sCategory', 'sValue', 'sGeography', 'bApply']);
		
		this.Emit("Busy");
		
		this.context.ChangeTheme(ev.item.value).then(c => {
			this.Emit("Idle");
		
			this.LoadDropDown(this.Elem("sCategory"), this.context.Lookup("categories"));
		}, error => this.OnRequests_Error(error));		
	}
	
	OnCategory_Change(ev) {
		this.Disable(['sValue', 'sGeography', 'bApply']);
		
		this.Emit("Busy");
		
		this.context.ChangeCategory(ev.item.value).then(c => {
			this.Emit("Idle");
		
			this.LoadFilters(this.context.Lookup("filters"));
			this.LoadDropDown(this.Elem("sValue"), this.context.Lookup("values"));
		}, error => this.OnRequests_Error(error));		
	}
	
	OnValue_Change(ev) {
		if (this.Elem("sValue").value == -1) return;
		
		this.Disable(['sGeography', 'bApply']);
		
		var filters = this.filters.map(f => f.selected.value);
		var value = this.Elem("sValue").selected.value;
		
		this.Emit("Busy");
		
		this.context.ChangeIndicators(filters, value).then(c => {	
			this.Emit("Idle");
					
			this.LoadDropDown(this.Elem("sGeography"), this.context.Lookup("geographies"));
		}, error => this.OnRequests_Error(error));
	}
	
	OnGeography_Change(ev) {
		this.Elem('bApply').disabled = false;
		
		this.context.ChangeGeography(ev.item.value);
	}
	
	OnApply_Click(ev) {
		this.Emit("Busy");
		
		this.context.UpdateRenderer().then(c => {
			this.Emit("Idle");
		
			this.context.Commit();
			
			this.Emit("Change", { context:this.context });
		});
	}
	
	OnClose_Click(ev) {
		this.context.Revert();
		
		this.Update(this.context);
		
		this.Emit("Close");
	}
	
	OnRequests_Error (error) {
		this.Emit("Error", { error:error });
	}
	
	Template() {
		return	"<label class='sm-label'>nls(Selector_Subject)</label>" + 
				"<div handle='sSubject' widget='Basic.Components.Select'></div>" +
				"<label class='sm-label'>nls(Selector_Theme)</label>" + 
				"<div handle='sTheme' widget='Basic.Components.Select'></div>" +
				"<label>nls(Selector_Category)</label>" +
				"<div handle='sCategory' widget='Basic.Components.Select'></div>" +
				"<div class='filter-container'>" + 
					"<label>nls(Selector_Filter_Label)</label>" +
					"<div handle='instructions' class='filter-instructions'>nls(Selector_Filter_Instructions)</div>" +
					"<div handle='filter' class='filter'></div>" +
				"</div>" +
				"<label>nls(Selector_Value)</label>" +
				"<div handle='sValue' widget='Basic.Components.Select'></div>" +
				"<label>nls(Selector_Geography)</label>" +
				"<div handle='sGeography' widget='Basic.Components.Select'></div>" +
				"<div class='button-container'>" + 
					"<button handle='bApply' class='button-label button-apply'>nls(Selector_Button_Apply)</button>" +
					"<button handle='bClose' class='button-label button-close'>nls(Selector_Button_Close)</button>" +
				"</div>";
	}
})