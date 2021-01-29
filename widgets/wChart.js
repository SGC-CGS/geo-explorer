import Overlay from "./overlay.js";
import Core from "../tools/core.js";
import Dom from "../tools/dom.js";
import Requests from "../tools/requests.js";
import BarChart from "../charts/barChart.js";


export default Core.Templatable("App.Widgets.WChart",
  class WChart extends Overlay {
    constructor(container, options) {
      super(container, options);
      this.metadata = null;

      this.Node("ChartsContainer").On("Change", this.OnSubject_Change.bind(this));
      this.Elem("ChartsContainer").placeholder = Core.Nls("Chart_Type_Placeholder");
    }

    // Add interaction here

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
      if (ev.target.selected.label == "Bar Chart") {

        var data = [
          {city: "ottawa", cases: 133},
          {city: "toronto", cases: 160},
          {city: "kingston", cases: 50},
          {city: "vancouver", cases: 200},
          {city: "victoria", cases: 10},
          {city: "montreal", cases: 250},
          {city: "quebec city", cases: 90},
          {city: 1234567891011324432932973297, cases: 90}
        ]

        // Direct reference
        var elem = this.Node("ChartsContainer").elem.container
        var barChart = new BarChart(data, elem, "city", "cases");
        
      } 

      else if (ev.target.selected.label == "Pie Chart") {
        var svg = d3.select(this.Node("ChartsContainer").elem.container)
        svg.selectAll("svg").remove();
      }

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
            "<div id='ChartsContainer' handle='ChartsContainer' widget='Basic.Components.Select'></div>" +
          "</div>" +
        "</div>"
      );
    }
  }
);
