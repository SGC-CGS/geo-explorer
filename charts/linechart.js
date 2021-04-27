import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * @description 
 * The overall goal is to draw the lineChart onto the CSGE.
 * - Step one: Append the necessary groups and path
 * - Step two: Define the scales and use them for building the line chart. The 
 * text on the bottom axis requires pre-processing to avoid texting leaving the SVG. 
 * - Step three: Add line to the chart
 * 
 * @note
 * Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class LineChart extends Chart{ 
    constructor(options) {
        super(options)

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

        // Append the line path
        this.line = this.g.append("path");
    }

    /**
     * @description
     * First, the scales for the x and y axes are created.
     * Next, grid lines are drawn vertically and horizontally. 
     * Finally the axes are drawn and a line is drawn between data points.
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

        this.AppendLineToChart();
    }

    /**
     * @description
     * Generate a multi-connected line and append 
     * it to the chart with transitions. The multi-connected
     * line will need to be redrawn every time new data is added
     * or removed.
     */
     AppendLineToChart() {
        // Create line generator
        let lineGenerator = d3.line()
							  .x((d, i) => this.xScale(i)) 
							  .y((d) =>  this.yScale(d.value));

        // Add the line
        this.line
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator);

        // Create the transition
        let totalLength = this.line.node().getTotalLength();

        this.line.attr("stroke-dasharray", totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);
    }
}