import Overlay from "./overlay.js";
import Core from "../tools/core.js";
import Dom from "../tools/dom.js";
import Requests from "../tools/requests.js";
import BarChart from "../charts/barChart.js";
import PieChart from "../charts/pieChart.js";
import LineChart from "../charts/lineChart.js";
import ScatterPlot from "../charts/scatterPlot.js";

export default Core.Templatable("App.Widgets.WChart",
  class WChart extends Overlay {

    set data(value){
      this.PopulateDataArray(value);
    }
    
    get data(){
      return this._data;
    }

    constructor(container, options) {
      super(container, options);
      this.metadata = null;
      this.chart = null;
      // Will be based on SME decision
      this.chartType = null;
    }

    PopulateDataArray(value) {
      let title = Core.Nls("DisplayNameLong");

      this._data = [];
      
      for (let index = 0; index < value.length; index++) {

        let element = value[index];

        this._data.push({
          title: element["attributes"][title],
          value: element["attributes"]["Value"],
        });

      }

      this.Chart();
    }

    Chart() {
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
      else {
        var element = this.Node("ChartsContainer").elem;

        // Uncomment whichever chart you want to see

        // TODO: Define chart type in constructor instead?

        // TODO: Prevent user from selecting too much (or hide x axis labels)
        // this.chart = new BarChart({
        //   chartType: "BarChart",
        //   data: this._data,
        //   element: element
        // });

        // TODO: Add new square DIV for legend with label and multiline 
        // https://www150.statcan.gc.ca/n1/pub/71-607-x/71-607-x2018012-eng.htm
        // this.chart = new PieChart({
        //   chartType: "PieChart",
        //   data: this._data,
        //   element: element
        // });

        // TODO: Add red line tooltip instead of hover
        // https://www150.statcan.gc.ca/n1/pub/71-607-x/71-607-x2017003-eng.htm
        // The x-axis labels are numbers
        // this.chart = new LineChart({
        //   chartType: "LineChart",
        //   data: this._data,
        //   element: element
        // });

        // Need better data for testing of LineChart and 
        // ScatterPlot
        this.chart = new ScatterPlot({
          chartType: "ScatterPlot",
          data: this._data,
          element: element
        });
      }
    }

    ClearChart() {
      var svg = d3.select(this.Node("ChartsContainer").elem)
      svg.selectAll("svg").remove();
      this.chart = null
    } 

    OnRequests_Error(error) {
      this.Emit("Error", { error: error });
    }

    Template() {
      return (
        "<div class='overlay-header'>" +

          "<h2 class='overlay-title' handle='title'>nls(Chart_Title)</h2>" +
          "<button class='overlay-close' handle='close' title='nls(Overlay_Close)'>×</button>" +
          "</div>" +

          "<hr>" +

          "<div class='overlay-body' handle='body'>" +
            //"<label class='sm-label'>nls(Chart_Type)</label>" +
            "<div id='ChartsContainer' handle='ChartsContainer' width='430' height='400'></div>" +
          "</div>" +
        "</div>"
      );
    }
  }
);
