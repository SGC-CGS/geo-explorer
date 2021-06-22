import Axes from "./axes.js"
import Tooltip from "../../geo-explorer-api/ui/tooltip.js"

/**
 * Chart module
 * @module charts/chart
 * @description The parent class for all chart types (bar, pie, etc.).
 * @note Please refer to the the README in the charts folder for 
 * more information on the overall workflow and overview of 
 * the D3 concepts. 
 */
export default class Chart { 

    /**
     * Get / set data object for selected polygons
     */
	set data(value) { this._data = value; }
	
	get data() { return this._data; }

    /**
     * Get SVG object from chart
     */
    get svg() { return this._svg; }

    /** 
     * Set up chart
     * @param {object} options - Chart div object
     * @returns {void}
    */
    constructor(options) {
		this.data = options.data;
        this.options = options;
		
        // Set a padding value for the dimensions
        this.padding = 25

        // A tooltip that will appear over some chart element
        this.tooltip = new Tooltip();

        // The container where chart elements will be held
        this.container = d3.select(this.options.element);

        this._svg = this.AppendSVGtoContainerElement();

        this.BuildDimensions();

        this.AddGroupToSVG();
    }

    /**
     * Get the scale colour scheme
     * @returns {GetColor~inner} scaleOrdinal with categorical colour scheme
     */
    GetColor() {
        return d3.scaleOrdinal(d3.schemeCategory20);
    }

    /**
     * Append an SVG element to the container
     * @returns {void}
     */
    AppendSVGtoContainerElement() {
        return this.container.append("svg")
					  .attr("width", +this.options.element.getAttribute("width"))
					  .attr("height", +this.options.element.getAttribute("height"));
    }

    /**
     * Use dimensions from options if specified, otherwise set up defaults.
     * @returns {void}
     */
    BuildDimensions() {
        this.dimensions = this.options.dimensions || null; 

        if (!this.dimensions) this.SetDefaultDimensions(); 
    }

    /**
     * Set the default dimensions of the chart
     * @returns {void}
     */
    SetDefaultDimensions() {
        let margin = {top: 20, bottom: 70, right: 0, left: 55};
        let width = +this.svg.attr("width") - this.padding;
        let height = +this.svg.attr("height") - this.padding;

		// Note: Not a big fan of holding variables (margin, width and height) and derived values (both inners)
		//		 What happens if width or height change? I wonder if it's worth it to build a "dimensions" object
		// 		 that handles these issues. I built an example, see dimensions.js. May be overkill for now though.
        this.dimensions = {
			margin : margin,
			width:  width,
			height: height,
			innerWidth: width - margin.left - margin.right,
			innerHeight : height - margin.top - margin.bottom
		}
    }

    /**
     * Append the graphics group to the SVG and set matching dimensions.
     * @returns {void}
     */
    AddGroupToSVG() {
        this.g = this.svg.append('g').attr(
            'transform', 
            `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`
        );
    }

    /**
     * Set the attributes of the bottom horizontal axis on the group element
     * @returns {void}
     */
     SetBottomAxisAttributes () {
        let translateX = -10;
        let angle = -45;
		
        this.g
            .selectAll("g.bottom.axis")
            .call(d3.axisBottom(this.xScale))
            .selectAll("text")
            .attr("transform", `translate(${translateX}, 0)rotate(${angle})`)
            // adjust elements at tick marks to not exceed the extent of the SVG.
            .text((d) => {
				return d.length > 15 ? d.substring(0, 13) + "..." : d; 
			})
            .style("text-anchor", "end");
    }

    /**
     * Show tooltip and update opacity when mouse enters chart element (bar, pie slice, scatterplot dot, etc.)
     * @param {String} title - Current chart element title
     * @param {String} value - Current chart element value
     * @param {Element} current - Current chart element (bar, pie slice, scatterplot dot, etc.)
     * @returns {void}
     */
    OnMouseEnter(title, value, current) {
        d3.select(current).style("opacity", 0.5);

        this.tooltip.content = `${title}` + "<br/>" + `Value: ` + `${value}`;
    }

    /**
     * When mouse moves, tooltip follows pointer within the chart element
     * @returns {void}
     */
    OnMouseMove() {
        this.tooltip.Show(d3.event.pageX + 10, d3.event.pageY - 28)
    }

    /**
     * Hide tooltip and update opacity when mouse leaves the chart element
     * @param {Element} current - Current chart element (pie slice, dot on scatter plot, etc.)
     * @returns {void}
     */
    OnMouseLeave(current) {
        d3.select(current).style("opacity", 1);
		
        this.tooltip.Hide()
    }
}