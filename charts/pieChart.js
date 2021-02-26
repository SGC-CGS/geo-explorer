import Chart from "./chart.js";

export default class PieChart extends Chart{ 
    constructor(options) {
        super(options)
        this.options = options
        this.color = d3.scaleOrdinal(d3.schemeCategory20);
        this.CreatePieChart();
    }

    CreatePieChart() {
        this.SelectContainerElement(this.element);
        this.AppendSVGtoContainerElement();
        this.SetDimensions();
        this.AddGroupToSVG();
        this.tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 1);
        this.Draw();
    }

    Draw() {
        // Set up pie chart based on data. Arc is used for getting
        // the right shape and angles
        let pie = d3.pie().value((d) => d.value)(this.options.data)
        let arc = d3.arc().outerRadius(this.dimensions.radius).innerRadius(0)
        let tooltip = this.tooltip;
        let color = this.color

        this.circle = this.g.selectAll("path").data(pie)

        this.circle
            .enter()
            .append("path")
            .merge(this.circle)
            .attr("d", arc)
            .style("fill", (d, i) => this.color(i))
            .on("mouseover", function (d) {
                d3.select(this)
                     .style("opacity", 0.5)
                tooltip
                .transition()
                .delay(100)
                .duration(600)
                .style("opacity", 1)
                .style('pointer-events', 'all')	
                tooltip
                    .html(`${d.data.title}` + "<br/>" + `Value: ` + `${d.data.value}`)	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY - 28) + "px")
                })
            .on("mouseout", function () {
                d3.select(this).style("opacity", 1);
                tooltip
                    .transition()
                    .delay(100)
                    .duration(600)
                    .style("opacity", 0)
                    .style('pointer-events', 'none')
            })
            .transition()
            .duration(2000)
            // http://bl.ocks.org/mbostock/5100636
            .attrTween("d", (d) => {
                var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                return function(t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                }
            });
            this.circle.exit().remove();
        

        // Add a Label below that has the label and value

    }

    Transition() {
        
    }


    Redraw() {
        this.Draw()    
    }
}