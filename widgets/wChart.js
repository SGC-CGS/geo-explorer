import Overlay from "./overlay.js";
import Core from "../tools/core.js";
import BarChart from "../charts/barChart.js";
import PieChart from "../charts/pieChart.js";
import LineChart from "../charts/lineChart.js";
import ScatterPlot from "../charts/scatterPlot.js";

export default Core.Templatable("App.Widgets.WChart",
  class WChart extends Overlay {

    set Title(value) { this._title = value; }

    get Title() { return this._title; }

    set data(value){
      let values = value.items;

      this._data = [];
      
      for (let index = 0; index < values.length; index++) {

        let element = values[index];

        this._data.push({
          title: element["attributes"][this._title],
          value: element["attributes"]["Value"],
        });

      }

      this.BuildChart();
    }
    
    get data(){
      return this._data;
    }

    constructor(container, options) {
      super(container, options);

      this.chart = null;
    }

    BuildChart() {
      // If the chart has already been made
      if (this.chart) {

        // If no more data, clear the chart from the overlay
        if (this._data.length == 0) {
          this.ClearChart();
        } 
        
        // If the chart exists and more data has been added, redraw
        else {
          this.chart.options.data = this._data;
          this.chart.Redraw();
        }

      } 
      
      // Create the chart
      else if (this._data.length != 0) {
        var element = this.Node("ChartsContainer").elem;

        // Uncomment whichever chart you want to see

        this.chart = new BarChart({
          chartType: "BarChart",
          data: this._data,
          element: element
        });

        // this.chart = new PieChart({
        //   chartType: "PieChart",
        //   data: this._data,
        //   element: element
        // });

        // The x-axis labels are numbers in LineChart
        // And strings in BarChart
        // this.chart = new LineChart({
        //   chartType: "LineChart",
        //   data: this._data,
        //   element: element
        // });

        // this.chart = new ScatterPlot({
        //   chartType: "ScatterPlot",
        //   data: this._data,
        //   element: element
        // });
      }
    }

    ClearChart() {
      var svg = d3.select(this.Node("ChartsContainer").elem)
      svg.selectAll("svg").remove();
      this.chart = null
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
            "<div id='ChartsContainer' handle='ChartsContainer' width='430' height='400'></div>" +
          "</div>" +
        "</div>"
      );
    }
  }
);
