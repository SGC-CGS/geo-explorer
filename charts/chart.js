export default class Chart { 

    constructor(data, element) {
        this.data = data;
        this.element = element;
    }

    // Parent functions that children can use

    SelectContainerElement(){
        this.container = d3.select(this.element)
    }

    AppendSVGtoContainerElement(){
        this.container
          .append("svg")
          .attr("width", 430)
          // TODO: Avoid text escaping SVG
          .attr("height", 300)
    }

    // Dimensions to work with
    SetDefaultDimensions(){
        this.margin = {top: 20, bottom: 70, right: 0, left: 40};
        // across x-axis
        this.width = +this.container.select("svg").attr('width') - 30;
        // across y-axis 
        this.height = +this.container.select("svg").attr('height');
        // overall width - left and right margin (think horizontal)
        this.innerWidth = this.width - this.margin.left - this.margin.right;
        // height minus top and bottom margins (think vertical)
        this.innerHeight = this.height - this.margin.top - this.margin.bottom; 
    }

    SetMargin(top, bottom, right, left){
        this.margin = {top: top, bottom: bottom, right: right, left: left};
    }

    SetWidth(width){ this.width = width; }
    
    SetHeight(height){ this.height = height; }

    SetInnerWidth(innerWidth){ this.innerWidth = innerWidth; }

    setInnerHeight(innerHeight){ this.innerHeight = innerHeight; }

    AddGroupToSVG(){
        this.g = this.container.select("svg").append('g')
            // x direction pushes right 
            // y direction moves down
            // Put the group within the view of the svg 
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    }

    // Add dashed lines on x and y axis to seperate data
    AppendGridlineForY(){
        const y = d3.axisLeft(this.yScale)
            .tickSize(-this.innerWidth).ticks(7)
            .tickFormat("")

        this.g.append('g').call(y)
            .classed("y axis-grid", true)
            .attr("transform", "translate(0,0)")
            .style("stroke-dasharray", ("3, 3")) 
    }

    AppendGridlineForX(){
        const x = d3.axisBottom(this.xScale)
            .tickSize(-this.innerHeight)
            .tickFormat("")

        this.g.append('g').call(x)
            .classed("x axis-grid", true)
            .attr('transform', 'translate(0,' + this.innerHeight + ')')
    }

    AppendLeftAxisToGraph(){
        this.g.append('g')
            .call(d3.axisLeft(this.yScale).ticks(7))
            .classed("y axis", true)
    }

    AppendBottomAxisToGraph(){
        // Update the SVG height if text extends outside the SVG borders 
        // Figure out issues with scientific notation
        let extendSVG = Math.floor(d3.max(this.data, d => d.city.toString().length / 10))
        let heightAdder = 0;
        for (let index = 0; index < extendSVG; index++) {
            heightAdder += 20;
        }
        this.container.select("svg").attr("height", this.height + heightAdder)

        this.g.append('g').call(d3.axisBottom(this.xScale))
        .attr('transform', `translate(0, ${this.innerHeight})`)
        .classed("x axis", true)
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
    }

    // Decide scale type by adding it as argument 
    CreateXscale(){
        this.xScale = d3.scaleBand()
        // Based on values, this will label the yScale
        // Map values into correct pixel positions
        .domain(this.data.map(d => d[this.xName]))
        // Arrange data elements from top to bottom
        // Approx 360 pixels wide
        .range([0, this.innerWidth])
        .padding(0.1)
    }

    CreateYscale(){
        this.yScale =  d3.scaleLinear()
        // domain(a,b) where a is the top and b is the bottom
        .domain([(d3.max(this.data, d => d[this.yName])), 0])
        // Max width of bar 
        // 72.5 height to 145 px
        .range([0, this.innerHeight])

    }

    AppendRectanglesToGraph(){
        this.g
        // Elements (rectangles)
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
        //   .attr('y', d => this.yScale(d[this.yName]))
        // Compute the width for each rectangle
        //.attr('width', d => this.xScale(d[this.xName]))
        .attr("width", this.xScale.bandwidth())
        // Compute width of single bar
        // The - 1 creates space between the bars
        .attr(
            "height",
            (d) => this.innerHeight - this.yScale(d[this.yName])
        )
        // We can add events
        // Revert to original fill after clicking
        .on("click", function () {
            d3.select(this).style("fill", "green");
        });
    }



    // create whats needed
    Render(){

    }
}