import Chart from "./chart.js";

export default class ScatterPlot extends Chart{ 
    constructor(options) {
        super(options)
        this.options = options
        this.color = d3.scaleOrdinal(d3.schemeCategory20);
        this.Draw()
    }

    Draw(){
        this.BuildAxes();
        this.points = this.g.append("g")
                            .attr("fill", "steelblue")
                            .attr("stroke", "steelblue")
                            .attr("stroke-width", 2)
        this.AppendPointsToGraph();
    }

    AppendPointsToGraph() {
        // Create line generator and add circles to each data point
        let self = this;

        let points = this.points.selectAll("circle").data(this.options.data)
        
        // Add the points
        points  
            .enter()
            .append("circle")
            .merge(points)
                .on("mouseover", function (d) { 
                    d3.select(this).style("opacity", 0.5);
                    self.MouseOver(d);
                })
                .on("mouseout",  function () {
                    d3.select(this).style("opacity", 1);
                    self.MouseOut();
                })
                .transition()
                .delay( (d, i) => (i * 3) )
                .duration(2000)
                .attr("cx", (d, i) => this.xScale(i))
                .attr("cy", (d) => this.yScale(d.value))
                .attr("r", 5)

        points.exit().remove()
    }

    Redraw() {
        // Issue with x-axis
        this.UpdateAxes()
        this.AppendPointsToGraph();
    }
}