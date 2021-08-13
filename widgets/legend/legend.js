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
export default Core.Templatable("Api.Widgets.Legend", class wLegend extends Widget {

	/** 
	 * Get / set the widget's title
	*/	
	get title() { return this.Nls("Legend_Title") }
	
    constructor(...config) {
        super(...config);
    }
	
	Localize(nls) {
		nls.Add("Legend_Title", "en", "Map legend");
		nls.Add("Legend_Title", "fr", "Légende cartographique");
	}

    /**
     * @description
     * Update and load class breaks from the context
     * @param {String} context - context
     */
    Update(renderer) {
        this.LoadClassBreaks(renderer);
		
		this.breaks.forEach((brk, i) => brk.On("visibility", this.OnCheckboxUpdate.bind(this, i)));
    }

    /**
     * @description
     * Load the class breaks from renderer settings
     * @param {String} renderer - renderer object
     * @param {String} uom - unit of measure (optional)
     */
    LoadClassBreaks(renderer, uom) {
		if (uom) this.Elem("uom").innerHTML = uom;
		
        Dom.Empty(this.Elem("breaks"));

        this.breaks = renderer.classBreakInfos.map((c, i) => {
            if (c.maxValue == null) c.maxValue = "";
            if (c.minValue == null) c.minValue = "0";
            
			return this.MakeClassBreak(c, uom);
        });
		
		this.breaks.push(new DefaultBreak({ symbol:renderer.defaultSymbol }));
		
		this.breaks.forEach(brk => brk.container = this.Elem("breaks"));
    }
	
	MakeClassBreak(info, uom) {
		return new LegendBreak(info, uom);
	}
	
    EmptyClassBreaks() {
        Dom.Empty(this.Elem("breaks"));
    }
	
	EnableVisibilityIcon(enabled) {
		this.breaks.forEach(brk => brk.EnableVisibilityIcon(enabled));
	}

	/**
	 * Emit whether the checkbox is filled or not and the index of the break so that 
	 * the feature's alpha value may be updated
	 * @param {*} i - Index for the break whose alpha value needs to be updated
	 * @param {*} ev - Event received from the checkbox
	 */
	OnCheckboxUpdate(i, ev) {
		this.Emit("visibility", { checked:ev.checked, breakIndex:i });
	}
	
    HTML() {
        return "<div handle='uom'></div>" + 
			   "<div handle='breaks' class='breaks-container'></div>";
    }
})