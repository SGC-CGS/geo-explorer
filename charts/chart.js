import Tooltip from "../../geo-explorer-api/ui/tooltip.js"
import Dimensions from "./components/dimensions.js";
import Evented from "../../geo-explorer-api/components/evented.js";

/**
 * Chart module
 * @module charts/chart
 * @description The parent class for all chart types (bar, pie, etc.).
 * @note Please refer to the the README in the charts folder for 
 * more information on the overall workflow and overview of 
 * the D3 concepts. 
 */
export default class Chart extends Evented { 

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
        super(options);

		this.data = options.data;
        this.options = options;
		
        // Set a padding value for the dimensions
        this.padding = 25

        // A tooltip that will appear over some chart element or axis element
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
    GetColor() { return d3.scaleOrdinal(d3.schemeCategory10); }

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
        let doesHaveDimensions = this.options.dimensions || null; 

        if (!doesHaveDimensions) {
            let height = +this.svg.attr("height") - this.padding;
            let width = +this.svg.attr("width") - this.padding;
            let margin = {top: 20, bottom: 70, right: 0, left: 40};

            this.dimensions = new Dimensions(height, width, margin);
        } else {
            let height = this.options.dimensions.height;
            let width = this.options.dimensions.margin.width;
            let margin = this.options.dimensions.margin;
            
            this.dimensions = new Dimensions(height, width, margin);
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
            .text(d => d.length > 15 ? d.substring(0, 13) + "..." : d)
            .style("text-anchor", "end")
            .on("mouseenter", (event, d) => this.tooltip.content = `${d}`)
            .on("mousemove", (event) =>  this.OnMouseMove(event))
            .on("mouseleave", () => this.tooltip.Hide());
    }

    /**
     * Set the attributes of the left vertical axis on the group element
     * @returns {void}
     */
    SetLeftAxisAttributes() {
        this.g
            .selectAll("g.left.axis")
            .call(d3.axisLeft(this.yScale).ticks())
            .selectAll("text")
            .text(function(d) { 
                let decimals = d.toString().split(".")[1];
                if(decimals != undefined && decimals.length >= 2) {
                    return this.AbbreviateNumber(d, 2); 
                } else {
                    return this.AbbreviateNumber(d, 0); 
                }
            }.bind(this))
            .style("text-anchor", "end");
    }

    /**
     * @credit D.Deriso on {@link https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn| Stack Overflow}
     * Ensures tick mark numbers do not exceed the extent of the SVG
     * @param {Number} num - Float or integer
     * @param {Number} fixed - Decimal places
     * @returns {Number} - An abbreviated number (if needed)
     */
    AbbreviateNumber(num, fixed) {
        if (num === 0) { return '0'; } // terminate early
        fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
        var b = (num).toPrecision(2).split("e"), // get power
            k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
            c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
            d = c < 0 ? c : Math.abs(c), 
            e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
        return e;
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

        this.Emit("Change", {hovered: title});
    }

    /**
     * When mouse moves, tooltip follows pointer within the chart element
     * @returns {void}
     */
    OnMouseMove(event) {
        this.tooltip.Show(event.pageX + 10, event.pageY - 28);
    }

    /**
     * Hide tooltip and update opacity when mouse leaves the chart element
     * @param {Element} current - Current chart element (pie slice, dot on scatter plot, etc.)
     * @returns {void}
     */
    OnMouseLeave(current) {
        d3.select(current).style("opacity", 1);
		
        this.tooltip.Hide();

        this.Emit("Change", {hovered: null});
    }
}