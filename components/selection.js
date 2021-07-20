// No way to `esc` from rectangle select 
import SelectBehavior from '../../geo-explorer-api/behaviors/rectangle-select.js';

/**
 * Selection module
 * @module components/selection
 * @description 
 */
export default class Selection { 
    set map(value){ this._map = value; }

    get map() { return this._map; }

    get context() { return this._context; }

    get config() { return this._config; }

    set table(value) { this._table = value; }

    get table() { return this._table; }

    set chart(value) { this._chart = value; }

    get chart() { return this._chart; }

    set behavior(value) { this._behavior = value; }

    get behavior() { return this.map.Behavior("selection"); }

    set hovered(value) { this._hovered = value; }

    get hovered() { return this._hovered; }

    /**
     * 
     * @param {*} map - Map object to which the behavior will be applied
     * @param {*} context - Context object for retrieving the sublayer
     * @param {*} config - Configuration data
     */
    constructor() {
        // map.view.highlightOptions.color = [255,255,0, 1];
        console.log("selection")

    }

    /**
	 * Allows two-way sync between map and chart where when you hover over one, the other is highlighted
	 * {@link https://developers.arcgis.com/javascript/latest/sample-code/view-hittest/|ArcGIS API for JavaScript}
	 * @param {*} behavior - Behavior on the map object
	 */
     EnableHitTest() {
        this.currentTitle = "";
        this.highlight = null;
        this.currentChartElement = null; 

        this.map.view.whenLayerView(this.behavior.layer).then(layerView => { 
            this.layerView = layerView;
            
            this.map.view.on("pointer-move", ev => {				
				this.map.view.hitTest(ev).then((response, ev) => {
                    if (response.results.length && this.behavior.drawComplete == true){ 
                        let graphic = response.results[0].graphic;
                        //this.OnFeatureSelection(response);
                        return;
                    } 
                    // Remove the highlight if no features are returned from the hitTest
                    // else if (this.highlight) {
                    //     this.highlight.remove();
                    //     this.highlight = null;
                    //     d3.select(this.currentChartElement).style("opacity", 1);
                    //     this.map.popup.close();
                    // }
                })
            })
        })
    }

    OnFeatureSelection(response) {
        let p = this.config.popup;

        let graphic = response.results[0].graphic;
        let title = graphic.attributes[p.title];

        // REVIEW: This should only be called once on hover (enter, over, exit)
        // Sometimes the popup appears blank briefly 
        this.ShowInfoPopup(this.map.view.toMap(response.screenPoint), graphic);

        if (this.highlight && this.currentTitle != title) {
            this.highlight.remove();
            this.highlight = null;
            d3.select(this.currentChartElement).style("opacity", 1);
            this.map.popup.close()
            return;
        }

        if (this.highlight) { return; }

        this.highlight = this.layerView.highlight(graphic);
        this.currentTitle = title;

        let chartDataType = this.chart.chart.chartDataType;
        let chartData = this.chart.chart.g.selectAll(chartDataType).data();

        chartData.forEach((c, i) => {
            if(c.label == title) {
                this.currentChartElement = this.chart.chart.g.selectAll(chartDataType).nodes()[i];
                // QuerySelect instead (doesn't seem to work though)
                d3.select(this.currentChartElement).style("opacity", 0.5);
            }
        });
    }

    /**
     * 
     * @returns {void}
     */
    OnChartElementSelection() {
        if (this.highlight && this.currentTitle != this.hovered) {
            this.highlight.remove();
            this.highlight = null;
            return;
        }

        if (this.highlight) return; 

        // Highlight a feature that matches the chart element being hovered
        this.layerView.queryGraphics().then(results => {
            results.items.forEach(r => {
                if(r.attributes[this.config.popup.title] == this.hovered) {
                    this.highlight = this.layerView.highlight(r);
                    this.currentTitle = this.hovered;
                }
            })
        });
    }

	/**
	 * Show the popup for the selected map point.
	 * @param {object} mapPoint - Object containing the coordinates of the selected map point
	 * @param {object} f - Layer containing the attributes of the selected polygon
	 * @returns {void}
	 */
    ShowInfoPopup(mapPoint, f) {
        var p = this.config.popup;
		var uom = f.attributes[p.uom];
		var value = f.attributes[p.value]
		var symbol = f.attributes[p.symbol];
		var indicators = this.context.IndicatorItems().map(f => `<li>${f.label}</li>`).join("");
		var nulldesc = f.attributes[p.nulldesc] || '';
		
		// prevent F from displaying twice
		symbol = symbol && value != "F" ? symbol : ''; 
        
        // Getting the url can be done once per table

		this.url, this.link = ``, this.prod = this.context.category.toString();
		
		if (this.prod.length == 8) {
			this.url = this.config.tableviewer.url + this.context.category + "01";
			this.prod = this.prod.replace(/(\d{2})(\d{2})(\d{4})/, "$1-$2-$3-01");
			this.link = this.Nls('Table_Label_Popup_Link', [this.url, this.prod]);
		}
		
		var content = `<b>${uom}</b>: ${value}<sup>${symbol}</sup>` + 
					  `<br><br>` + 
					  `<div><b>${this.Nls("Indicator_Title_Popup")}</b>:` +
						 `<ul>${indicators}</ul>` +
						 `${this.link}` +
					  `</div>` + 
					  `<br>` +
					  `<sup>${symbol}</sup> ${nulldesc}`;

		this.map.popup.open({ location:mapPoint, title:f.attributes[p.title], content:content });
    }
}