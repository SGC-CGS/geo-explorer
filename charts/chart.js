import Axes from "./axes.js"

export default class Chart { 

    constructor(options) {
        this.options = options
        this.spaceFromBorders = 25
    }

    SelectContainerElement(){
        this.container = d3.select(this.options.element)
    }

    AppendSVGtoContainerElement(){
        this.container
          .append("svg")
          .attr("width", this.options.element.clientWidth)
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

    AddGroupToSVG(){
        if (this.options.chartType == "BarChart" || this.options.chartType == "LineChart") {
            this.g = this.container.select("svg").append('g')
            // Put the group within the view of the svg 
            .attr('transform', `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`);
        } 
        else if (this.options.chartType == "PieChart") {
            this.g = this.container.select("svg").append('g')
            // Put the group within the view of the svg 
            //.attr('transform', `translate(${this.dimensions.margin.left / 3.5}, ${-this.dimensions.margin.bottom + 20})`);
            .attr('transform', `translate(${this.dimensions.radius * 1.5}, ${this.dimensions.radius * 1.5})`);
        } 
    }

    BuildScales(){
        this.xScale = Axes.CreateDefaultXScale(this.options.data, this.dimensions.innerWidth)
        this.yScale = Axes.CreateDefaultYScale(this.options.data, this.dimensions.innerHeight)
    }

    // Pass in regular parameters
    BuildAxes(){ 
        this.BuildScales();
        if (this.options.chartType == "LineChart") {
            Axes.AppendGridLineForX(this.xScale, this.dimensions.innerHeight, this.g)
        }
        Axes.AppendGridLineForY(this.yScale, this.dimensions.innerWidth, this.g)
        Axes.AppendLeftAxisToGraph(this.yScale, this.g)
        Axes.AppendBottomAxisToGraph(this.xScale, this.dimensions.innerHeight, this.g)
        
    }

    UpdateAxes(){
        Axes.UpdateBottomAxisInGraph(
            this.xScale.domain(this.options.data.map(d => d.title)), 
            this.dimensions.innerHeight, 
            this.g);
        Axes.UpdateLeftAxisToGraph(
            this.yScale.domain([(d3.max(this.options.data, d => d.value)), 0]), 
            this.g);
        Axes.UpdateGridLineForY(this.yScale, this.dimensions.innerWidth, this.g)
    }

    // Based on overlay
    Resize(){

    }

}