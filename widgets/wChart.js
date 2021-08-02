import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from "../../geo-explorer-api/tools/core.js";
import BarChart from "../charts/barChart.js";
import PieChart from "../charts/pieChart.js";
import LineChart from "../charts/lineChart.js";
import ScatterPlot from "../charts/scatterPlot.js";

/**
 * Chart widget module
 * @module widgets/wChart
 * @extends Widget
 * @description Chart widget where a chart is selected and built onto the UI
 * @todo Handle product changes in Application.js?
 */
export default Core.Templatable("App.Widgets.WChart", class WChart extends Widget {

	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Chart_Title") }
	
	set data(value) {
		var data = value.items.map(item => {
			let label = item["attributes"][this.config.field];
			let value = item["attributes"]["Value"] == null ? 0 : item["attributes"]["Value"];
			
			return { label: label, value: value }
		});

		this.DrawChart(data);
    }

    constructor(container) {
		super(container);

		this.chart = null;
		this.chartType = "BarChart";	// default is bar chart

		this.BuildChart();
    }
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Chart_Title", "en", "View chart");
		nls.Add("Chart_Title", "fr", "Type de Diagramme");
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(config) {
		this.config.field = config.field[Core.locale];
	}
	
    /**
     * @description
     * Here the chart is created based on type selection.
     * @todo 
     * Chart type selection based on JSON.
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
     * @description
     * Here the chart can be modified or cleared.
     * @todo
     * Change name of Redraw()?
     */
    DrawChart(data) {
		if (data.length == 0) this.HideChart();

		else {
			this.ShowChart();
			this.chart.data = data;

			this.chart.Draw();
		}
    }

    HideChart(){
		d3.select(this.Node("ChartsContainer").elem)
		  .selectAll("svg")
		  .attr("visibility", "hidden");
    }

    ShowChart(){
		d3.select(this.Node("ChartsContainer").elem)
		  .selectAll("svg")
		  .attr("visibility", "visible");
    }

    /**
     * @description
     * Removes the SVG from the charts container and destroy 
     * the current chart when you want to create a new type of chart.
     */
    ClearChart() {
		var elem = d3.select(this.Node("ChartsContainer").elem);
		
		elem.selectAll("svg").remove();
		
		this.chart = null;
    }

    HTML() {
      return "<div handle='ChartsContainer' width='430' height='400'></div>";
    }
  }
);
