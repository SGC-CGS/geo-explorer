import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';
import Net from "../../geo-explorer-api/tools/net.js";
import CODR from '../../geo-explorer-api/tools/codr.js';

/**
 * Table widget module
 * @module widgets/Table
 * @extends Widget
 */
export default Core.Templatable("App.Widgets.Table", class Table extends Widget {
	
	/**
	 * Call constructor of base class (Templated) and initialize table widget
	 * @param {object} container - div table container and properties
	 * @returns {void}
	 */
	constructor(...config) {	
		super(...config);
		
	}

	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
    Localize(nls) {
        // Column headers
        nls.Add("ColHeader_code", "en", "<abbr title='Dissemination Geography Unique Identifier'>DGUID</abbr>");
        nls.Add("ColHeader_code", "fr", "<abbr title='Identificateur unique des géographies de diffusion'>IDUGD</abbr>");
        nls.Add("ColHeader_name", "en", "Geography name");
        nls.Add("ColHeader_name", "fr", "Nom de la géographie");
        nls.Add("ColHeader_value", "en", "Value");
        nls.Add("ColHeader_value", "fr", "Valeur");
        nls.Add("ColHeader_date", "en", "Reference Period");
        nls.Add("ColHeader_date", "fr", "Période de référence");
        nls.Add("ColHeader_frequency", "en", "Frequency");
        nls.Add("ColHeader_frequency", "fr", "Fréquence");
        nls.Add("ColHeader_scalar", "en", "Scalar Factor");
        nls.Add("ColHeader_scalar", "fr", "Facteur scalaire");       
    }
	
	/**
	 * Clears and hides table element
	 */
	Clear() {
        Dom.Empty(this.Elem('body'));
        Dom.RemoveCss(this.container, 'hidden');
		
        this.UpdateTableVisibility();
    }

    /**
     * Create table headers
     * @param {any} value
     */
    CreateHeaders() {
        this._headers = ["code", "name", "value", "frequency", "scalar", "date"];

        this._headers.forEach(h => {
            var label = this.Nls("ColHeader_" + h);
            Dom.Create("th", { innerHTML: label, scope: "col" }, this.Elem("header"));
        });
    }

	/**
	 * Update the table content with the datapoints 
	 * @param {object} datapoints - Selected locations from map
	 */
    Populate(metadata, data, codesets) {
        var datapoints = metadata.geoMembers;

        if (this._headers == null) this.CreateHeaders();

        this._tableData = datapoints.map(dp => {
            var d = data[dp.code];
            
            return {
				code : CODR.GetDGUID(metadata.geoLevel, dp.vintage, dp.code),
				id : dp.id,
				name : Core.locale == "en" ? dp.nameEn : dp.nameFr,
				type : dp.type,
				date : d ? d.date : "",
				decimals : d ? d.decimals : "",
				release : d ? d.release : "",
				value : d ? codesets.GetFormattedDP(d, Core.locale) : "",
				frequency : d ? codesets.frequency(d.frequency) || "" : "",
				scalar : d ? codesets.scalar(d.scalar) || "" : ""
			}
        });

        this._tableData.forEach(r => {
            var tr = Dom.Create("tr", { className: "table-row" }, this.Elem("body"));

            this._headers.forEach(f => {
				Dom.Create("td", { className: "table-cell", innerHTML: r[f] }, tr);             
            });           
        });

        this.UpdateTableVisibility();
    }

	/**
	 * Update CSS to toggle table visibility
	 * @returns void
	 */
	UpdateTableVisibility() {
        var isVisible = this.Elem("body").children.length > 0;
        
        Dom.ToggleCss(this.Elem("table"), 'hidden', !isVisible);                
    }
	
	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for table widget
	 */
	HTML() {
		return "<table handle='table' class='table-widget hidden'>" +	
				  "<thead>" +
					  "<tr handle='header'></tr>" +
				  "</thead>" +
				  "<tbody handle='body'></tbody>" +
			   "</table>";
	}
})