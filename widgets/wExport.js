import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from "../../geo-explorer-api/tools/core.js";
import Select from '../../geo-explorer-api/ui/select.js';

/**
 * Export widget module
 * @module widgets/Export
 * @extends Widget
 */

export default Core.Templatable("App.Widgets.Export", class Export extends Widget { 
    /** 
	 * Get the widgets title
	*/	
	get title() { return this.Nls("Export_Title"); }

    /**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Export_Title", "en", "Export Content");
		nls.Add("Export_Title", "fr", "Exporter le Contenu");
        nls.Add("Export_Map", "en", "Map (PDF)");
		nls.Add("Export_Map", "fr", "Carte (PDF)");
        nls.Add("Export_Map_Layout", "en", "Select Layout");
		nls.Add("Export_Map_Layout", "fr", "Sélectionner une mise en page");
        nls.Add("Export_Map_MapScale", "en", "Map Scale");
		nls.Add("Export_Map_MapScale", "fr", "Échelle de la carte");
        nls.Add("Export_Table", "en", "Table (CSV)");
		nls.Add("Export_Table", "fr", "Tableau (CSV)");
        nls.Add("Export_Layer", "en", "Vector Data");
		nls.Add("Export_Layer", "fr", "Données vectorielles");
        nls.Add("Export_Layer_Type", "en", "Format");
		nls.Add("Export_Layer_Type", "fr", "Format");
        nls.Add("Export_Button_Export", "en", "Export");
		nls.Add("Export_Button_Export", "fr", "Exportation");		
		nls.Add("Export_Button_Close", "en", "Cancel");
		nls.Add("Export_Button_Close", "fr", "Annuler");
	}

    /**
	 * Set up Export widget
	 * @param {object} container - div container and properties
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);

        this.sliders = [
            {toggled: false, selectors: [
                this.Elem('sLayout'),
                this.Elem('sMapScale')
            ]},
            {toggled: false, selectors: []},
            {toggled: false, selectors: [
                this.Elem('sLayer')
            ]},

        ];

        this.SetupMapSelectors();

        this.SetupLayerSelectors();

        this.EnableToggles();

        this.Node("bExport").On("click", this.OnExport_Click.bind(this));
	}

    /**
     * Set up selectors for printing the PDF map
     * @returns {void}
     */
    SetupMapSelectors() {
        let layoutItems = [
            {label: "Landscape 11 x 7", description: null},
            {label: "Landscape 8.5 x 11", description: null}
        ];

        let mapScaleItems = [
            {label: "1:30,000", description: null},
            {label: "1:100,000", description: null}
        ];
        
        this.LoadDropDown(this.Elem('sLayout'), layoutItems);
        this.LoadDropDown(this.Elem('sMapScale'), mapScaleItems);

        this.Elem('sLayout').roots[0].style.padding = 0; 
        this.Elem('sLayout').roots[0].style.verticalAlign = "text-top";
        this.Elem('sMapScale').roots[0].style.padding = 0; 
        this.Elem('sMapScale').roots[0].style.verticalAlign = "text-top";
    }

    /**
     * Set up selectors for saving the vector data
     * @returns {void}
     */
    SetupLayerSelectors() {
        let layerItems = [
            {label: "GeoJSON", description: null},
            {label: "Shapefile", description: null}
        ];

        this.LoadDropDown(this.Elem('sLayer'), layerItems);

        this.Elem('sLayer').roots[0].style.padding = 0; 
        this.Elem('sLayer').roots[0].style.verticalAlign = "text-top";
    }

    /**
	 * Load select element with list of items and enable
	 * @param {object} select - Select element
	 * @param {Object[]} items - List of objects with ids and labels to be added to select element
	 * @returns {void}
	 */
	LoadDropDown(select, items) {
		items.forEach(item => select.Add(item.label, item.description, item));
	}

    /**
     * Make the toggles interactive 
     * @returns {void}
     */
    EnableToggles() {
        for (let index = 0; index < this.sliders.length; index++) {
            this.Elem(`dropdownBtn${index}`).addEventListener("click", function (ev) {
                if (this.Elem(`content${index}`)) this.Elem(`content${index}`).classList.toggle("active");

                if (ev.target.className == "collapsedToggle") {
                    ev.target.className = "expandedToggle";
                    this.sliders[index].toggled = true;
                }else {
                    ev.target.className = "collapsedToggle";
                    this.sliders[index].toggled = false;
                };
            }.bind(this));
        }
    }

    /**
	 * Check which content should be exported and their selections (if any)
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
    OnExport_Click(ev) {
        this.sliders.forEach(s => {
            if (s.toggled == true) {
                for (let index = 0; index < s.selectors.length; index++) {
                    console.log(s.selectors[index].selected);
                }
            }
        })
    }

    /**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
     HTML() {
        return "<div handle='toggle0' class='toggleCollapse active'>nls(Export_Map)" +
					"<i title='toggle map' handle='dropdownBtn0' class='collapsedToggle'></i>" +
				"</div>" +

				"<div handle='content0' class='content'>" +
                    "<label style='display: inline;'>nls(Export_Map_Layout)" +
                        "<div handle='sLayout' widget='Api.Components.Select' style='display: inline; margin-left: 15px;'></div>" +
                    "</label>" +

                    "<div style='margin-bottom: 15px;'></div>"+

                    "<label style='display: inline;'>nls(Export_Map_MapScale)" +
                        "<div handle='sMapScale' widget='Api.Components.Select' style='display: inline; margin-left: 15px;'></div>" +
                    "</label>" +
                "</div>" +

                "<div handle='toggle1' class='toggleCollapse active'>nls(Export_Table)" +
					"<i title='toggle table' handle='dropdownBtn1' class='collapsedToggle'></i>" +
				"</div>" +

                "<div handle='toggle2' class='toggleCollapse active'>nls(Export_Layer)" +
					"<i title='toggle table' handle='dropdownBtn2' class='collapsedToggle'></i>" +
				"</div>" +

                "<div handle='content2' class='content'>" +
                    "<label style='display: inline;'>nls(Export_Layer_Type)" +
                        "<div handle='sLayer' widget='Api.Components.Select' style='display: inline; margin-left: 15px;'></div>" +
                    "</label>" +
                "</div>" +

                "<div class='button-container'>" +
                    "<button handle='bExport' class='button-label button-apply'>nls(Export_Button_Export)</button>" +
                "</div>";
      }
})