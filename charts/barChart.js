import Chart from "./chart.js";

export default class BarChart extends Chart{ 

    // If we remove this constuctor it is still generated 
    // by default as it will call the parent constructor 
    // constructor(...args) {
    //     super(...args);
    //   }
    constructor(data, element, xName, yName) {
        // Call parent class constructor 
        super(data, element)
        this.xName = xName;
        this.yName = yName;

        this.CreateBarChart()

    }

    CreateBarChart(){
        // Call the parent functions here
        this.SelectContainerElement(this.element)
        this.AppendSVGtoContainerElement()
        this.SetDefaultDimensions()
        this.CreateXscale()
        this.CreateYscale()
        this.AddGroupToSVG()
        this.AppendGridlineForY()
        this.AppendLeftAxisToGraph()
        this.AppendBottomAxisToGraph()
        this.AppendRectanglesToGraph()
        this.Render()
        debugger;
    }

    


}