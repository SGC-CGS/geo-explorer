import Templated from '../../geo-explorer-api/components/templated.js';
import Core from "../../geo-explorer-api/tools/core.js";
import BarChart from "../charts/barChart.js";
import PieChart from "../charts/pieChart.js";
import LineChart from "../charts/lineChart.js";
import ScatterPlot from "../charts/scatterPlot.js";


/**
 * Chart widget module
 * @module widgets/wChart
 * @extends Templated
 * @description Chart widget where a chart is selected and
 * built onto the UI
 * @todo Handle product changes in Application.js?
 */
export default Core.Templatable("App.Widgets.WChart", class WChart extends Templated {

	/**
	 * Get/set name of field to use for data label
	 */
    set labelField(value) { this._title = value; }

    get labelField() { return this._title; }

	/**
	 * Set data label and value
	 */
    set data(value) {
		var data = value.items.map(item => {
			let label = item["attributes"][this.labelField];
			let value = item["attributes"]["Value"] == null ? 0 : item["attributes"]["Value"];
			return {
				label: label,
				value: value,
			}
		});

		this.DrawChart(data);
    }

	/**
	 * Add any required text to the Nls object
	 * @param {object} nls - Object for holding nls strings
	 * @returns {void}
	 */
	static Nls(nls) {
		nls.Add("Chart_Title", "en", "View chart");
		nls.Add("Chart_Title", "fr", "Type de Diagramme");		
		nls.Add("Chart_Type", "en", "Chart Type");
		nls.Add("Chart_Type", "fr", "Type de Graphique");		
		nls.Add("Chart_Type_Placeholder", "en", "Select a Chart Type");
		nls.Add("Chart_Type_Placeholder", "fr", "Sélectionnez un Type de Graphique");	
	}

	/**
	 * Set up chart widget
	 * @param {object} container - Div chart container and properties
	 * @param {object} options - Any additional options to assign to the widget
	 * @returns {void}
	 */
    constructor(container, options) {
		super(container, options);

		this.chart = null;
		this.chartType = "BarChart";	// default is bar chart

		this.BuildChart();
    }

    /**
     * Create chart based on chart type selection.
	 * @returns {void}
     * @todo Chart type selection based on JSON.
     */
    BuildChart() {
		// Chart container element
		let element = this.Node("ChartsContainer").elem;

		// Bar Chart by default
		if (this.chartType == "BarChart") {
			this.chart = new BarChart({ element:element });
		} 
		
		else if (this.chartType == "PieChart") {
		  this.chart = new PieChart({ element:element });
		} 
		
		else if (this.chartType == "LineChart") {
		  this.chart = new LineChart({ element:element });
		} 
		
		else if (this.chartType == "ScatterPlot") {
		  this.chart = new ScatterPlot({ element:element });
		}
		
		// No data is in the chart yet so hide the SVG
		this.HideChart();
    }

    /**
     * Update data on the chart, or hide the chart if there is no data.
	 * @param {object[]} data - Array of objects containing data values and labels
	 * @returns {void}
     * @todo Change name of Redraw()?
     */
    DrawChart(data) {
		if (data.length == 0) this.HideChart();

		else {
			this.ShowChart();
			this.chart.data = data;
			// Updated
			this.chart.Draw();
		}
    }

	/**
	 * Hide the svg elements in the chart container
	 * @returns {void}
	 */
    HideChart(){
		d3.select(this.Node("ChartsContainer").elem)
		  .selectAll("svg")
		  .attr("visibility", "hidden");
    }

	/**
	 * Show the svg elements in the chart container
	 * @returns {void}
	 */	
    ShowChart(){
		d3.select(this.Node("ChartsContainer").elem)
		  .selectAll("svg")
		  .attr("visibility", "visible");
    }

    /**
     * Removes the SVG from the charts container and destroys current chart 
	 * @returns {void}
     */
    ClearChart() {
		var elem = d3.select(this.Node("ChartsContainer").elem);
		
		elem.selectAll("svg").remove();
		
		this.chart = null;
    }

	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
    Template() {
      return "<div handle='ChartsContainer' width='430' height='400'></div>";
    }
  }
);
