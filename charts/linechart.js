import Chart from "./chart.js";

export default class LineChart extends Chart{ 
    constructor(options) {
        super(options)
        this.options = options
        this.color = d3.scaleOrdinal(d3.schemeCategory20);
        this.CreateLineChart()
    }

    CreateLineChart(){
        this.SelectContainerElement(this.element);
        this.AppendSVGtoContainerElement();
        this.SetDimensions();
        this.AddGroupToSVG();
        this.BuildAxes();
        this.tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 1);
        this.AppendPointsToGraph();
    }

    AppendPointsToGraph() {
        var points = this.g.selectAll("rect")
            .data(this.options.data)

        var tooltip = this.tooltip;
    }
}