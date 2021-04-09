import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * @description 
 * The overall goal is to draw the scatterPlot onto the CSGE.
 * Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class ScatterPlot extends Chart{ 
    constructor(options) {
        super(options)
        
        this.options = options

        this.Draw()
    }

    /**
     * @description
     * First, the scales for the x and y axes are created.
     * Next, grid lines are drawn vertically and horizontally. 
     * Finally the axes and points are drawn.
     */
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

        this.AppendPointsToChart();
    }

    /**
     * @description
     * Add a point to each desired coordinate and transition
     * from left to right of the scatterPlot. Points may be
     * removed or added depending on the case of the redraw function. 
     */
    AppendPointsToChart() {
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

    /**
     * @description
     * Called when data is removed or added. 
     * The domain of the scales and 
     * visual elements need to be updated.
     */
    Redraw() {
        this.xScale.domain([0, this.options.data.length - 1]);
        this.UpdateAxes();
        this.BuildGridLineVertical();
        this.BuildGridLineHorizontal();
        this.AppendPointsToChart();
    }
}