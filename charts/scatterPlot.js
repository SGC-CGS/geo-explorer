import Chart from "./chart.js";
import Axes from "./axes.js";

export default class ScatterPlot extends Chart{ 
    constructor(options) {
        super(options)
        
        this.options = options

        this.Draw()
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

        this.points = this.g.append("g")
                            .attr("fill", "steelblue")
                            .attr("stroke", "steelblue")
                            .attr("stroke-width", 2);

        this.AppendPointsToGraph();
    }

    AppendPointsToGraph() {
        let points = this.points.selectAll("circle").data(this.options.data);
        
        // Add the points
        points  
            .enter()
            .append("circle")
            .merge(points)
                .on("mouseenter", (d, i, n) => { 
                    this.OnMouseEnter(d, n[i]);
                })
                .on("mousemove", () => { 
                    this.OnMouseMove();
                })
                .on("mouseleave", (d, i, n) => {
                    this.OnMouseLeave(n[i]);
                })
                .transition()
                .delay( (d, i) => (i * 3) )
                .duration(2000)
                .attr("cx", (d, i) => this.xScale(i))
                .attr("cy", (d) => this.yScale(d.value))
                .attr("r", 5);

        points.exit().remove();
    }

    Redraw() {
        this.xScale.domain([0, this.options.data.length - 1])
        this.UpdateAxes();
        this.BuildGridLineVertical();
        this.BuildGridLineHorizontal();
        this.AppendPointsToGraph();
    }
}