import Axes from "./axes.js"

export default class Chart { 

    constructor(options) {
        this.options = options
        this.spaceFromBorders = 25
        this.tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 1);
        this.SelectContainerElement();
        this.AppendSVGtoContainerElement();
        this.SetDimensions();
        this.AddGroupToSVG();
    }

    SelectContainerElement(){
        this.container = d3.select(this.options.element)
    }

    AppendSVGtoContainerElement(){
        this.container
          .append("svg")
          .attr("width", this.options.element.getAttribute("width"))
          .attr("height", +this.options.element.getAttribute("height"))
    }

    SetDimensions(){
        let dimensions = this.options.dimensions || false;
        let radius = 0;
        if (!dimensions){
            var margin = {top: 20, bottom: 70, right: 0, left: 55};
            var width =
              +this.container.select("svg").attr("width") -
                this.spaceFromBorders;
            var height =
              +this.container.select("svg").attr("height") -
                this.spaceFromBorders;
            // Maybe don't need this at all?
            if(this.options.chartType == "PieChart"){
                radius = (Math.min(width, height) / 3);
            }
            dimensions = {
                margin : margin,
                width:  width,
                height: height,
                radius: radius,
                innerWidth: width - margin.left - margin.right,
                innerHeight : height - margin.top - margin.bottom, 
            };
        }
        this.dimensions = dimensions
    }

    UpdateMargin(top, bottom, right, left){
        this.dimensions.margin = {top: top, bottom: bottom, right: right, left: left};
    }

    UpdateWidth(width){ this.dimensions.width = width; }
    
    UpdateHeight(height){ this.dimensions.height = height; }

    UpdateInnerWidth(innerWidth){ this.dimensions.innerWidth = innerWidth; }

    UpdateInnerHeight(innerHeight){ this.dimensions.innerHeight = innerHeight; }

    // Put the group within the view of the svg 
    AddGroupToSVG(){
        this.g = this.container.select("svg").append('g')
        
        if (this.options.chartType == "BarChart" || this.options.chartType == "LineChart" || this.options.chartType == "ScatterPlot") {
            this.g.attr(
                'transform', 
                `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`
            );
        } 
        else if (this.options.chartType == "PieChart") {
            this.g.attr(
                'transform', 
                `translate(${this.dimensions.radius * 1.5}, ${this.dimensions.radius * 1.5})`
            );
        } 
    }

    BuildScales(){
        if (this.options.chartType == "LineChart" || this.options.chartType == "ScatterPlot") {
            this.xScale = Axes.CreateLinearXScale(this.options.data, this.dimensions.innerWidth)
        } else {
            this.xScale = Axes.CreateBandXScale(this.options.data, this.dimensions.innerWidth)
        }
        this.yScale = Axes.CreateLinearYScale(this.options.data, this.dimensions.innerHeight)
    }

    // To build axes you need scales first
    BuildAxes(){ 
        this.BuildScales();
        if (this.options.chartType == "LineChart" || this.options.chartType == "ScatterPlot") {
            Axes.AppendGridLineForX(this.xScale, this.dimensions.innerHeight, this.g)
        }
        Axes.AppendGridLineForY(this.yScale, this.dimensions.innerWidth, this.g)
        Axes.AppendLeftAxisToGraph(this.yScale, this.g)
        Axes.AppendBottomAxisToGraph(this.xScale, this.dimensions.innerHeight, this.g)
        
    }

    UpdateAxes(){
        let xScaleDomain;
        
        if (this.options.chartType == "LineChart" || this.options.chartType == "ScatterPlot") {
            xScaleDomain = this.xScale.domain([0, this.options.data.length - 1])
        } else {
            xScaleDomain = this.xScale.domain(this.options.data.map(d => d.title))
        }

        Axes.UpdateBottomAxisInGraph(
            xScaleDomain, 
            this.dimensions.innerHeight, 
            this.g);
        Axes.UpdateLeftAxisToGraph(
            this.yScale.domain([(d3.max(this.options.data, d => d.value)), 0]), 
            this.g);
        Axes.UpdateGridLineForY(this.yScale, this.dimensions.innerWidth, this.g)

        if (this.options.chartType == "LineChart") {
            Axes.UpdateGridLineForX(this.xScale, this.dimensions.innerHeight, this.g)
        }
    }

    // Based on overlay
    // TODO
    Resize(){

    }


    // Use tooltip.js instead?
    MouseOver(d) {
        this.tooltip
            .transition()
            .delay(100)
            .duration(600)
            .style("opacity", 1)
            .style('pointer-events', 'all')	

        if (this.options.chartType == "PieChart") {
            this.tooltip
                .html(`${d.data.title}` + "<br/>" + `Value: ` + `${d.data.value}`)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px")
        } else {
            this.tooltip
                .html(`${d.title}` + "<br/>" + `Value: ` + `${d.value}`)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px")
        }
    }

    MouseOut() {
        this.tooltip
            .transition()
            .delay(100)
            .duration(600)
            .style("opacity", 0)
            .style('pointer-events', 'none')
    }

}