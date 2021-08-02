import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';
import CODR from '../../geo-explorer-api/tools/codr.js';

/**
 * Selector widget module
 * @module widgets/selector
 * @extends Widget
 * @description This class creates indicator selectors to choose the data to be loaded on the map.
 */
export default Core.Templatable("App.Widgets.Selector", class Selector extends Widget {

    /**
     * @description
     * Get coordinates selected 
     */
	get coordinates() { 
		return this.dropdowns.map(dd => (dd.id == "1") ? "*" : dd.value);
	}

    /**
     * @description
     * Get the geo select dropdown 
     */
	get geoSelect() { return this.dropdowns[this.metadata.geoIndex]; }

    /**
     * @description
     * Get the geo level selected 
     */
	get geoLevel() { return this.geoSelect.value; }

    /**
     * @description
     * Set the value of the geo level selected
     * @param {String} value - value
     */
	set geoLevel(value) { this.geoSelect.value = value; }
	
    constructor(container) {
        super(container);
    }

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Dropdowns_Title", "en", "Select indicator to display on the map:");
		nls.Add("Dropdowns_Title", "fr", "Sélectionnez l'indicateur à afficher sur la carte:");		
		nls.Add("UpdateMapBtn_Title", "en", "Update Map");
        nls.Add("UpdateMapBtn_Title", "fr", "Recharger la Carte");	
        nls.Add("AppDescription", "en", "This map will display a thematic map according to the indicator selected. Use the dropdown lists below to select dimension members for each dimensions of the current CODR product. Then, click on the 'update map' button to display the thematic map. A data table at the bottom contains the data shown on the map.");
        nls.Add("AppDescription", "fr", "Cette carte affichera une carte thématique en fonction de l'indicateur sélectionné. Utilisez les listes déroulantes ci-dessous pour sélectionner des membres de dimension pour chaque dimension du produit CODR actuel. Ensuite, cliquez sur le bouton 'mettre à jour la carte' pour afficher la carte thématique. Un tableau de données en bas contient les données affichées sur la carte.");
        nls.Add("Options_Title", "en", "Choose an option for ");
        nls.Add("Options_Title", "fr", "Choisissez une option pour ");
	}

    /**
     * @description
     * Initialize the selectors, create and load dropdowns with options
     * @param {String} metadata - metadata
     */
	Initialize(metadata) {
		this.metadata = metadata; 
		
		this.CreateDropdowns();
        this.LoadGeoDropdown();
		
        this.Elem("dropdowntitle").className = "col-md-12 mrgn-tp-sm";
        this.Elem("submit").className = "btn btn-primary col-md-2 pull-right";
		
        this.Node("submit").On("click", this.OnButtonApply_Click.bind(this));
	}

    /**
     * @description
     * Apply initial indicator selection to the dropdowns if provided through URL parameters
     * @param {String} selected - selected
     */
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

    /**
     * @description
     * Create dropdowns
     */
	CreateDropdowns() {		
        // Loop on dimensions and create the drop down lists
		this.dropdowns = this.metadata.dimensions.map(dimension => {
			var row = Dom.Create("div", { className:"row mrgn-tp-xs" }, this.Elem("dimensions"));
			var label = Dom.Create("label", { innerHTML:dimension.name, htmlFor:dimension.position, className:"col-md-6 mrgn-tp-xs" }, row);
            var select = Dom.Create("select", {
                id: dimension.position,
                className: "col-md-6 mrgn-tp-xs",
                title: this.Nls("Options_Title") + dimension.name.toLowerCase()	
            }, row);
            
			if (dimension.position != "1") {
				// Get unique geo codes from metadata dimensions 			
				dimension.members.forEach(m => Dom.Create("option", { value:m.id, text:m.name }, select));
			};
			
			return select;
		});
	}

    /**
     * @description
     * Load the dropdowns with options from metadata
     */
	LoadGeoDropdown() {
		var items = CODR.GeoLevels(this.metadata);

		if (items.length == 0) return;
	
		items.forEach(m => Dom.Create("option", { value:m.id, text:m.name }, this.geoSelect));
			
		this.geoSelect.value = items[0].id;
		this.metadata.geoLevel = items[0].id;	
		
		this.geoSelect.addEventListener("change", ev => this.metadata.geoLevel = ev.target.value);	
    }

    /**
     * @description
     * Update map button apply callback
     * @param {String} ev - ev
     */
	OnButtonApply_Click(ev) {        
		this.Emit("Change", { coordinates:this.coordinates, geo:this.geoLevel });
	}
        
    HTML() {
        return 	"<h2 handle='dropdowntitle' class='col-md-12 mrgn-tp-sm hidden'>nls(Dropdowns_Title)</h2>" +
                "<div class='text-center'><a href='#' class='wb-inv wb-show-onfocus wb-sl'>nls(AppDescription)</a></div>" +            
				"<div handle='dimensions' class='dimensions'></div>" +
				"<div class='row mrgn-tp-sm'>" +
                "<button handle='submit' type='submit' class='btn btn-primary col-md-2 pull-right hidden' title='nls(UpdateMapBtn_Title)'>" +
                "nls(UpdateMapBtn_Title)</button > " +
				"</div>";
    }
})