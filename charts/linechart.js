import Chart from "./chart.js";
import Axes from "./axes.js";

export default class LineChart extends Chart{ 
    constructor(options) {
        super(options)

        this.options = options;

        this.Draw();
    }

    Draw(){
        this.xScale = Axes.CreateLinearXScale(this.options.data, this.dimensions.innerWidth);

        this.yScale = Axes.CreateLinearYScale(this.options.data, this.dimensions.innerHeight);

        this.g.append("g")
            .classed("x axis-grid", true)
            .attr('transform', 'translate(0,' + this.dimensions.innerHeight + ')');

        this.BuildGridLineVertical(); 

        this.g.append("g")
            .classed("y axis-grid", true)
            .attr("transform", "translate(0,0)");

        this.BuildGridLineHorizontal(); 

        this.BuildAxes();

        this.line = this.g.append("path");

        this.AppendPointsToGraph();
    }

    AppendPointsToGraph() {
        // Create line generator
        let lineGenerator = d3.line()
            .x((d, i) => this.xScale(i)) 
            .y((d) =>  this.yScale(d.value));

        // Add the line
        this.line
            .datum(this.options.data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator);

        let totalLength = this.line.node().getTotalLength();

        this.line.attr("stroke-dasharray", totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);
    }

    Redraw() {
        this.xScale.domain([0, this.options.data.length - 1]);
        this.UpdateAxes();
        this.BuildGridLineVertical();
        this.BuildGridLineHorizontal();
        this.AppendPointsToGraph();
    }
}