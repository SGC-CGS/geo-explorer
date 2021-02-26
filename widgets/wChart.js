import Overlay from "./overlay.js";
import Core from "../tools/core.js";
import Dom from "../tools/dom.js";
import Requests from "../tools/requests.js";
import BarChart from "../charts/barChart.js";
import PieChart from "../charts/pieChart.js";
import LineChart from "../charts/lineChart.js";


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
      this.chartType = null;

      this.Node("ChartsContainer").On("Change", this.OnSubject_Change.bind(this));
      this.Elem("ChartsContainer").placeholder = Core.Nls("Chart_Type_Placeholder");
    }

    PopulateDataArray(value) {
      this._data = [];
      var title = Core.Nls("DisplayNameLong");
      for (let index = 0; index < value.length; index++) {
        var element = value[index];
        this._data.push({
          // change to label and value
          title: element["attributes"][title],
          value: element["attributes"]["Value"],
        });
      }
      this.Chart();
    }

    Chart() {
      if (this.chart) {
        if (this._data.length == 0) {
          this.ClearExistingSVG();
        } else {
          this.chart.options.data = this._data;
          this.chart.Redraw();
        }
      } else {
        var element = this.Node("ChartsContainer").elem.container;

        // this.chart = new BarChart({
        //   chartType: "BarChart",
        //   data: this._data,
        //   element: element
        // });

        // this.chart = new PieChart({
        //   chartType: "PieChart",
        //   data: this._data,
        //   element: element
        // });

        this.chart = new LineChart({
          chartType: "LineChart",
          data: this._data,
          element: element
        });

      }
    }

    // Do we actually need this?
    Update(context) {
      this.context = context;

      let items = [
        {value: 0, label: "Bar Chart", description: "BC"},
        {value: 1, label: "Pie Chart", description: "PC"}
      ]

      this.LoadDropDown(this.Elem("ChartsContainer"), items);

      this.Elem("ChartsContainer").Select((i) => i.value == context.subject);
    }

    LoadDropDown(select, items) {

      select.Empty();

      items.forEach((item) => select.Add(item.label, item.description, item));

      select.disabled = false;

    }

    OnSubject_Change(ev) {
      this.chartType = ev.target.selected.label;
      if (this.chartType == "Bar Chart") {
        console.log(this.chart)
      } 
      else if (this.chartType == "Pie Chart") {
        console.log(this.chart)
      }
    }

    ClearExistingSVG() {
      var svg = d3.select(this.Node("ChartsContainer").elem.container)
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
            "<label class='sm-label'>nls(Chart_Type)</label>" +
            "<div id='ChartsContainer' handle='ChartsContainer' widget='Basic.Components.Select' height='400'></div>" +
            "</div>" +
        "</div>"
      );
    }
  }
);
