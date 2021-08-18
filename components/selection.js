import Evented from "../../geo-explorer-api/components/base/evented.js";

/**
 * Selection module
 * @module components/selection
 * @description 
 */
export default class Selection extends Evented { 
    /**
     * Get / set the highlight handler for a graphic
     */
    get highlight() { return this._highlight; }

    set highlight(value) { this._highlight = value; }

    /**
     * Get / set the layerView that is in the map view
     */
    get layerView() { return this._layerView; }

    set layerView(value) { this._layerView = value; }

    /**
     * Get / set the graphic in a layerView 
     */
    get graphic() { return this._graphic; }

    set graphic(value) { this._graphic = value; }
        
        
    /**
     * Get / set the map behavior object
     */
    get mapBehavior() { return this._mapBehavior; }

    set mapBehavior(value) { this._mapBehavior = value; }


    /**
     * Highlight the graphic in the layerView
     * @param {*} graphic - Vector object that may contain geometry, a symbol, and attributes
     */
    HighlightGraphic(graphic) {
        this.highlight = this.layerView.highlight(graphic);
    }

    /**
     * Highlight specific graphics in a layerView
     * @param {*} target - The name of the graphic(s) to be highlighted
     * @param {*} title - The attribute name to assist with getting the graphic title
     */
    HighlightTargetGraphic(target, title) {
        // Highlight a feature that matches the chart element being hovered
		this.layerView.graphicsView.graphics.items.forEach(graphic => {
			if (graphic.attributes[title] == target) {
				this.HighlightGraphic(graphic);
			}
		})
    }

    /**
     * Remove highlight from graphic(s)
     */
    ClearGraphicHighlight() {
        this.highlight.remove();
        this.highlight = null;
    }

    /**
     * Remove highlight from graphic(s), restore chart element opacity, 
     * and close the popup
     * @param {*} popup - esri popup widget that shows content from the graphic's attributes 
     */
    ClearAll(popup) {
        if (this.graphic && this.highlight) {
            this.ClearGraphicHighlight();
            this.Emit("ClearChartElementHighlight", {});
            popup.close();
        }
    } 

    /**
     * 
     * @param {any} mapView
     * @param {any} infoPopup
     * @param {any} mapPopup
     */
    HandleMapViewEvents(mapView, infoPopup, mapPopup) {
        mapView.on("layerViewCreated", (ev) => {
            this.layerView = ev.layerView;
        });

        // When exiting the map view, remove all highlights and close the popup 
        mapView.on("PointerLeave", (ev) => {
            this.ClearAll(mapPopup);
        });

        mapView.on("PointerMove", (ev) => {
            ev.response.screenPoint.y -= 10;
            this.layerView = ev.layerView;

            // The selected graphic has changed and there is a highlight on the previous graphic
            if (this.graphic != ev.graphic && this.highlight) {
                this.ClearGraphicHighlight();
                this.Emit("ClearChartElementHighlight", {});                
            }
            // The selected graphic has changed
            else if (this.graphic != ev.graphic) {
                this.graphic = ev.graphic;
                this.HighlightGraphic(this.graphic);
                this.Emit("HighlightChartElement", { graphic: this.graphic });
                
                infoPopup.Show(mapView.toMap(ev.response.screenPoint), this.graphic);
            }
            // Update the popup position if the current graphic is highlighted
            else if (this.highlight) {
                mapView.popup.location = mapView.toMap(ev.response.screenPoint);
            }
            // The current graphic is not highlighted
            else if (!this.highlight) {
                this.HighlightGraphic(this.graphic);
                this.Emit("HighlightChartElement", { graphic: this.graphic });

                infoPopup.Show(mapView.toMap(ev.response.screenPoint), this.graphic);
            }
        });             
    }

    HandleChartEvents(toolbar, infoPopup, chart, context) {
        chart.chart.On('Change', ev => {
            if (this.highlight || ev.hovered == null) {
                this.ClearGraphicHighlight();
                return;
            }

            this.HighlightTargetGraphic(ev.hovered, chart.config.field);
        });   

        this.mapBehavior.On('Change', ev => {
            this.Emit("UpdateSelection", { data: ev.selection });

            // REVIEW: I don't like passing the toolbar and infoPopup widgets from application to selection to chart. 
            // Need to think about it.
            this.Emit("UpdateChartTool", { selection: ev.selection, infoPopup: infoPopup, toolbar: toolbar, context: context });

        });

    }

    HandleTableRowDeselect(table) {
        table.On("RowDeselectButtonClick", ev => {
            ev.graphic ? this.mapBehavior.layer.remove(ev.graphic) : this.mapBehavior.layer.removeAll();

            this.Emit("UpdateSelection", { data: this.mapBehavior.graphics });            
        });
    }
}