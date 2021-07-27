import Templated from '../../geo-explorer-api/components/templated.js';
import Core from '../../geo-explorer-api/tools/core.js';
import Dom from '../../geo-explorer-api/tools/dom.js';

import LegendBreak from '../../geo-explorer-api/widgets/legend/legend-break.js';
import DefaultBreak from '../../geo-explorer-api/widgets/legend/default-break.js';

/**
 * Simple Legend widget module
 * @module widgets/simpleLegend
 * @extends Templated
 * @description This class is a simple legend widget for the map.
 */
export default Core.Templatable("App.Widgets.SimpleLegend", class Legend extends Templated {

    constructor(container, options) {
        super(container, options);
    }

    /**
     * @description
     * Update and load class breaks from the context
     * @param {String} context - context
     */
    Update(context) {
        this.context = context;
        this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);
    }

    /**
     * @description
     * Load the class breaks from renderer settings
     * @param {String} renderer - renderer object
     */
    LoadClassBreaks(renderer, uom) {
		this.Elem("uom").innerHTML = uom;
		
        Dom.Empty(this.Elem("breaks"));

        this.breaks = renderer.classBreakInfos.map((c, i) => {
            if (c.maxValue == null) c.maxValue = "";
            if (c.minValue == null) c.minValue = "0";
            
            return new LegendBreak(this.Elem('breaks'), c, uom);
        });
		
		this.breaks.push(new DefaultBreak(this.Elem('breaks'), { symbol:renderer.defaultSymbol }));
    }

    EmptyClassBreaks() {
        Dom.Empty(this.Elem("breaks"));
    }
	
    Template() {
        return "<div handle='uom'></div>" + 
			   "<table handle='breaks' class='breaks-container'></table>";
    }
})