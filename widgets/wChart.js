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
	 * Get / set data label, value, and uom
	 */
	get data() { return this._data; }

    set data(value) {
		this._data = value.items.map(item => {
			let label = item["attributes"][this.config.title];
			let value = item["attributes"]["Value"] == null ? 0 : item["attributes"]["Value"];
			let uom = item["attributes"][this.config.uom];
			return {
				label: label,
				value: value,
				uom: uom
			}
		});
		this.DrawChart();
    }

	/**
	 * Get / set the configuration of the chart
	 */
	get config() { return this._config; }

	set config(value) { this._config = value; }

	/**
	 * Get / set the description of the chart 
	 */
	get description() { return this._description; }

	set description(value) { 
		this.Elem("ChartDescription").innerText = value;

		this._description = value; 
	}

	/**
	 * Get / set the chart type
	 */
	get chartType() { return this._chartType; }

	set chartType(value) {
		this.BuildChart(value);

		this._chartType = value;
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
    }

	/**
	 * Create chart based on chart type selection.
	 * @param {*} type - Type of chart to be built
	 * @returns {void}
	 */
    BuildChart(type) {
		let element = this.Elem("ChartsContainer");

		if (type == "PieChart") {
			this.chart = new PieChart({ element: element });
		}

		else if (type == "LineChart") {
			this.chart = new LineChart({ element: element });
		}

		else if (type == "ScatterPlot") {
			this.chart = new ScatterPlot({ element: element });
		}

		else {
			this.chart = new BarChart({ element: element });
		}

		this.HideChart();
    }

    /**
     * Update data on the chart, or hide the chart widget if there is no data.
	 * @param {object[]} data - Array of objects containing data values, labels, and uom
	 * @returns {void}
     */
    DrawChart() {
		if (this.data.length == 0) this.HideChart();

		else {
			this.chart.data = this.data;
			this.chart.Draw();
			this.ShowChart();
		}
    }

	/**
	 * Hide the svg elements in the chart container
	 * @returns {void}
	 */
    HideChart(){
		d3.select(this.Elem("ChartsContainer"))
		  .selectAll("svg")
		  .attr("visibility", "hidden");
    }

	/**
	 * Show the svg elements in the chart container
	 * @returns {void}
	 */	
    ShowChart(){
		d3.select(this.Elem("ChartsContainer"))
		  .selectAll("svg")
		  .attr("visibility", "visible");
    }

    /**
     * Removes the SVG from the charts container and destroys the current chart 
	 * @returns {void}
     */
    ClearChart() {
		var elem = d3.select(this.Elem("ChartsContainer"));
		
		elem.selectAll("svg").remove();
		
		this.chart = null;
    }

	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
    Template() {
      return 	"<div handle='ChartDescription'></div>" +
				"<div handle='ChartsContainer' width='430' height='400'></div>";
    }
  }
);
