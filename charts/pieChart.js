import Chart from "./chart.js";

export default class PieChart extends Chart{ 
    constructor(options) {
        super(options)
        this.options = options

        // Update dimensions for PieChart and translate accordingly 
        this.dimensions.radius = (Math.min(this.dimensions.width, this.dimensions.height) / 3);
        this.dimensions.width += this.padding;
        this.g.attr(
            'transform', 
            `translate(${this.dimensions.width / 2}, ${this.dimensions.radius})`
        );

        // Append a foreignObject containing legend inside of SVG
        this.foreignObject = this.container.select("svg")
                        .append('foreignObject')
                        .style("overflow-y", "scroll" )
                        .style('position','fixed')
                        .style('y', this.dimensions.height / 1.4)
                        .style('x', 0)
                        .style('width', this.dimensions.width)
                        .style('height', this.dimensions.height / 3)
        
        this.foreignObject.append("xhtml:div")
        
        this.Draw();
    }

    Draw() {
        // Set up pie chart based on data. Arc is used for getting
        // the right shape and angles
        let pie = d3.pie().value((d) => d.value)(this.options.data)
        let arc = d3.arc().outerRadius(this.dimensions.radius).innerRadius(0)

        this.circle = this.g.selectAll("path").data(pie)

        this.circle
            .enter()
            .append("path")
            .merge(this.circle)
            .attr("d", arc)
            .style("fill", (d, i) => this.color(i))
            .on("mouseenter", (d, i, n) => { 
                this.OnMouseEnter(d, n[i]);
            })
            .on("mousemove", () => { 
                this.OnMouseMove();
            })
            .on("mouseleave", (d, i, n) => {
                this.OnMouseLeave(n[i]);
            })
            .transition()
            .duration(2000)
            .attrTween("d", (d) => {
                var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                return function(t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                }
            });
            this.circle.exit().remove();
        
        this.Legend();
    }

    Legend() {
        
        this.foreignObject
            .select("div")
            .html(
            this.options.data.map( (d, i) => {
                return `<div style="font-size:11px; margin-top:5px;  margin-left:5px;">
                            <div style="border-radius:10px;
                                width:10px;
                                height:10px;
                                background-color:${this.color(i)};
                                display:inline-block">
                            </div> 
                                ${d.title}\t (${d.value})
                        </div>`	
                }).join('')
        )
    }

    Redraw() {
        this.Draw()    
    }
}