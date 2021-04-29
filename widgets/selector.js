import Templated from '../../geo-explorer/components/templated.js';
import Core from '../../geo-explorer/tools/core.js';
import Dom from '../../geo-explorer/tools/dom.js';
import CODR from '../../geo-explorer/tools/codr.js';

export default Core.Templatable("App.Widgets.Selector", class Selector extends Templated {

	get coordinates() { 
		return this.dropdowns.map(dd => (dd.id == "1") ? "*" : dd.value);
	}
	
	get geoSelect() { return this.dropdowns[this.metadata.geoIndex]; }
	
	get geoLevel() { return this.geoSelect.value; }
	
	set geoLevel(value) { this.geoSelect.value = value; }

	static Nls(nls) {
		nls.Add("Dropdowns_Title", "en", "Select indicator to display on the map:");
		nls.Add("Dropdowns_Title", "fr", "Sélectionnez l'indicateur à afficher sur la carte:");		
		nls.Add("UpdateMapBtn_Title", "en", "Update Map");
		nls.Add("UpdateMapBtn_Title", "fr", "Recharger la Carte");		
	}
	
    constructor(container, options) {
        super(container, options);
    }
	
	Initialize(metadata) {
		this.metadata = metadata; 
		
		this.CreateDropdowns();
        this.LoadGeoDropdown();
		
        this.Elem("dropdowntitle").className = "col-md-12 mrgn-tp-sm";
        this.Elem("submit").className = "btn btn-primary col-md-2 pull-right";
		
        this.Node("submit").On("click", this.OnButtonApply_Click.bind(this));
	}

    ApplyInitialSelection(selected) {
        // Parse this.config.initialSelection - something like &selected=[1,4,4,2,6]        
        var initial = JSON.parse(selected);
		var error = null;
		
        if (!initial) error = "Invalid selected URL parameter.";
		
        // Validate the length of that array with the number of dropdowns and show an error message if it mismatches
        if (initial.length != this.dropdowns.length) {
			error = "Mismatch between initial selection length and dimensions available for pid.";
		}

		if (!error) {
			initial.forEach((s, i) => {
				this.dropdowns[i].value = s;  
				
				if (this.dropdowns[i].value == "") {
					// The value of j is not one of the options available
					error = "Invalid value for initial selection of option #" + (i + 1);
				}
			});
		}

		if (error) this.OnApplication_Error(new Error(error));
		
		else this.OnButtonApply_Click(null);
    }
	
	CreateDropdowns() {		
        // Loop on dimensions and create the drop down lists
		this.dropdowns = this.metadata.dimensions.map(dimension => {
			var row = Dom.Create("div", { className:"row mrgn-tp-xs" }, this.Elem("dimensions"));
			var label = Dom.Create("label", { innerHTML:dimension.name, htmlFor:dimension.position, className:"col-md-6 mrgn-tp-xs" }, row);
            var select = Dom.Create("select", { id:dimension.position, name:dimension.position, className:"col-md-6 mrgn-tp-xs" }, row);
            
			if (dimension.position != "1") {
				// Get unique geo codes from metadata dimensions 			
				dimension.members.forEach(m => Dom.Create("option", { value:m.id, text:m.name }, select));
			};
			
			return select;
		});
	}
	
	LoadGeoDropdown() {
		var items = CODR.GeoLevels(this.metadata);

		if (items.length == 0) return;
	
		items.forEach(m => Dom.Create("option", { value:m.id, text:m.name }, this.geoSelect));
			
		this.geoSelect.value = items[0].id;
		this.metadata.geoLevel = items[0].id;	
		
		this.geoSelect.addEventListener("change", ev => this.metadata.geoLevel = ev.target.value);	
    }
	
	OnButtonApply_Click(ev) {        
		this.Emit("Change", { coordinates:this.coordinates, geo:this.geoLevel });
	}
        
    Template() {
        return 	"<h2 handle='dropdowntitle' class='col-md-12 mrgn-tp-sm hidden'>nls(Dropdowns_Title)</h2>" +
				"<div handle='dimensions' class='dimensions'></div>" +
				"<div class='row mrgn-tp-sm'>" +
					"<button handle='submit' type='submit' class='btn btn-primary col-md-2 pull-right hidden'>nls(UpdateMapBtn_Title)</button>" +
				"</div>";
    }
})