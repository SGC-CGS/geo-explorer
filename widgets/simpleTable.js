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

		// REVIEW: Clean dead code if not used.
        /*
         Other fields we can add to the config file:    
			{
			  "id": "release",
			  "label": {
				"en": "Release",
				"fr": "Release"
			  }
			},
			{
			  "id": "id",
			  "label": {
				"en": "ID",
				"fr": "ID"
			  }
			},
			{
			  "id": "type",
			  "label": {
				"en": "Type",
				"fr": "Type"
			  }
			},    
			{
			  "id": "decimals",
			  "label": {
				"en": "Decimals",
				"fr": "Decimals"
			  }
			},
         */
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

            var dataobj = data[dp.code];

            if (dataobj && dataobj.value) {
                tr.date = dataobj.date;
                tr.decimals = dataobj.decimals;
                tr.value = dataobj.value;
                tr.release = dataobj.release;

                // Decode the values using codesets
				// REVIEW: Use ternary operator or an "or" operator to lighten the code here.
                tr.frequency = codesets.frequency(dataobj.frequency);
                if (tr.frequency == null) tr.frequency = "";
                tr.scalar = codesets.scalar(dataobj.scalar);
                if (tr.scalar == null) tr.scalar = "";
                tr.security = codesets.security(dataobj.security);
                if (tr.security == null) tr.security = "";
                tr.status = codesets.status(dataobj.status);
                if (tr.status == null) tr.status = "";
                tr.symbol = codesets.symbol(dataobj.symbol);
                if (tr.symbol == null) tr.symbol = "";
                tr.uom = codesets.uom(dataobj.uom);
                if (tr.uom == null) tr.uom = "";

            }
			
			// REVIEW: I think it would be clearer if we just assigned empty strings to everything by default, 
			// then overwrite if dataObj exists.
            else {
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