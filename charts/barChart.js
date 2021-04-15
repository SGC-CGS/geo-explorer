import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * @description 
 * The overall goal is to draw the barChart onto the CSGE.
 * Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class BarChart extends Chart{ 

    constructor(options) {
        super(options)

        this.options = options;

        this.color = this.GetColor();

        this.Draw();
    }

    /**
     * @description
     * First, the scales for the x and y axes are created.
     * Next, grid lines are drawn horizontally. 
     * Finally the axes and bars are drawn.
     */
    Draw(){
        this.xScale = Axes.CreateBandXScale(this.options.data, this.dimensions.innerWidth);

        this.yScale = Axes.CreateLinearYScale(this.options.data, this.dimensions.innerHeight);

        this.g.append("g").classed("y axis-grid", true).attr("transform", "translate(0,0)");

        this.BuildGridLineHorizontal(); 

        this.BuildAxes();

        this.AppendRectanglesToChart();
    }
    
    /**
     * @description
     * For each tick mark on the x-axis, a rectangle is added. When
     * the rectangles are first added, their heights are zero. Rectangles may be
     * removed or added depending on the case of the redraw function. 
     */
    AppendRectanglesToChart(){
        let rectangles = this.g.selectAll("rect").data(this.options.data);
              
        rectangles
            .enter()
            .append("rect")
            .merge(rectangles)
            .attr("x", (d) => this.xScale(d.title))
            .attr("y", this.yScale(0))
            // Compute the width for each rectangle
            .attr("width", this.xScale.bandwidth())
            // Compute height for each rectangle
            .attr("height", this.dimensions.innerHeight - this.yScale(0))
            .style("fill", (d) => this.color(d.value))
            .on("mouseenter", (d, i, n) => this.OnMouseEnter(d.title, d.value, n[i]))
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


    /**
     * @description
     * Called when data is removed or added. 
     * The domain of the scales and 
     * visual elements need to be updated.
     */
    Redraw(){
        // Scale domains must be redone since the axises 
        // and bars and grid lines need to change 
        this.xScale.domain(this.options.data.map(d => d.title));
        this.UpdateAxes();
        this.BuildGridLineHorizontal();
        this.AppendRectanglesToChart();
    }
}