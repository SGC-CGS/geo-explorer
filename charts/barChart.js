import Chart from "./chart.js";
import Axes from "./axes.js";

export default class BarChart extends Chart{ 

    constructor(options) {
        super(options)

        this.options = options;

        this.Draw();
    }

    Draw(){
        this.xScale = Axes.CreateBandXScale(this.options.data, this.dimensions.innerWidth);

        this.yScale = Axes.CreateLinearYScale(this.options.data, this.dimensions.innerHeight);

        this.g.append("g").classed("y axis-grid", true).attr("transform", "translate(0,0)");

        this.BuildGridLineHorizontal(); 

        this.BuildAxes();

        this.AppendRectanglesToGraph();
    }
    
    AppendRectanglesToGraph(){
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
            .attr(
                "height", this.dimensions.innerHeight - this.yScale(0)
            )
            // Later fill based on SME config
            .style("fill", (d) => this.color(d.value))
            .on("mouseenter", (d, i, n) => { 
                this.OnMouseEnter(d, n[i]);
            })
            .on("mousemove", () => { 
                this.OnMouseMove();
            })
            .on("mouseleave", (d, i, n) => {
                this.OnMouseLeave(n[i]);
            });

        // Remove surplus bars and previous dataset out of graph
        rectangles.exit().remove();
        
        // Rectangles will grow up to their innerHeight
        this.TransitionOnTheVertical();
    }

    TransitionOnTheVertical() {
        this.g.selectAll("rect")   
            .transition()
            .duration(700)
            .ease(d3.easeLinear)
            .attr("y", (d) => this.yScale(d.value))
            .attr(
                "height",
                (d) => this.dimensions.innerHeight - this.yScale(d.value)
            );
    }

    // Based on adding or removing features 
    Redraw(){
        
        // Scale domains must be redone since the axises 
        // and bars and grid lines need to change 
        this.xScale.domain(this.options.data.map(d => d.title));
        this.UpdateAxes();
        this.BuildGridLineHorizontal();
        this.AppendRectanglesToGraph();
    }
}