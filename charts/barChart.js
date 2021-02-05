import Chart from "./chart.js";

export default class BarChart extends Chart{ 

    // If we remove this constuctor it is still generated 
    // by default as it will call the parent constructor 
    // constructor(...args) {
    //     super(...args);
    //   }
    constructor(options) {
        // Call parent class constructor 
        super(options)
        this.options = options
        this.xName = options.xName;
        this.yName = options.yName;

        this.CreateBarChart()

    }

    CreateBarChart(){
        // Call the parent functions here
        this.SelectContainerElement(this.element)
        this.AppendSVGtoContainerElement()
        this.SetDimensions()
        this.AddGroupToSVG()
        this.BuildAxes()
        this.AppendVerticalRectanglesToGraph()
    }
    
    // This is specific to regular bar graphs
    // A sideways bar graph would need a new method entirely
    AppendVerticalRectanglesToGraph(){
        var color = d3.scaleOrdinal(d3.schemeCategory20);
        this.g
            .selectAll("rect")
            // data join to pass in array
            .data(this.data)
            // More entries in data than there are DOM elements
            // Look into .update and .exit
            // Add one rectangle for each row
            .enter()
            .append("rect")
            // Return yscale of country
            .attr("x", (d) => this.xScale(d[this.xName]))
            .attr("y", (d) => this.yScale(d[this.yName]))
            // Compute the width for each rectangle
            .attr("width", this.xScale.bandwidth())
            // Compute height for each rectangle
            .attr(
                "height",
                (d) => this.dimensions.innerHeight - this.yScale(d[this.yName])
            )
            // Fill based on SME config
            .style("fill", (d) => color(d[this.yName]))
            // Change opacity when hovering over rectangles
            .on("mouseover", function () {
                d3.select(this).style("opacity", 0.5)
            })
            .on("mouseout", function () {
                d3.select(this).style("opacity", 1);
            });
    }

    

    


}