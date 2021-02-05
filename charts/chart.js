import Axes from "./axes.js"

export default class Chart { 

    constructor(options) {
        this.options = options
        this.data = options.data
        this.element = options.element
    }

    SelectContainerElement(){
        this.container = d3.select(this.element)
    }

    AppendSVGtoContainerElement(){
        // grab from div
        this.container
          .append("svg")
          .attr("width", this.element.clientWidth)
          // TODO: Avoid text escaping SVG
          .attr("height", +this.element.getAttribute("height"))
    }

    SetDimensions(){
        let dimensions = this.options.dimensions || false;
        if (!dimensions){
            var margin = {top: 20, bottom: 70, right: 0, left: 40};
            var width = +this.container.select("svg").attr('width') - 30;
            var height = +this.container.select("svg").attr('height');
            dimensions = {
                margin : margin,
                width:  width,
                height: height,
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
        this.g = this.container.select("svg").append('g')
            // Put the group within the view of the svg 
            .attr('transform', `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`);
    }

    // Pass in regular parameters
    BuildAxes(){ 
        this.xScale = Axes.CreateDefaultXScale(this.data, this.options.xName, this.dimensions.innerWidth)
        this.yScale = Axes.CreateDefaultYScale(this.data, this.options.yName, this.dimensions.innerHeight)
        Axes.AppendGridLineForY(this.yScale, this.dimensions.innerWidth, this.g)
        Axes.AppendLeftAxisToGraph(this.yScale, this.g)
        Axes.AppendBottomAxisToGraph(this.xScale, this.dimensions.innerHeight, this.g)
    }

    Redraw(){
        // Scales must be redone
        //

    }

    Resize(){

    }

    // TODO: tool tip

    // Need a way to destroy everything in the this of the bar chart?



}