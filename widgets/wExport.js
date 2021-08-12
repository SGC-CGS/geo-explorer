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
            {selectors: [
                this.Elem('sLayout'),
                this.Elem('sMapScale')
            ]},
            {selectors: []},
            {selectors: [
                this.Elem('sLayer')
            ]}
        ];

        this.SetupMapSelectors();

        this.SetupLayerSelectors();

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
	 * Check which content should be exported and their selections (if any)
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
    OnExport_Click(ev) {
        let value, radios = this.container.firstElementChild.getElementsByTagName('input');
        for (var index = 0; index < radios.length; index++) {
            if (radios[index].checked) {
                // The selected radio button
                value = radios[index].value;
                //console.log(this.sliders[value].selectors)
            }
        }
    }

    /**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
     HTML() {
        return "<form handle='exportForm' name='exportForm'>" +
                    "<div><input type='radio' id='radio0' name='radios' value='0' checked>" +
                    "<label class='exportLabel'>nls(Export_Map)</label>" +

                    "<div class='content active'>" +
                            "<label class='subLabel'>nls(Export_Map_Layout)" +
                                "<div handle='sLayout' widget='Api.Components.Select' style='display: inline; margin-left: 15px;'></div>" +
                            "</label>" +

                            "<div style='margin-bottom: 15px;'></div>"+

                            "<label class='subLabel'>nls(Export_Map_MapScale)" +
                                "<div handle='sMapScale' widget='Api.Components.Select' style='display: inline; margin-left: 15px;'></div>" +
                            "</label>" +
                        "</div>" +
                    "</div>" +

                    "<div style='margin-bottom: 15px;'></div>"+

                    "<div><input type='radio' id='radio1' name='radios' value='1'>" +
                    "<label class='exportLabel'>nls(Export_Table)</label>" +
                    "</div>" +

                    "<div style='margin-bottom: 15px;'></div>"+

                    "<div><input type='radio' id='radio2' name='radios' value='2'>" +
                    "<label class='exportLabel'>nls(Export_Layer)</label>" +
                    "</div>"+

                    "<div class='content active'>" +
                        "<label class='subLabel'>nls(Export_Layer_Type)" +
                            "<div handle='sLayer' widget='Api.Components.Select' style='display: inline; margin-left: 15px;'></div>" +
                        "</label>" +
                    "</div>" +
                "</form>" +

                "<div class='button-container'>" +
                    "<button handle='bExport' class='button-label button-apply'>nls(Export_Button_Export)</button>" +
                "</div>";
      }
})