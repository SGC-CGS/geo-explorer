import Chart from "./chart.js";
import Axes from "./axes.js";

export default class BarChart extends Chart{ 

    constructor(options) {
        super(options)
        this.options = options
        this.color = d3.scaleOrdinal(d3.schemeCategory20);
        this.Draw()
    }

    Draw(){
        this.BuildAxes();
        this.AppendVerticalRectanglesToGraph();
    }
    
    // This is specific to regular bar graphs
    // A sideways bar graph would need a new method entirely
    AppendVerticalRectanglesToGraph(){
        let rectangles = this.g.selectAll("rect").data(this.options.data);
        let self = this;
              
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
            // So rectangles can change on hover
            .on("mouseover", function(d) { 
                d3.select(this).style("opacity", 0.5);
                self.MouseOver(d);
            })
            .on("mouseout", function () {
                d3.select(this).style("opacity", 1);
                self.MouseOut();
            })

        // Remove surplus bars and previous dataset out of graph
        rectangles.exit().remove();
        
        // Rectangles will grow up to their innerHeight
        this.TransitionOnTheY();
    }

    TransitionOnTheY() {
        this.g.selectAll("rect")   
            .transition()
            .duration(700)
            .ease(d3.easeLinear)
            .attr("y", (d) => this.yScale(d.value))
            .attr(
                "height",
                (d) => this.dimensions.innerHeight - this.yScale(d.value)
            )
    }

    // Based on adding or removing features 
    Redraw(){
        // Scale domains must be redone since the axises 
        // and bars and grid lines need to change 
        this.UpdateAxes()
        this.AppendVerticalRectanglesToGraph();
    }

    

    


}