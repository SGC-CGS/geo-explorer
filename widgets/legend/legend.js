import Widget from '../../components/base/widget.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';

import LegendBreak from '../../widgets/legend/legend-break.js';
import DefaultBreak from '../../widgets/legend/default-break.js';

/**
 * Simple Legend widget module
 * @module widgets/Legend
 * @extends Widget
 * @description This class is a simple legend widget for the map.
 */
export default Core.Templatable("Api.Widgets.Legend", class Legend extends Widget {

    constructor(container) {
        super(container);
    }

    /**
     * @description
     * Update and load class breaks from the context
     * @param {String} context - context
     */
    Update(renderer) {
        this.LoadClassBreaks(renderer);
    }

    /**
     * @description
     * Load the class breaks from renderer settings
     * @param {String} renderer - renderer object
     */
    LoadClassBreaks(renderer, uom) {
		if (uom) this.Elem("uom").innerHTML = uom;
		
        Dom.Empty(this.Elem("breaks"));

        this.breaks = renderer.classBreakInfos.map((c, i) => {
            if (c.maxValue == null) c.maxValue = "";
            if (c.minValue == null) c.minValue = "0";
            
			return this.MakeClassBreak(this.Elem('breaks'), c, uom);
        });
		
		this.breaks.push(new DefaultBreak(this.Elem('breaks'), { symbol:renderer.defaultSymbol }));
    }
	
	MakeClassBreak(container, c, uom) {
		return new LegendBreak(this.Elem('breaks'), c, uom);
	}

    EmptyClassBreaks() {
        Dom.Empty(this.Elem("breaks"));
    }
	 
    HTML() {
        return "<div handle='uom'></div>" + 
			   "<div handle='breaks' class='breaks-container'></div>";
    }
})