import Chart from "./chart.js";

export default class LineChart extends Chart{ 
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
        
        this.line = this.g.append("path")
        
        this.AppendPointsToGraph();
    }

    AppendPointsToGraph() {
        // Create line generator and add circles to each data point
        let lineGenerator = d3.line()
            .x((d, i) => this.xScale(i)) 
            .y((d) =>  this.yScale(d.value)) 
            // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
            //.curve(d3.curveMonotoneX) 

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

        // Add the line
        this.line
            .datum(this.options.data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator)

        let totalLength = this.line.node().getTotalLength();

        this.line.attr("stroke-dasharray", totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);
    }

    Redraw() {
        this.UpdateAxes()
        this.AppendPointsToGraph();
    }
}