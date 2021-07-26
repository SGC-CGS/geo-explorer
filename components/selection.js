/**
 * Selection module
 * @module components/selection
 * @description 
 */
export default class Selection { 
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
     * Get / set the current chart element of interest
     */
    get chartElement() { return this._chartElement; }

    set chartElement(value) { this._chartElement = value; }

    /**
     * Get / set the graphic in a layerView 
     */
    get graphic() { return this._graphic; }

    set graphic(value) { this._graphic = value; }

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
     * Highlight a chart element. This requires a chart type and ID
     * @param {*} chart - The chart from the chart widget
     * @param {*} title - The attribute name to assist with getting the graphic title
     */
    HighlightChartElement(chart, title) {
        let type = chart.typeOfChartElement;

        // This will only work if the chart you are using has IDs assigned to the chart elements
		this.chartElement = document.querySelector(
                `${type}[id="${this.graphic.attributes[title]}"]`
        );

        this.chartElement.style.opacity = 0.5;
    }

    /**
     * Remove highlight from graphic(s)
     */
    ClearGraphicHighlight() {
        this.highlight.remove();
        this.highlight = null;
    }

    /**
     * Restore the highlighted chart element to its original opacity
     */
    ClearChartElementHighlight() {
        this.chartElement.style.opacity = 1;
    }

    /**
     * Remove highlight from graphic(s), restore chart element opacity, 
     * and close the popup
     * @param {*} popup - esri popup widget that shows content from the graphic's attributes 
     */
    ClearAll(popup) {
        if (this.graphic && this.highlight) {
            this.ClearGraphicHighlight();
            this.ClearChartElementHighlight();
            popup.close();
        }
    } 
}