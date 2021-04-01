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
    static GridLineHorizontal(yScale, innerWidth) {
        return d3.axisLeft(yScale)
        // left axis should have same number of ticks 
        .tickSize(-innerWidth).ticks()
        .tickFormat("")
    }
    
    // Vertical lines onto graph
    static GridLineVertical(xScale, innerHeight) {
        return d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
    }
    
    // Horizontal axis
    static SetBottomAxisAttributes (xScale, g) {
        g.call(d3.axisBottom(xScale))
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
