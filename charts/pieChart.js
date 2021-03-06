import Chart from "./chart.js";

export default class PieChart extends Chart{ 
    constructor(options) {
        super(options)
        this.options = options
        this.color = d3.scaleOrdinal(d3.schemeCategory20);
        this.Draw();
    }

    Draw() {
        // Set up pie chart based on data. Arc is used for getting
        // the right shape and angles
        let pie = d3.pie().value((d) => d.value)(this.options.data)
        let arc = d3.arc().outerRadius(this.dimensions.radius).innerRadius(0)
        let self = this;

        this.circle = this.g.selectAll("path").data(pie)

        this.circle
            .enter()
            .append("path")
            .merge(this.circle)
            .attr("d", arc)
            .style("fill", (d, i) => this.color(i))
            .on("mouseover", function(d) { 
                d3.select(this).style("opacity", 0.5);
                self.MouseOver(d);
            })
            .on("mouseout", function () {
                d3.select(this).style("opacity", 1);
                self.MouseOut();
            })
            .transition()
            .duration(2000)
            // TODO: Add this to the documentation
            // http://bl.ocks.org/mbostock/5100636
            .attrTween("d", (d) => {
                var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                return function(t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                }
            });
            this.circle.exit().remove();
        

        // TODO: Add a legend below that has the title and value

    }

    Redraw() {
        this.Draw()    
    }
}