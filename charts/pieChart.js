import Chart from "./chart.js";

/**
 * Pie Chart module
 * @module charts/pieChart
 * @extends Chart
 * @description The overall goal is to draw the pie chart onto the CSGE.
 * @note Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class PieChart extends Chart { 
    constructor(options) {
        super(options);
		
        this.color = this.GetColor();

        // Update dimensions for PieChart and translate accordingly 
        this.dimensions.radius = (Math.min(this.dimensions.width, this.dimensions.height) / 3);
        this.dimensions.width += this.padding;
        
		var transform = `translate(${this.dimensions.width / 2}, ${this.dimensions.radius})`;
		
		this.g.attr('transform', transform);

        // Inside the SVG, append a foreignObject containing a div 
        this.foreignObject = this.container.select("svg")
										   .append('foreignObject')
										   .style('y', this.dimensions.height / 1.4)
										   .style('x', 0)
										   .style('width', this.dimensions.width)
										   .style('height', this.dimensions.height / 3)
        
        this.foreignObject.append("xhtml:div")
    }

    /**
     * @description
     * d3.pie() is used to set up the pieChart based on the data 
     * and d3.arc() is used for getting the right shape and angles. 
     * Pie slices and elements in the legend may be removed or 
     * added depending on the case of the redraw function. 
     */
    Draw() {
        // Set up pie chart based on data. Arc is used for getting
        // the right shape and angles
        let pie = d3.pie().value((d) => d.value)(this.data);
        let arc = d3.arc().outerRadius(this.dimensions.radius).innerRadius(0);

        this.circle = this.g.selectAll("path").data(pie);

        this.circle
            .enter()
            .append("path")
            .merge(this.circle)
            .attr("d", arc)
            .style("fill", (d, i) => this.color(i))
            .on("mouseenter", (d, i, n) => this.OnMouseEnter(d.data.label, d.data.value, n[i]))
            .on("mousemove", () => this.OnMouseMove())
            .on("mouseleave", (d, i, n) => this.OnMouseLeave(n[i]))
            .transition()
            .duration(2000)
            .attrTween("d", (d) => {
                var interpolate = d3.interpolate(d.startAngle, d.endAngle);
				
                return (t) => {
                    d.endAngle = interpolate(t);
                    
					return arc(d);
                }
            });
            this.circle.exit().remove();
        
        this.Legend();
    }

    /**
     * @description
     * Fill the foreignObject's div with html content relating 
     * to the pieChart.
     */
    Legend() {
        let htmlContent = this.data
          .map((d, i) => {
            return `<div class="pieLegend">
                        <div style="border-radius:10px;
                            width:10px;
                            height:10px;
                            background-color:${this.color(i)};
                            display:inline-block">
                        </div> 
                        ${d.label}\t (${d.value})
                    </div>`;
          })
          .join("");

        this.foreignObject
            .select("div")
            .html(htmlContent)
    }

}