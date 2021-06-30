import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * Scatter Plot module
 * @module charts/scatterPlot
 * @extends Chart
 * @description The overall goal is to draw the scatter plot onto the CSGE.
 * @note Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class ScatterPlot extends Chart{ 

    /**
     * Set up Scatter plot chart
     * @param {object} options - Chart div object
     * @returns {void}
     */       
    constructor(options) {
        super(options);

        this.typeOfChartElement = "circle";

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
     * Draw the scatterplot
     * @returns {void}
     */
    Draw(){
        // Create x and y axes scales
        this.xScale = Axes.CreateLinearXScale(this.data, this.dimensions.innerWidth);
        this.yScale = Axes.CreateLinearYScale(this.data, this.dimensions.innerHeight);

        // Draw vertical and horizontal gridlines
        this.g.selectAll("g.x.axis-grid")
            .call(Axes.GridLineVertical(this.xScale, this.dimensions.innerHeight));

        this.g.selectAll("g.y.axis-grid")
            .call(Axes.GridLineHorizontal(this.yScale, this.dimensions.innerWidth));

        // Draw axes
        this.g
			.selectAll("g.left.axis")
			.call(d3.axisLeft(this.yScale).ticks());

        this.SetBottomAxisAttributes();

        // Append datapoints
        this.AppendPointsToChart();
    }

    /**
     * Add a point to each desired coordinate and transition
     * from left to right of the scatterPlot. Points may be
     * removed or added depending on the case of the redraw function. 
     * @returns {void}
     */
    AppendPointsToChart() {
        let points = this.points.selectAll(this.typeOfChartElement).data(this.data);
        
        // Add the points
        points.enter()
              .append(this.typeOfChartElement)
              .merge(points)
              .on("mouseenter", (event, d) => {this.OnMouseEnter(d.label, d.value, event.target)})
              .on("mousemove", (event) => this.OnMouseMove(event))
              .on("mouseleave", (event) => this.OnMouseLeave(event.target))
                .transition()
                .delay((d, i) => (i * 3))
                .duration(2000)
                .attr("cx", (d, i) => this.xScale(i))
                .attr("cy", (d) => this.yScale(d.value))
                .attr("r", 5);

        points.exit().remove();
    }
}