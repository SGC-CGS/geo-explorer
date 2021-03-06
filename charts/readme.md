# D3 for Data Visualization in CSGE

## Overview

### D3

D3 binds data and graphical elements to DOMs. 

### Vector Graphics and SVG

Vector graphics can be edited in a text editor since there is no worry regarding pixelation (rasters). Scalable Vector Graphics (SVG) have graphical elements to render images, such as lines, circles, rectangles, polygons, etc. Styling an SVG can be done through using CSS. 

Consider an SVG as some sort of a [viewport](https://en.wikipedia.org/wiki/Viewport) (with some defined width x height) where you can append graphical elements. For example, the ```<g>``` element can be used to group graphics together within an SVG. 

### Shapes (or Elements)

Thus far the only two shaped used in this repo are rectangles and circles.

###### Rectangle 
- Referred to as ```rect``` in D3
- The following information is required:
  - position
  - width
  - height

###### Circle
- Referred to as ```circle``` in D3
- The following information is required:
  - point coordinates (cx, cy)
  - radius

### Styling non-SVG Elements

There exists two ways to modify a non-SVG element's styling: 

1. ```.attr()```
   - Modify attributes of an element 
2. ```.style()```
   - Modify CSS of an element

**Note:** Before modifying a non-SVG element's styling, be sure to use ```.select()```. 

### Binding Data

Many important methods exist in D3 for working with data:

1. ```.selectAll().data()```
   - Begin by selecting an element in the SVG and then data join to pass in your array of data
2. ```enter().append()```
   - Add any sort of element to the DOM
     - Examples: 
       - ```rect```
       - ```circle```
       - ```<svg>```
       - ```<p>```
   - In some cases you could use ```.merge()``` after such command to get existing data 
3. ```.exit().remove()``` 
   - Remove unwanted elements (e.g., if the data array has shrunken in size)

### Scales

Obviously scale selection will depend on what you aim to visualize, so I won't go too in-depth on scales in D3 and the many functions that exist. 

Scales need domain, range, and sometimes padding (based on preference and / or the type of scale function you used). 

###### Domain
- Set of values to be mapped. Note that the domain will vary based on what you aim to map
- Examples:
  - Mapping ```.domain(data.map(d => d[AxisLabel]))```
  - Max ```.domain([(d3.max(data, d => d[AxisLabel])), 0])```
    - The domain can also be domain(max, 0), domain(0, max), domain(0, 100), etc. 

###### Range 
- Think in terms of pixel positioning
- Set of values to return 
  - Examples:
    - (x, y) pixel position
- Can be used for setting max width or height of a rectangle 

###### Padding
- Spacing between elements

**Note:** You'll need one scale for ```x```, and one scale for ```y```. 

### Axis

An axis can be left, right, bottom, and top for orientation. You can also modify the tick marks placed on an axis. 

Examples:
- ```d3.axisLeft()``` would be composed of your ```y scale``` to produce a ```y-axis```.

### Transitions

Animate DOM changes for a certain amount of milliseconds 

Command: ```transition().duration()```

### Margin Convention 

As you may know, the origin point in computer graphics is the top left corner. When using a method such as  ```.attr('transform', 'translate('tx', 'ty')')```, a selected element will be translated from the top left corner of the container it is in. The ```tx``` translates along the x-axis to the right of the origin point whereas ```ty``` pushes down along the y-axis.

Other things to consider:
- Width moves across the x-axis
  - Inner width is similar
- Height moves across the y-axis
  - Inner Height is similar

![](./Margin.png)

**Source:** [Adam Mescher (2019)](https://gist.github.com/AdamMescher/d6f432d169743937f191cab778462d38)

**Modified By:** Omar Kawach (2021)

### Transitions 

## TODO
- Add chart icon to side panel
- Make chart unavailable if no polygon clicked (alert)?
  - Add model-container alert like the one in CSGE V1 
    - Text: "No charts available. Select one or more locations to generate charts."
- Overlay and widget should use an association instead of inheritance 
- Develop sub charts (related indicator? Remove related indicator value when clicked?)
- Download button? https://www.quebec.ca/en/health/health-issues/a-z/2019-coronavirus/situation-coronavirus-in-quebec/
- Chart type up to SME
- Handle overcrowding in charts
- Add axis titles?
- Tick marks get weird

## Author(s)

Omar Kawach

## References

[University of Wisconsin](https://website.education.wisc.edu/~swu28/d3t/concept.html) - A Beginner's Guide to Using D3

[D3.js Graph Gallery](https://www.d3-graph-gallery.com/barplot) - Barchart

[Adam Janes](https://davidwalsh.name/learning-d3) - Learning D3

[D3](https://github.com/d3/d3/blob/master/API.md) - API Reference
