export default class Axes { 

    static CreateBandXScale(data, innerWidth){
        return d3.scaleBand()
            // Map values into correct pixel positions
            .domain(data.map(d => d.title))
            // Map values from start of data array to end of data array
            .range([0, innerWidth])
            .padding(0.1)
    }

    static CreateLinearXScale(data, innerWidth){
        return d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, innerWidth])
    }

    static CreateLinearYScale(data, innerHeight){
        // Could also use .domain(d3.extent(data, (d) => d.value ))
        return d3.scaleLinear()
            // max at the top of the y-axis
            // 0 at the bottom of the y-axis
            .domain([(d3.max(data, d => d.value)), 0])
            // 0 on bottom of y-axis
            // max at top of y-axis
            .range([0, innerHeight])
            // .nice() rounds the domain to nice values
            .nice()
    }

    // Horizontal lines onto graph 
    static GridLineY(yScale, innerWidth) {
        return d3.axisLeft(yScale)
        // left axis should have same number of ticks 
        .tickSize(-innerWidth).ticks()
        .tickFormat("")
    }
    
    static AppendGridLineForY(yScale, innerWidth, g){
        let y = this.GridLineY(yScale, innerWidth);

        g.append('g').call(y)
            .classed("y axis-grid", true)
            .attr("transform", "translate(0,0)")
    }

    static UpdateGridLineForY(yScale, innerWidth, g){
        let y = this.GridLineY(yScale, innerWidth);

        g.selectAll("g.y.axis-grid").call(y)
            .attr("transform", "translate(0,0)")
    }

    // Vertical lines onto graph
    static GridLineX(xScale, innerHeight) {
        return d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
    }

    static AppendGridLineForX(xScale, innerHeight, g){
        let x = this.GridLineX(xScale, innerHeight);

        g.append('g')
            .call(x)
            .classed("x axis-grid", true)
            .attr('transform', 'translate(0,' + innerHeight + ')');
    }

    static UpdateGridLineForX(xScale, innerHeight, g){
        let x = this.GridLineX(xScale, innerHeight);

        g.selectAll("g.x.axis-grid")
            .call(x)
            .attr('transform', 'translate(0,' + innerHeight + ')');
    }
    
    // Vertical axis
    static AppendLeftAxisToGraph(yScale, g){
        g.append('g')
            .call(d3.axisLeft(yScale).ticks())
            .classed("y axis", true)
    }

    static UpdateLeftAxisToGraph(yScale, g){
        g.selectAll('g.y.axis')
            .call(d3.axisLeft(yScale).ticks())
    }

    // Horizontal axis
    static AppendBottomAxisToGraph(xScale, innerHeight, g){
        this.SetBottomAxisAttributes(xScale, innerHeight, g.append("g").classed("x axis", true))
    }

    static UpdateBottomAxisInGraph(xScale, innerHeight, g){
        this.SetBottomAxisAttributes(xScale, innerHeight, g.selectAll("g.x.axis"))
    }

    static SetBottomAxisAttributes (xScale, innerHeight, g) {
        g.call(d3.axisBottom(xScale))
        .attr("transform", `translate(0, ${innerHeight})`)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .text(d => {
            if(d.length >= 16){
                d = d.substring(0, 13) + "..."
            }
            return d
        })
        .style("text-anchor", "end");
    }
}
