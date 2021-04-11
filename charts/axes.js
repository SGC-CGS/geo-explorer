/**
 * @description 
 * Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class Axes { 

	// TODO: For all relevant functions, consider having domain and range as parameters to function
	// For example, what happens if you have a scale that should go in the negatives?
	// TODO: innerWidth and innerHeight, in the context of these functions, don't really make any sense, width and height would do
    /**
     * @description
     * Create a new band scale for the x-axis with a domain composed of titles. 
     * @param {Object} data - The entire dataset for the chart 
     * @param {number} innerWidth - The extent to which the bands will be spread / mapped
     * @returns {d3.scaleBand() function}
     */
    static CreateBandXScale(data, innerWidth){
        return d3.scaleBand()
            // Map values into correct pixel positions
            .domain(data.map(d => d.title))
            // Map values from start of data array to end of data array
            .range([0, innerWidth])
            .padding(0.1)
    }

    /**
     * @todo
     * Update the domain later when a better dataset is available.
     * @description
     * Create a new linear scale for the x-axis.
     * @param {Object} data - The entire dataset for the chart 
     * @param {number} innerWidth - The extent to which parts of the domain will be spread / mapped
     * @returns {d3.scaleLinear() function}
     */
    static CreateLinearXScale(data, innerWidth){
        return d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, innerWidth])
    }

    /**
     * @description
     * Create a new linear scale for the y-axis with a domain composed of values.
     * @param {Object} data - The entire dataset for the chart 
     * @param {number} innerWidth - The extent to which the bands will be spread / mapped
     * @returns {d3.scaleLinear() function}
     */
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

    /**
     * @description
     * Create a function for the Left vertical axis on a chart. 
     * The function will be used to build the horizontal grid 
     * lines from the y-axis tick marks.
     * @param {*} yScale - The linear scale for the vertical axis
     * @param {*} innerWidth - The extent of the chart by width
     * @returns {d3.axisLeft() function}
     */
    static GridLineHorizontal(yScale, innerWidth) {
        return d3.axisLeft(yScale)
        // left axis should have same number of ticks 
        .tickSize(-innerWidth).ticks()
        .tickFormat("")
    }
    
    /**
     * @description
     * Create a function for the bottom horizontal axis on a chart. 
     * The function will be used to build the vertical grid 
     * lines from the x-axis tick marks.
     * @param {*} xScale - The linear scale for the horizontal axis
     * @param {*} innerHeight - The extent of the chart by height
     * @returns {d3.axisBottom() function}
     */
    static GridLineVertical(xScale, innerHeight) {
        return d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
    }
    
    /**
     * @description
     * Draw the bottom horizontal axis on the group element, and adjust the elements 
     * at the tick marks to not exceed the extent of the SVG.
     * @param {*} xScale - The linear scale for the bottom horizontal axis
     * @param {*} g - group element bottom horizontal axis
     */
	 // TODO: transform angles and anchor should be provided as parameters
	 // TODO: Consider more compact ways of accomplishing simple operations : 
	 //			Option 1: return d.length > 15 ? d.substring(0, 13) + "..." : d;
	 //			Option 2: if (d.length < 16) return d
	 //					  return d.substring(0, 13) + "..."
	 //		  Note: This is just coding style, if you prefer the way you wrote it, keep it that way.
	 // Note: Not sure this should be a utility function since it's so specific. Maybe it should be a chart specific function
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
