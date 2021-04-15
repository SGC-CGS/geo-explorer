import Overlay from "./overlay.js";
import Core from "../tools/core.js";
import BarChart from "../charts/barChart.js";
import PieChart from "../charts/pieChart.js";
import LineChart from "../charts/lineChart.js";
import ScatterPlot from "../charts/scatterPlot.js";


/**
 * @description
 * Chart widget where a chart is selected and
 * built onto the UI
 * @todo Handle product changes in Application.js?
 */
export default Core.Templatable(
  "App.Widgets.WChart",
  class WChart extends Overlay {
    set Title(value) {
      this._title = value;
    }

    get Title() {
      return this._title;
    }

    set data(value) {
      let values = value.items;

      this._data = [];

      for (let index = 0; index < values.length; index++) {
        let element = values[index];

        this._data.push({
          title: element["attributes"][this._title],
          value: element["attributes"]["Value"],
        });
      }

      this.DrawChart();
    }

    get data() {
      return this._data || [];
    }

    constructor(container, options) {
      super(container, options);

      this.chart = null;

      this.chartType = null;

      this.BuildChart()
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

      // Update this later
      let chartType = this.chartType || null;

      // Bar Chart by default
      if ((!chartType) || (chartType == "BarChart")) {
          this.chart = new BarChart({
            data: this.data,
            element: element,
          });
      } else if (chartType == "PieChart") {
          this.chart = new PieChart({
            data: this.data,
            element: element
          });
      } else if (chartType == "LineChart") {
          this.chart = new LineChart({
            data: this.data,
            element: element
          });
      } else if (chartType == "ScatterPlot") {
          this.chart = new ScatterPlot({
            data: this.data,
            element: element
          });
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
    DrawChart() {
      if (this.data.length == 0) {
        this.HideChart();
      } else {
        this.ShowChart();
        this.chart.options.data = this.data;
        this.chart.Redraw();
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
      return (
        "<div class='overlay-header'>" +
          "<h2 class='overlay-title' handle='title'>nls(Chart_Title)</h2>" +
          "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
        "</div>" +
        "<hr>" +
        "<div class='overlay-body' handle='body'>" +
          "<label class='sm-label'>nls(Chart_Type)</label>" +
        "<div id='ChartsContainer' handle='ChartsContainer' width='430' height='400'></div>"
      );
    }
  }
);
