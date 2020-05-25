import Overlay from './overlay.js';
import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Requests from '../tools/requests.js';
import Select from '../ui/select.js';

export default Core.Templatable("App.Widgets.Selector", class Selector extends Overlay {
	
	constructor(container, options) {	
		super(container, options);
		
		Requests.Subject(null).then(items => this.LoadDropDown(this.Elem("sSubject"), items), error => this.OnRequests_Error.bind(this));
		
		this.filters = [];
		this.metadata = null;
		
		this.Node("sSubject").On("Change", this.OnSubject_Change.bind(this));
		this.Node("sTheme").On("Change", this.OnTheme_Change.bind(this));
		this.Node("sCategory").On("Change", this.OnCategory_Change.bind(this));
		this.Node("sValue").On("Change", this.OnValue_Change.bind(this));
		this.Node("sGeography").On("Change", this.OnGeography_Change.bind(this));
		
		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));
		
		this.Elem('sSubject').placeholder = Core.Nls("Selector_Subject_Placeholder");
		this.Elem('sTheme').placeholder = Core.Nls("Selector_Theme_Placeholder");
		this.Elem('sCategory').placeholder = Core.Nls("Selector_Category_Placeholder");
		this.Elem('sValue').placeholder = Core.Nls("Selector_Value_Placeholder");
		this.Elem('sGeography').placeholder = Core.Nls("Selector_Geography_Placeholder");
		
		this.Elem('sTheme').disabled = true;
		this.Elem('sCategory').disabled = true;
		this.Elem('sValue').disabled = true;
		this.Elem('sGeography').disabled = true;
		this.Elem('bApply').disabled = true;
	}
	
	InitialRenderer() {
		// Generate Renderer test
		var breaks = {
			BreakAlgorithm:"esriClassifyNaturalBreaks"
		}
		
		var metadata = {
			IndicatorId : 216708,
			DefaultBreaks : 5,
			ColorFrom : "255,204,188,255",
			ColorTo : "183,28,28,255",
			PrimaryQuery : "SELECT iv.value AS Value, CASE WHEN iv.value IS NULL THEN nr.symbol ELSE Format(iv.value, 'N0', 'en-US') END AS FormattedValue_EN,  CASE WHEN iv.value IS NULL THEN nr.symbol ELSE Format(iv.value, 'N0', 'fr-CA') END AS FormattedValue_FR, grfi.GeographyReferenceId, g.DisplayNameShort_EN, g.DisplayNameShort_FR, g.DisplayNameLong_EN, g.DisplayNameLong_FR, g.ProvTerrName_EN, g.ProvTerrName_FR, g.Shape, i.IndicatorName_EN, i.IndicatorName_FR, i.IndicatorId, i.IndicatorDisplay_EN, i.IndicatorDisplay_FR, i.UOM_EN, i.UOM_FR, g.GeographicLevelId, gl.LevelName_EN, gl.LevelName_FR, gl.LevelDescription_EN, gl.LevelDescription_FR, g.EntityName_EN, g.EntityName_FR, nr.Symbol, nr.Description_EN as NullDescription_EN, nr.Description_FR as NullDescription_FR FROM gis.geographyreference AS g INNER JOIN gis.geographyreferenceforindicator AS grfi ON g.geographyreferenceid = grfi.geographyreferenceid  INNER JOIN (select * from gis.indicator where indicatorId = 216708) AS i ON grfi.indicatorid = i.indicatorid  INNER JOIN gis.geographiclevel AS gl ON g.geographiclevelid = gl.geographiclevelid  INNER JOIN gis.geographiclevelforindicator AS glfi  ON i.indicatorid = glfi.indicatorid  AND gl.geographiclevelid = glfi.geographiclevelid  INNER JOIN gis.indicatorvalues AS iv  ON iv.indicatorvalueid = grfi.indicatorvalueid  INNER JOIN gis.indicatortheme AS it ON i.indicatorthemeid = it.indicatorthemeid  LEFT OUTER JOIN gis.indicatornullreason AS nr  ON iv.nullreasonid = nr.nullreasonid"
		}
		
		var geography = 'A0007';
		
		this.GetRenderer(metadata, breaks, geography);
	}
	
	GetRenderer(metadata, breaks, geography) {		
		Requests.Renderer(metadata, breaks, geography).then(renderer => {
			this.Emit("Ready", renderer);
		}, error => this.OnRequests_Error.bind(this));
	}
	
	OnSubject_Change(ev) {
		this.Disable(['sTheme', 'sCategory', 'sValue', 'sGeography', 'bApply']);
		
		Requests.Subject(ev.item.value).then(items => this.LoadDropDown(this.Elem("sTheme"), items), error => this.OnRequests_Error.bind(this));		
	}
	
	OnTheme_Change(ev) {
		this.Disable(['sCategory', 'sValue', 'sGeography', 'bApply']);
		
		Requests.Theme(ev.item.value).then(items => this.LoadDropDown(this.Elem("sCategory"), items), error => this.OnRequests_Error.bind(this));
	}
	
	OnCategory_Change(ev) {
		this.Disable(['sValue', 'sGeography', 'bApply']);
		
		Requests.Filter(ev.item.value).then(items => this.LoadFilterAndValue(items), error => this.OnRequests_Error.bind(this));		
	}
	
	OnValue_Change(ev) {
		if (this.Elem("sValue").value == -1) return;
		
		this.Disable(['sGeography', 'bApply']);
		
		var ids = this.filters.map(f => f.selected.id);
		
		ids.push(this.Elem("sValue").selected.id);
		
		Requests.Value(ids).then(data => {
			this.metadata = data.metadata;
			
			this.Emit("Metadata", { metadata:data.metadata });
			
			this.LoadDropDown(this.Elem("sGeography"), data.items)
		}, error => this.OnRequests_Error.bind(this));	
	}
	
	OnGeography_Change(ev) {
		this.Elem('bApply').disabled = false;
	}
	
	OnApply_Click(ev) {
		var geography = this.Elem('sGeography').selected;
		
		Requests.Break(this.metadata["DefaultBreaksAlgorithmId"]).then(breaks => {
			this.GetRenderer(this.metadata, breaks, geography.value);
		}, error => this.OnRequests_Error.bind(this));
	}
	
	OnClose_Click(ev) {
		this.Hide();
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
	
	LoadFilterAndValue(data) {		
		Dom.AddCss(this.Elem("instructions"), "hidden");
		
		this.filters = data.filters.map(d => {
			var label = Dom.Create("label", { innerHTML:d.label }, this.Elem('filter'));
			var div = Dom.Create("div", null, this.Elem('filter'));
			var select = new Select(div);
			
			d.values.forEach(item => select.Add(item.label, null, item));
			
			select.Elem("root").firstChild.selected = true;
			
			select.On("Change", this.OnValue_Change.bind(this));
			
			return select;
		});
		
		this.LoadDropDown(this.Elem('sValue'), data.value.values);
	}
	
	Disable(elements) {
		elements.forEach(e => {
			this.Elem(e).disabled = true;
			
			this.Elem(e).value = -1;
		});
		
		if (elements.indexOf('sValue') == -1) return;
		
		this.metadata = null;
		
		this.ResetFilter();
	}
	
	OnRequests_Error (error) {
		debugger;
	}
	
	Template() {
		return "<div handle='overlay' class='overlay selector'>" +
				  "<div class='overlay-header'>" +
					  "<h2 class='overlay-title' handle='title'>nls(Selector_Title)</h2>" +
					  "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
				  "</div>" +
				  "<hr>" +
				  "<div class='overlay-body' handle='body'>" + 
					  "<label class='sm-label'>nls(Selector_Subject)</label>" + 
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
					  "</div>" +
				  "</div>" +
			   "</div>";
	}
})