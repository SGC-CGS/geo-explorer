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
        super(options);

        // Append the x grid line group
        this.g.append("g")
                .classed("x axis-grid", true)
                .attr('transform', 'translate(0,' + this.dimensions.innerHeight + ')');
  
        // Append the y grid line group
        this.g.append("g")
                .classed("y axis-grid", true)
                .attr("transform", "translate(0,0)");
  
        // Append the left (vertical) axis group
        this.g.append('g')
          .classed("left axis", true);
      
        // Append the bottom (horizontal) axis group
        this.g.append('g')
              .classed("bottom axis", true)
              .attr("transform", `translate(0, ${this.dimensions.innerHeight})`);
        
        // Append the points group
        this.points = this.g.append("g")
              .attr("fill", "steelblue")
              .attr("stroke", "steelblue")
              .attr("stroke-width", 2);
    }

    /**
     * @description
     * First, the scales for the x and y axes are created.
     * Next, grid lines are drawn vertically and horizontally. 
     * Finally the axes and points are drawn.
     */
    Draw(){
        this.xScale = Axes.CreateLinearXScale(this.data, this.dimensions.innerWidth);
        this.yScale = Axes.CreateLinearYScale(this.data, this.dimensions.innerHeight);

        this.g.selectAll("g.x.axis-grid")
            .call(Axes.GridLineVertical(this.xScale, this.dimensions.innerHeight));

        this.g.selectAll("g.y.axis-grid")
            .call(Axes.GridLineHorizontal(this.yScale, this.dimensions.innerWidth));

        this.g
			.selectAll("g.left.axis")
			.call(d3.axisLeft(this.yScale).ticks())

        this.SetBottomAxisAttributes();

        this.AppendPointsToChart();
    }

    /**
     * @description
     * Add a point to each desired coordinate and transition
     * from left to right of the scatterPlot. Points may be
     * removed or added depending on the case of the redraw function. 
     */
    AppendPointsToChart() {
        let points = this.points.selectAll("circle").data(this.data);
        
        // Add the points
        points.enter()
              .append("circle")
              .merge(points)
                .on("mouseenter", (d, i, n) => this.OnMouseEnter(d.label, d.value, n[i]))
                .on("mousemove", () => this.OnMouseMove())
                .on("mouseleave", (d, i, n) => this.OnMouseLeave(n[i]))
                .transition()
                .delay((d, i) => (i * 3))
                .duration(2000)
                .attr("cx", (d, i) => this.xScale(i))
                .attr("cy", (d) => this.yScale(d.value))
                .attr("r", 5);

        points.exit().remove();
    }
}