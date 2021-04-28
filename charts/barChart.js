import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * @description 
 * The overall goal is to draw the barChart onto the CSGE.
 * - Step one: Append the necessary groups and get the color scale
 * - Step two: Define the scales and use them for building the bar chart. The 
 * text on the bottom axis requires pre-processing to avoid texting leaving the SVG. 
 * - Step three: Add rectangles to the chart
 * 
 * @note
 * Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class BarChart extends Chart{ 

    constructor(options) {
        super(options)

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
     * @description
     * First, the scales for the x and y axes are created.
     * Next, grid lines are drawn horizontally. 
     * Finally the axes and bars are drawn.
     */
    Draw(){
        this.xScale = Axes.CreateBandXScale(this.data, this.dimensions.innerWidth);

        this.yScale = Axes.CreateLinearYScale(this.data, this.dimensions.innerHeight);
        
        this.g.selectAll("g.y.axis-grid")
            .call(Axes.GridLineHorizontal(this.yScale, this.dimensions.innerWidth));

        this.g
			.selectAll("g.left.axis")
			.call(d3.axisLeft(this.yScale).ticks())

        this.SetBottomAxisAttributes();

        this.AppendRectanglesToChart();
    }
    
    /**
     * @description
     * For each tick mark on the x-axis, a rectangle is added. When
     * the rectangles are first added, their heights are zero. Rectangles may be
     * removed or added depending on the case of the redraw function. 
     */
    AppendRectanglesToChart(){
        let rectangles = this.g.selectAll("rect").data(this.data);
              
        rectangles
            .enter()
            .append("rect")
            .merge(rectangles)
            .attr("x", (d) => this.xScale(d.label))
            .attr("y", this.yScale(0))
            // Compute the width for each rectangle
            .attr("width", this.xScale.bandwidth())
            // Compute height for each rectangle
            .attr("height", this.dimensions.innerHeight - this.yScale(0))
            .style("fill", (d) => this.color(d.value))
            .on("mouseenter", (d, i, n) => this.OnMouseEnter(d.label, d.value, n[i]))
            .on("mousemove", () => this.OnMouseMove())
            .on("mouseleave", (d, i, n) => this.OnMouseLeave(n[i]));

        // Remove surplus bars and previous dataset out of graph
        rectangles.exit().remove();
        
        this.TransitionOnTheVertical();
    }

    /**
     * @description
     * The transition function is called to grow 
     * all the rectangles to the appropriate height.
     */
    TransitionOnTheVertical() {
        this.g.selectAll("rect")   
            .transition()
            .duration(700)
            .ease(d3.easeLinear)
            .attr("y", (d) => this.yScale(d.value))
            .attr("height", (d) => this.dimensions.innerHeight - this.yScale(d.value));
    }
}