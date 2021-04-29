import Templated from '../components/templated.js';
import Core from "../tools/core.js";
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
    set labelField(value) { this._title = value; }

    get labelField() { return this._title; }

    set data(value) {
		var data = value.items.map(item => {		
			return {
				label: item["attributes"][this.labelField],
				value: item["attributes"]["Value"],
			}
		});

		this.DrawChart(data);
    }

	static Nls(nls) {
		nls.Add("Chart_Title", "en", "View chart");
		nls.Add("Chart_Title", "fr", "Type de Diagramme");		
		nls.Add("Chart_Type", "en", "Chart Type");
		nls.Add("Chart_Type", "fr", "Type de Graphique");		
		nls.Add("Chart_Type_Placeholder", "en", "Select a Chart Type");
		nls.Add("Chart_Type_Placeholder", "fr", "Sélectionnez un Type de Graphique");	
	}

    constructor(container, options) {
		super(container, options);

		this.chart = null;
		this.chartType = "BarChart";	// default is bar chart

		this.BuildChart();
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
			// Updated
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

    Template() {
      return "<label class='sm-label'>nls(Chart_Type)</label>" +
			 "<div handle='ChartsContainer' width='430' height='400'></div>";
    }
  }
);
