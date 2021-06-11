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
     * @description
     * Add the needed language texts
     */
    static Nls(nls) {
        nls.Add("PreviousBtn_Title", "en", "Previous");
        nls.Add("PreviousBtn_Title", "fr", "Précédente");
        nls.Add("NextBtn_Title", "en", "Next");
        nls.Add("NextBtn_Title", "fr", "Suivante");    
        nls.Add("PagesLabel_Title", "en", "Page {0} of {1}");
        nls.Add("PagesLabel_Title", "fr", "Page {0} sur {1}");    

        // Column headers
        nls.Add("ColHeader_code", "en", "DGUID");
        nls.Add("ColHeader_code", "fr", "IDUGD");
        nls.Add("ColHeader_name", "en", "Geography Name");
        nls.Add("ColHeader_name", "fr", "Nom de la géographie");
        nls.Add("ColHeader_vintage", "en", "Geography Vintage");
        nls.Add("ColHeader_vintage", "fr", "Vintage de la géographie");
        nls.Add("ColHeader_value", "en", "Value");
        nls.Add("ColHeader_value", "fr", "Valeur");
        nls.Add("ColHeader_date", "en", "Reference Period");
        nls.Add("ColHeader_date", "fr", "Période de référence");
        nls.Add("ColHeader_frequency", "en", "Frequency");
        nls.Add("ColHeader_frequency", "fr", "Fréquence");
        nls.Add("ColHeader_scalar", "en", "Scalar factor");
        nls.Add("ColHeader_scalar", "fr", "Facteur scalaire");
        nls.Add("ColHeader_security", "en", "Security level");
        nls.Add("ColHeader_security", "fr", "Niveau de sécurité");
        nls.Add("ColHeader_status", "en", "Status");
        nls.Add("ColHeader_status", "fr", "Statut");
        nls.Add("ColHeader_symbol", "en", "Symbol");
        nls.Add("ColHeader_symbol", "fr", "Symbole");        
    }

	/**
	 * Call constructor of base class (Templated) and initialize table widget
	 * @param {object} container - div table container and properties
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);
		
        Dom.AddCss(this.container, 'hidden');

        this.Node("previous").On("click", this.OnPreviousButton_Click.bind(this));
        this.Node("next").On("click", this.OnNextButton_Click.bind(this));
	}

	/**
	 * Clears and hides table element
	 */
	Clear() {
        Dom.Empty(this.Elem('body'));
        Dom.RemoveCss(this.container, 'hidden');
		
        this.UpdateTableVisibility();
        this.UpdatePagingVisibility(false);
    }

    /**
     * Create table headers
     * @param {any} value
     */
    CreateHeaders() {

        this._headers = ["code", "name", "vintage", "value", "date",
            "frequency", "scalar", "security", "status", "symbol"];
        
        // It will be the first row in the table body
        // to avoid formatting problems and alighning columns between table header and body
        var headerRow = Dom.Create("tr", { className: "table-row", id: "TableHeader" }, this.Elem("body"));

        this._headers.forEach(h => {
            var label = this.Nls("ColHeader_"+h);
            Dom.Create("td", { innerHTML: label }, headerRow);
        });

    }
    

	/**
	 * Update the table content with the datapoints 
	 * @param {object} datapoints - Selected locations from map
	 */
    Populate(datapoints, data, codesets) {
        this.CreateHeaders();

        this._tableData = [];

        datapoints.forEach(dp => {
            var tr = {};
			
			// REVIEW: Don't know if we need to show everything, we'll see what the group says.
            tr.code = dp.code;
            tr.id = dp.id;
            tr.name = Core.locale == "en" ? dp.nameEn : dp.nameFr;
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
            
            var dataobj = data[dp.code];

            if (dataobj && dataobj.value) {
                tr.date = dataobj.date;
                tr.decimals = dataobj.decimals;
                tr.release = dataobj.release;

                // Localization for value
                tr.value = dataobj.Format(Core.locale);
                
                // Decode the values using codesets
				tr.frequency = codesets.frequency(dataobj.frequency) || "";
                tr.scalar = codesets.scalar(dataobj.scalar) || "";
                tr.security = codesets.security(dataobj.security) || "";
                tr.status = codesets.status(dataobj.status) || "";
                tr.symbol = codesets.symbol(dataobj.symbol) || "";                
            }
                
            this._tableData.push(tr);
        });

        this._tableData.forEach(r => {
            var tr = Dom.Create("tr", { className:"table-row hidden" }, this.Elem("body"));
			
            this._headers.forEach(f => {				
                Dom.Create("td", { className: "table-cell", innerHTML: r[f] }, tr);
			});
        });

        this.UpdateTableVisibility();

        this.SetupPaging(datapoints);
        
    }

    SetupPaging(datapoints) {

        var tableRows = this.Elem("body").childNodes;

        this._rowsPerPage = 5;
        this._numOfPages = 1;
        this._currentPage = 1;

        if (datapoints.length > this._rowsPerPage) {
            // Display the data in pages
            this.UpdatePagingVisibility(true);

            this._numOfPages = Math.ceil(datapoints.length / this._rowsPerPage);

            this.UpdatePagingLabel();
            this.EnableDisablePagingButtons();
            
            for (var i = 1; i <= this._rowsPerPage; i++) {
                // Skip the first row which is the table header (id === "TableHeader")
                // and show the next set of visible rows rows
                Dom.ToggleCss(tableRows[i], 'hidden', false);
            }            
        }
        else {
            this.UpdatePagingVisibility(false);

            tableRows.forEach(r => {
                Dom.ToggleCss(r, 'hidden', false);
            });
        }

        
    }

    /**
     * Handler for clicking on the previous page button
     * @param {any} ev
     */
    OnPreviousButton_Click(ev) {       
        if (this._numOfPages == 1 || this._currentPage == 1) return; // Should never happen

        // Hide visible rows
        this.UpdatePagingRowVisibility(false);

        this._currentPage--;

        this.UpdatePagingLabel();

        // Show the previous/new set of rows
        this.UpdatePagingRowVisibility(true);
                
        this.EnableDisablePagingButtons();
    }

    /**
     * Handler for clicking on the next page button
     * @param {any} ev
     */
    OnNextButton_Click(ev) {
        if (this._numOfPages == 1 || this._currentPage == this._numOfPages) return; // Should never happen

        // Hide visible rows
        this.UpdatePagingRowVisibility(false);

        this._currentPage++;

        this.UpdatePagingLabel();

        // Show the next/new set of rows
        this.UpdatePagingRowVisibility(true);

        this.EnableDisablePagingButtons();
    }

    UpdatePagingRowVisibility(visible) {
        var tableRows = this.Elem("body").childNodes;
        var startIndex = 1;
        if (this._currentPage != 1)
            startIndex = (this._currentPage * this._rowsPerPage) + 1;
        for (var i = startIndex; i <= (startIndex + this._rowsPerPage) && i < tableRows.length; i++) {
            Dom.ToggleCss(tableRows[i], 'hidden', !visible);
        }
    }

    EnableDisablePagingButtons() {
        if (this._currentPage == 1) 
            Dom.ToggleCss(this.Elem("previous"), 'disabled', true);
        else 
            Dom.ToggleCss(this.Elem("previous"), 'disabled', false);
        
        if (this._currentPage == this._numOfPages) 
            Dom.ToggleCss(this.Elem("next"), 'disabled', true);
        else 
            Dom.ToggleCss(this.Elem("next"), 'disabled', false);
        
    }

    UpdatePagingLabel() {
        var subs = [this._currentPage.toString(), this._numOfPages.toString()];
        this.Elem("pagesLabel").innerHTML = this.Nls("PagesLabel_Title", subs);
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
     * Show/Hide Paging controls
     * @param {any} isVisible
     */
    UpdatePagingVisibility(isVisible) {
        Dom.ToggleCss(this.Elem("pagesLabel"), 'hidden', !isVisible);
        Dom.ToggleCss(this.Elem("previous"), 'hidden', !isVisible);
        Dom.ToggleCss(this.Elem("next"), 'hidden', !isVisible);        
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
                     "<div class='row mrgn-tp-sm'>" +
                        "<label handle='pagesLabel' property='name' class='mrgn-tp-sm hidden'></label>" +
                        "<button handle='next' class='btn btn-primary mrgn-tp-sm mrgn-lft-sm col-md-2 pull-right hidden' title='nls(NextBtn_Title)'>" +
                        "nls(NextBtn_Title)</button > " +
                        "<button handle='previous' class='btn btn-primary mrgn-tp-sm col-md-2 pull-right hidden' title='nls(PreviousBtn_Title)'>" +
                        "nls(PreviousBtn_Title)</button > " +                        
                     "</div>"
			      "</div>" + 
			   "</div>"
	}
})