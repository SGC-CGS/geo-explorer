import Templated from '../../geo-explorer-api/components/templated.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';
import Net from "../../geo-explorer-api/tools/net.js";

/**
 * SimpleTable widget module
 * @module widgets/SimpleTable
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.SimpleTable", class Table extends Templated {
	
	/**
	 * Get/set table headers
	 */
	get headers() { return this._headers; }
	
	set headers(value) {
		this._headers = value; 

        var headerRow = Dom.Create("tr", { className: "table-row" }, this.Elem("body"));
		
		this._headers.forEach(h => {
            Dom.Create("td", { innerHTML: h.label[Core.locale] }, headerRow);
        });
		
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
	 */
	Clear() {
        Dom.Empty(this.Elem('body'));
        Dom.RemoveCss(this.container, 'hidden');
		
		this.UpdateTableVisibility();
    }
    
	/**
	 * Update the table content with the datapoints 
	 * @param {object} datapoints - Selected locations from map
	 */
    Populate(datapoints, data, codesets) {
        this._tableData = [];

        datapoints.forEach(dp => {
            var tr = {};
			
			// REVIEW: Don't know if we need to show everything, we'll see what the group says.
            tr.code = dp.code;
            tr.id = dp.id;
            tr.name = Core.locale == "en" ? dp.nameEn : dp.nameFr;
            tr.terminated = dp.terminated;
            tr.type = dp.type;
            tr.vintage = dp.vintage;

            tr.date = "";
            tr.decimals = "";
            tr.frequency = "";
            tr.release = "";
            tr.scalar = "";
            tr.security = "";
            tr.status = "";
            tr.symbol = "";
            tr.value = "";
            tr.uom = "";

            var dataobj = data[dp.code];

            if (dataobj && dataobj.value) {
                tr.date = dataobj.date;
                tr.decimals = dataobj.decimals;
                tr.value = dataobj.value;
                tr.release = dataobj.release;

                // Decode the values using codesets
				tr.frequency = codesets.frequency(dataobj.frequency) || "";
                tr.scalar = codesets.scalar(dataobj.scalar) || "";
                tr.security = codesets.security(dataobj.security) || "";
                tr.status = codesets.status(dataobj.status) || "";
                tr.symbol = codesets.symbol(dataobj.symbol) || "";
                tr.uom = codesets.uom(dataobj.uom) || "";
            }
                
            this._tableData.push(tr);
        });

        this._tableData.forEach(r => {
            var tr = Dom.Create("tr", { className:"table-row" }, this.Elem("body"));
			
            this.headers.forEach(f => {				
                Dom.Create("td", { className: "table-cell", innerHTML: r[f.id] }, tr);
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
	Template() {
		return "<div class='table-widget'>" +
				  "<div handle='table' class='table-container hidden'>" + 
					 "<table>" +				        
                        "<tbody handle='body'></tbody>" +
				     "</table>" + 
			      "</div>" + 
			   "</div>"
	}
})