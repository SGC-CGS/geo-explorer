import Chart from "./chart.js";

export default class ScatterPlot extends Chart{ 

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

        this.CreateScatterPlot()

    }

    CreateScatterPlot(){
        // Call the parent functions here
        this.SelectContainerElement(this.element)
        this.AppendSVGtoContainerElement()
        this.SetDefaultDimensions()
        this.CreateXscale()
        this.CreateYscale()
        this.AddGroupToSVG()
        this.AppendGridlineForY()
        this.AppendGridlineForX()
        this.AppendLeftAxisToGraph()
        this.AppendBottomAxisToGraph()
        this.AppendRectanglesToGraph()
        this.Render()
        debugger;
    }

    


}