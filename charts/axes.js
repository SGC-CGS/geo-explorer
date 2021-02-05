export default class Axes { 

    static CreateDefaultXScale(data, xName, innerWidth){
        return d3.scaleBand()
            // Map values into correct pixel positions
            .domain(data.map(d => d[xName]))
            // Map values from start of data array to end of data array
            .range([0, innerWidth])
            .padding(0.1)

    }

    static CreateDefaultYScale(data, yName, innerHeight){
        return d3.scaleLinear()
            // max at the top of the y-axis
            // 0 at the bottom of the y-axis
            .domain([(d3.max(data, d => d[yName])), 0])
            // 0 on bottom of y-axis
            // max at top of y-axis
            .range([0, innerHeight])
            // .nice() rounds the domain to nice values
            .nice()

    }

    // Horizontal lines onto graph 
    static AppendGridLineForY(yScale, innerWidth, g){
        const y = d3.axisLeft(yScale)
            // left axis should have same number of ticks 
            .tickSize(-innerWidth).ticks()
            .tickFormat("")

        g.append('g').call(y)
            .classed("y axis-grid", true)
            .attr("transform", "translate(0,0)")
    }

    // Vertical lines onto graph
    static AppendGridLineForX(xScale, innerHeight, g){
        const x = d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat("")

        g.append('g').call(x)
            .classed("x axis-grid", true)
            .attr('transform', 'translate(0,' + innerHeight + ')')
    }

    // Vertical axis
    static AppendLeftAxisToGraph(yScale, g){
        g.append('g')
            .call(d3.axisLeft(yScale).ticks())
            .classed("y axis", true)
    }

    // Horizontal axis
    static AppendBottomAxisToGraph(xScale, innerHeight, g){
        g
          .append("g")
          .call(d3.axisBottom(xScale))
          .attr("transform", `translate(0, ${innerHeight})`)
          .classed("x axis", true)
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          // The labels come from xScale.domain()
          .text(d => {
              // So the label doesn't exit the SVG
              if(d.length >= 14){
                d = d.substring(0, 11) + "..."
              }
              return d
          })
          .style("text-anchor", "end");

    
    }
}
