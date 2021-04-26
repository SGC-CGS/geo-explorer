import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * @description 
 * The overall goal is to draw the lineChart onto the CSGE.
 * Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class LineChart extends Chart{ 
    constructor(options) {
        super(options)

        this.options = options;

        this.Draw();
    }

    /**
     * @description
     * First, the scales for the x and y axes are created.
     * Next, grid lines are drawn vertically and horizontally. 
     * Finally the axes are drawn and a line is drawn between data points.
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

        this.line = this.g.append("path");

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
            .datum(this.options.data)
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
        this.AppendLineToChart();
    }
}