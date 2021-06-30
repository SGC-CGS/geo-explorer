import Chart from "./chart.js";
import Axes from "./axes.js";

/**
 * Line Chart module
 * @module charts/linechart
 * @extends Chart
 * @description The overall goal is to draw the lineChart onto the CSGE.
 * Step one: Append the necessary groups and path
 * Step two: Define the scales and use them for building the line chart. The 
 * text on the bottom axis requires pre-processing to avoid texting leaving the SVG. 
 * Step three: Add line to the chart
 * @note Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 */
export default class LineChart extends Chart{ 

    /**
     * Set up line chart
     * @param {object} options - Chart div object
     * @returns {void}
     */    
    constructor(options) {
        super(options);

        // REVIEW: Handle multiple formats
        this.timeParser = d3.timeParse("%d-%m-%y");

        // Append the x grid line group
        this.g.append("g")
              .classed("x axis-grid", true)
              .attr('transform', 'translate(0,' + this.dimensions.innerHeight + ')');

        // Append the y grid line group
        this.g.append("g")
              .classed("y axis-grid", true)
              .attr("transform", "translate(0,0)");

        // Append the left (vertical) axis group
        this.g.append('g')
        .classed("left axis", true);
    
        // Append the bottom (horizontal) axis group
        this.g.append('g')
            .classed("bottom axis", true)
            .attr("transform", `translate(0, ${this.dimensions.innerHeight})`);

        // Append the line path
        this.line = this.g.append("path");

        this.CreateDropline();
    }

    /**
     * Create the dropline to be added the the chart to show the data being hovered over
     */
    CreateDropline() {
        let timeParser = this.timeParser;

        let bisectValue = d3.bisector(function(d, x) { return timeParser(d.label) - x; }).left;

        this.dropline = this.g.append("g")
            .attr("class", "dropline")
            .style("display", "none");

        this.dropline.append("line")
            .attr("class", "hover-line")
            .attr("y1", 0)
            .attr("y2", this.dimensions.innerHeight);

        this.g.append("rect")
            .attr("class", "chart-overlay")
            .attr("width", this.dimensions.innerWidth)
            .attr("height", this.dimensions.innerHeight)
            .on("mouseover",  () => { this.dropline.style("display", null); })
            .on("mouseout", () =>  { 
                this.dropline.style("display", "none");

                this.tooltip.Hide();
            })
            .on("mousemove", function(event) {
                if(this.data == undefined || this.data.length == 1) return;

                // Get closest data point given mouse position
                let invert = this.xScale.invert(d3.pointer(event)[0]);

                let index = bisectValue(this.data, invert);

                let d0 = this.data[index - 1];

                let d1 = this.data[index];

                let d = invert - timeParser(d0.label) > timeParser(d1.label) - invert ? d1 : d0;

                // Show the vertical line and tooltip based on mouse position
                this.dropline.attr("transform", `translate(${this.xScale(timeParser(d.label))} ,0)`);

                this.tooltip.Show(event.pageX + 10, event.pageY - 28);

                this.tooltip.content = `${d.label}` + "<br/>" + `Value: ` + `${d.value}`;
            }.bind(this));
    }

    /**
     * Draw line chart
     * @returns {void}
     */
    Draw(){

        // Sample data for testing
        this.data = [
            {label: "26-03-12", value: 406.98}, {label: "27-04-12", value: 614.48},
            {label: "28-05-12", value: 217.62}, {label: "29-06-12", value: 900.86},
            {label: "28-07-12", value: 1500.62}, {label: "29-08-12", value: 700.86},
            {label: "28-09-12", value: 800.62}, {label: "29-10-12", value: 500.86},
            {label: "28-11-12", value: 300.62}, {label: "29-12-12", value: 200.86}
        ];

        // Create scales for the x and y axes 
        this.xScale = Axes.CreateTimeXScale(this.data, this.dimensions.innerWidth, this.timeParser);
        this.yScale = Axes.CreateLinearYScale(this.data, this.dimensions.innerHeight);

        // Draw horitzontal and vertical gridlines
        this.g.selectAll("g.x.axis-grid")
            .call(Axes.GridLineVertical(this.xScale, this.dimensions.innerHeight));

        this.g.selectAll("g.y.axis-grid")
            .call(Axes.GridLineHorizontal(this.yScale, this.dimensions.innerWidth));

        // Draw axes
        this.g
			.selectAll("g.left.axis")
			.call(d3.axisLeft(this.yScale).ticks());

        this.g
            .selectAll("g.bottom.axis")
            .call(d3.axisBottom(this.xScale))
            .selectAll("text").attr("transform", `translate(-10, 0)rotate(-45)`)
            .style("text-anchor", "end");

        // Draw line between datapoints
        this.AppendLineToChart();
    }

    /**
     * Generate a multi-connected line and append it to the chart with transitions. 
     * Needs to be redrawn every time new data is updated.
     * @returns {void}
     */
     AppendLineToChart() {
        // Create line generator
        let lineGenerator = d3.line()
							  .x((d) => this.xScale(this.timeParser(d.label))) 
							  .y((d) =>  this.yScale(d.value));

        // Add the line
        this.line
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator);

        // Create the transition
        let totalLength = this.line.node().getTotalLength();

        this.line.attr("stroke-dasharray", totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);
    }
}