import Templated from '../../geo-explorer/components/templated.js';
import Core from '../../geo-explorer/tools/core.js';
import Dom from '../../geo-explorer/tools/dom.js';

import LegendBreak from '../../geo-explorer/widgets/legend/legend-break.js';
import DefaultBreak from '../../geo-explorer/widgets/legend/default-break.js';

export default Core.Templatable("App.Widgets.SimpleLegend", class Legend extends Templated {

    constructor(container, options) {
        super(container, options);
    }

    Update(context) {
        this.context = context;
        this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);
    }

    LoadClassBreaks(renderer) {
        Dom.Empty(this.Elem("breaks"));

        this.breaks = renderer.classBreakInfos.map((c, i) => {
            if (c.maxValue == null) c.maxValue = "";
            if (c.minValue == null) c.minValue = "0";
            
            return new LegendBreak(this.Elem('breaks'), c);
        });
		
		this.breaks.push(new DefaultBreak(this.Elem('breaks'), { symbol:renderer.defaultSymbol }));
    }
	        
    Template() {
        return "<table handle='breaks' class='breaks-container'></table>";
    }
})