import Axes from "./axes.js"
import Tooltip from "../ui/tooltip.js"

export default class Chart { 

    constructor(options) {
        this.options = options;

        this.color = d3.scaleOrdinal(d3.schemeCategory20);

        this.padding = 25

        this.tooltip = new Tooltip();

        this.container = d3.select(this.options.element);

        this.AppendSVGtoContainerElement();

        this.BuildDimensions();

        this.AddGroupToSVG();
    }

    AppendSVGtoContainerElement() {
        this.container
          .append("svg")
          .attr("width", +this.options.element.getAttribute("width"))
          .attr("height", +this.options.element.getAttribute("height"));
    }

    BuildDimensions() {
        this.dimensions = this.options.dimensions || null;

        if (!this.dimensions){ this.SetDefaultDimensions(); }
    }

    SetDefaultDimensions() {
        let margin = {top: 20, bottom: 70, right: 0, left: 55};

        let width =
            +this.container.select("svg").attr("width") -
            this.padding;

        let height =
            +this.container.select("svg").attr("height") -
            this.padding;

        this.dimensions = {
                margin : margin,
                width:  width,
                height: height,
                innerWidth: width - margin.left - margin.right,
                innerHeight : height - margin.top - margin.bottom
            };
    }

    // Put the group within the view of the svg 
    AddGroupToSVG() {
        this.g = this.container.select("svg").append('g').attr(
            'transform', 
            `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`
        );
    }

    BuildGridLineVertical() {
        this.g.selectAll("g.x.axis-grid")
            .call(Axes.GridLineVertical(this.xScale, this.dimensions.innerHeight));
    }

    BuildGridLineHorizontal() {
        this.g.selectAll("g.y.axis-grid")
            .call(Axes.GridLineHorizontal(this.yScale, this.dimensions.innerWidth));
    }

    // To build axes you need scales first
    BuildAxes() { 
        // Left (vertical) axis
        this.g.append('g')
            .call(d3.axisLeft(this.yScale).ticks())
            .classed("left axis", true);
        
        // Bottom (horizontal) axis
        this.g.append('g')
            .classed("bottom axis", true)
            .attr("transform", `translate(0, ${this.dimensions.innerHeight})`);

        Axes.SetBottomAxisAttributes(this.xScale, this.g.selectAll("g.bottom.axis"));
    }

    // The domains must be updated
    UpdateAxes() {
        Axes.SetBottomAxisAttributes(this.xScale, this.g.selectAll("g.bottom.axis"));
        
        this.g
          .selectAll("g.left.axis")
          .call(
            d3.axisLeft(
                this.yScale.domain([
                  d3.max(this.options.data, (d) => d.value),
                  0,
                ])
              )
              .ticks()
          );
    }

    OnMouseEnter(d, current) {
        d3.select(current).style("opacity", 0.5);

        let title, value;

        if(d.title !== undefined) {
            title = d.title;
            value = d.value;
        } else {
            // PieCharts use .data
            title = d.data.title;
            value = d.data.value;
        }  

        this.tooltip.content = `${title}` + "<br/>" + `Value: ` + `${value}`;
    }

    OnMouseMove() {
        this.tooltip.Show(d3.event.pageX + 10, d3.event.pageY - 28)
    }

    OnMouseLeave(current) {
        d3.select(current).style("opacity", 1);
        this.tooltip.Hide()
    }

}