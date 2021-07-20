import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * Bar Chart module
 * @module charts/barChart
 * @extends Chart
 * @description The overall goal is to draw the barChart onto the CSGE.
 * Step one: Append the necessary groups and get the color scale
 * Step two: Define the scales and use them for building the bar chart. The 
 * text on the bottom axis requires pre-processing to avoid texting leaving the SVG. 
 * Step three: Add rectangles to the chart
 * @note Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class BarChart extends Chart{ 

    /**
     * Set up bar chart
     * @param {object} options - Chart div object
     * @returns {void}
     */
    constructor(options) {
        super(options);

        this.typeOfChartElement = 'rect';

        this.chartDataType = 'rect';

        this.color = this.GetColor();

        // Append the grid line group
        this.g.append("g").classed("y axis-grid", true).attr("transform", "translate(0,0)");

        // Append the left (vertical) axis group
        this.g.append('g')
        .classed("left axis", true);
    
        // Append the bottom (horizontal) axis group
        this.g.append('g')
            .classed("bottom axis", true)
            .attr("transform", `translate(0, ${this.dimensions.innerHeight})`);
    }

    /**
     * Create the bar chart
     * @returns {void}
     */
    Draw(){
        // create scales for the x and y axes.
        this.xScale = Axes.CreateBandXScale(this.data, this.dimensions.innerWidth);
        this.yScale = Axes.CreateLinearYScale(this.data, this.dimensions.innerHeight);
        
        // add horizontal grid lines
        this.g.selectAll("g.y.axis-grid")
            .call(Axes.GridLineHorizontal(this.yScale, this.dimensions.innerWidth));
        
        // set axis attributes
        this.SetLeftAxisAttributes();
        this.SetBottomAxisAttributes();

        this.AppendRectanglesToChart();  // add bars
    }
    
    /**
     * Update rectangles on chart
     * @returns {void}
     */
    AppendRectanglesToChart(){
        let rectangles = this.g.selectAll(this.typeOfChartElement).data(this.data);
        
        // Rectangles with initial height of 0 are added for each x-axis tick mark
        rectangles
            .enter()
            .append(this.typeOfChartElement)
            .merge(rectangles)
            .attr("x", (d) => this.xScale(d.label))
            .attr("y", this.yScale(0))
            // Compute the width for each rectangle
            .attr("width", this.xScale.bandwidth())
            // Compute height for each rectangle
            .attr("height", this.dimensions.innerHeight - this.yScale(0))
            .attr("id", (d) =>  d.label)
            .style("fill", (d) => this.color(d.value))
            .on("mouseenter", (event, d) => {this.OnMouseEnter(d.label, d.value, event.target)})
            .on("mousemove", (event) => this.OnMouseMove(event))
            .on("mouseleave", (event) => this.OnMouseLeave(event.target));

        // Remove surplus bars and previous dataset from chart
        rectangles.exit().remove();
        
        this.TransitionOnTheVertical();
    }

    /**
     * Set bars/rectangles to correct height for each value
     * @returns {void}
     */
    TransitionOnTheVertical() {
        this.g.selectAll(this.typeOfChartElement)   
            .transition()
            .duration(700)
            .ease(d3.easeLinear)
            .attr("y", (d) => this.yScale(d.value))
            .attr("height", (d) => this.dimensions.innerHeight - this.yScale(d.value));
    }
}