import Templated from '../../components/templated.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Requests from '../../tools/requests.js';
import StylerBreak from './styler-break.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Styler", class Styler extends Templated {

	/**
	 * Get/set opacity
	 */
	 set Opacity(value) {
		this.Elem('sOpacity').value = value * 100;
	}
	
	get Opacity() {
		return this.Elem('sOpacity').value / 100;
	}

	/**
	 * Return text for styler widget in both languages
	 * @returns {object.<string, string>} Styler widget text for each language
	 */		
	static Nls(nls) {
		nls.Add("Styler_Title", "en", "Change map style");
		nls.Add("Styler_Title", "fr", "Modifier le style de la carte");
		nls.Add("Styler_Method", "en", "Classification method");
		nls.Add("Styler_Method", "fr", "Méthode de classification");
		nls.Add("Styler_Color_Scheme", "en", "Color Schemes");
		nls.Add("Styler_Color_Scheme", "fr", "Gamme de schèmas");
		nls.Add("Styler_Style", "en", "Map Legend");
		nls.Add("Styler_Style", "fr", "Légende de la carte");
		nls.Add("Styler_Method_Equal", "en", "Equal intervals");
		nls.Add("Styler_Method_Equal", "fr", "Intervalles égaux");
		nls.Add("Styler_Method_Natural", "en", "Natural breaks");
		nls.Add("Styler_Method_Natural", "fr", "Bornes naturelles");
		nls.Add("Styler_Method_Quantile", "en", "Quantiles");
		nls.Add("Styler_Method_Quantile", "fr", "Quantiles");
		nls.Add("Styler_Max_Lt_Min", "en", "New maximum value is less than the current minimum value for the layer. Input a higher value.");
		nls.Add("Styler_Max_Lt_Min", "fr", "La nouvelle valeur maximale est inférieure à la valeur minimale actuelle pour la couche. Saisir une valeur plus élevée.");
		nls.Add("Styler_Max_Gt_Next", "en", "New maximum value exceeds the next range's maximum value. Input a lower value or increase the next range first.");
		nls.Add("Styler_Max_Gt_Next", "fr", "La nouvelle valeur maximale dépasse la valeur maximale de la plage suivante. Saisir une valeur inférieure ou augmenter d’abord la plage suivante.");
		nls.Add("Legend_Opacity", "en", "Opacity");
		nls.Add("Legend_Opacity", "fr", "Opacité");	
		nls.Add("Legend_Opacity_Less", "en", "Less");
		nls.Add("Legend_Opacity_Less", "fr", "Moins");	
		nls.Add("Legend_Opacity_More", "en", "More");
		nls.Add("Legend_Opacity_More", "fr", "Plus");
		nls.Add("Styler_Button_Apply", "en", "Apply");
		nls.Add("Styler_Button_Apply", "fr", "Appliquer");		
		nls.Add("Styler_Button_Close", "en", "Cancel");
		nls.Add("Styler_Button_Close", "fr", "Annuler");
	}

	/**
	 * Call constructor of base class (Templated) and initialize styler widget
	 * @param {object} container - div styler container and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)	  
	 * @returns {void}
	 */	
	constructor(container, options) {
		super(container, options);

		this.metadata = null;
		this.breaks = null;
		this.numBreaks = 0;
		this.minBreaks = 3;
		this.maxBreaks = 8;

		this.Elem('sMethod').Add(this.Nls("Styler_Method_Equal"), null, { id:1, algo:"esriClassifyEqualInterval" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Natural"), null, { id:2, algo:"esriClassifyNaturalBreaks" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Quantile"), null, { id:3, algo:"esriClassifyQuantile" });

		this.Node('sMethod').On("Change", this.onMethod_Change.bind(this));

		this.Node('sOpacity').On("change", this.OnOpacity_Changed.bind(this));

		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));

		this.addListenersToScheme();
	}

	addListenersToScheme() {
		let collapsibleBtn = this.Node("collapsible").elem;

		collapsibleBtn.addEventListener("click", function (ev) {

			ev.target.classList.toggle("active");

			let content = ev.target.nextElementSibling;

			if (content.style.maxHeight) {
				content.style.maxHeight = null;
			} else {
				content.style.maxHeight = content.scrollHeight + 'px';
			}
			
		}.bind(this));
	}

	/**
	 * Load class method, breaks, and colours to styler widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {
		this.context = context;

		var n = context.sublayer.renderer.classBreakInfos.length;

		var idx = this.Elem('sMethod').FindIndex(i => i.algo === context.metadata.breaks.algo);

		this.Elem("sMethod").value = idx;
		this.numBreaks = n;

		this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);

		if(this.currentScheme == null) {
			this.addColorPalettesToStyler();
		}
	}

	addColorPalettesToStyler() {
		this.colorPaletteAdder(this.Node("divergent").elem, [
			colorbrewer.Blues,
			colorbrewer.Greens,
			colorbrewer.Greys,
			colorbrewer.Oranges,
			colorbrewer.Purples,
			colorbrewer.Reds,
			colorbrewer.BrBG,
			colorbrewer.PiYG,
			colorbrewer.PRGn,
			colorbrewer.PuOr,
			colorbrewer.RdBu,
			colorbrewer.RdGy,
			colorbrewer.RdYlGn
		]);
	}

	colorPaletteAdder(dom, colorScheme) {
		for (let index = 0; index < colorScheme.length; index++) {

			// Create color palette 
			let palette = document.createElement('span');
			palette.className = "palette";
			// Tell the user the color
			palette.addEventListener("click", () => {
				this.context.metadata.colors.palette = colorScheme[index][this.numBreaks];
				this.currentScheme = colorScheme[index];

				this.Refresh();
			})

			// Add 5 swatches to the palette
			const elem = colorScheme[index][5];

			for (let index = 0; index < elem.length; index++) {
				const color = elem[index];
				let swatch = document.createElement('span');
				swatch.className = "swatch";
				swatch.style.backgroundColor = color;
	
				palette.appendChild(swatch);
				
			}
			dom.appendChild(palette);
		}
	}

	/**
	 * Create break object from class break info
	 * @param {object[]} classBreakInfos - Object describing class breaks
	 * @returns {void}
	 */	
	LoadClassBreaks(classBreakInfos) {
		Dom.Empty(this.Elem("breaks"));

		this.breaks = classBreakInfos.map((c, i) => {
	
			var brk = new StylerBreak(this.Elem('breaks'), c);

			brk.On("apply", this.OnBreak_Apply.bind(this, i));

			this.UpdateBreakRemoveAndAdd(brk, i);

			return brk;
		});
	}

	/**
	 * Make calls for the add or remove class breaks
	 * @param {object} brk - Object returned from styler.break.js
	 * @param {object} i - index of the class break
	 * @returns {void}
	 */
	UpdateBreakRemoveAndAdd(brk, i) {
		let lastBreak = (i == this.numBreaks -1);

		let eRemove = brk.Node("eRemove").elem;
		let eAdd = brk.Node("eAdd").elem;

		if (lastBreak && (i != this.minBreaks - 1)) {
			brk.On("remove", this.OnBreak_Remove.bind(this));
			eRemove.style.display =  "";
		} else {
			eRemove.style.display =  "none";
		}

		if (lastBreak && (i != this.maxBreaks - 1)) {
			brk.On("add", this.OnBreak_Add.bind(this));
			eAdd.style.display =  "";
		} else {
			eAdd.style.display =  "none";
		}
	}

	/**
	 * Make a call to add a class break
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnBreak_Add(ev) {
		this.context.metadata.breaks.n += 1;
		this.numBreaks = this.context.metadata.breaks.n;

		if (this.currentScheme != undefined) {
			this.context.metadata.colors.palette = this.currentScheme[this.numBreaks];
		}

		this.Refresh();
	}

	/**
	 * Apply new break value when checkmark next to break is clicked
	 * @param {number} i - Index number of break value to change
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnBreak_Apply(i, ev) {
		var curr = this.breaks[i];
		var next = this.breaks[i + 1];

		if (next && ev.value > next.Max) alert(this.Nls("Styler_Max_Gt_Next"));

		else if (ev.value < curr.Min) alert(this.Nls("Styler_Max_Lt_Min"));

		else {
			ev.target.Save();
			ev.target.StopEdit();

			next.Min = curr.Max;
		}
	}

	/**
	 * Make a call to remove a class break
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnBreak_Remove(ev) {
		this.context.metadata.breaks.n -= 1;
		this.numBreaks = this.context.metadata.breaks.n;

		if (this.currentScheme != undefined) {
			this.context.metadata.colors.palette = this.currentScheme[this.numBreaks];
		}

		this.Refresh();
	}

	/**
	 * Change classification method
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	onMethod_Change(ev) {
		this.context.metadata.breaks.algo = ev.target.selected.algo;

		this.Refresh();
	}

	/**
	 * Update map when apply button is clicked on styler widget
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnApply_Click(ev) {
		this.context.Commit();

		var json = this.context.sublayer.renderer.toJSON();

		json.min = this.breaks[0].min;

		var symbol = this.context.sublayer.renderer.classBreakInfos[0].symbol;

		var breaks = this.breaks.map(b => {
			json.classBreakInfos = this.breaks.map(b => {
				symbol.color = b.Color;

				return {
					description : "",
					label : `${b.Min} - ${b.Max}`,
					classMaxValue: b.Max,
					symbol: symbol.toJSON()
				}
			});
		});

		var renderer = ESRI.renderers.support.jsonUtils.fromJSON(json);

		this.Emit("Change", { renderer:renderer });
	}

	/**
	 * Close styler widget when Cancel button is clicked
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnClose_Click(ev) {
		this.context.Revert();

		this.Emit("Close");

		this.Update(this.context);
	}

	/**
	 * Emits error when there is a problem loading class breaks
	 * @param {object} error - Error object
	 * @returns {void}
	 */
	OnRequests_Error (error) {
		this.Emit("Error", { error:error });
	}

	/**
	 * Refresh class breaks based on currently selected options
	 * @returns {void}
	 */
	Refresh() {
		this.Emit("Busy");

		Requests.Renderer(this.context).then(sublayer => {
			this.Emit("Idle");

			this.LoadClassBreaks(sublayer.renderer.classBreakInfos);
		}, error => this.OnRequests_Error(error));
	}

	/**
	 * Respond to change in opacity slider
	 * @param {object} ev - Event received from opacity slider
	 * @returns {void}
	 */
	 OnOpacity_Changed(ev) {
		this.Emit("Opacity", { opacity:this.Opacity });
	}

	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	Template() {
		return	"<label>nls(Styler_Style)</label>" +
				"<table handle='breaks' class='breaks-container'>" +
				// Class breaks go here, dynamically created
				"</table>" +

				"<label></label>" +

				"<div class='collapsibles' handle='collapsibles'>" +
					"<button handle='collapsible' class='collapsible'>Change Map Style</button>" +
						"<div handle='content' class='content'>" +
							"<label>nls(Styler_Method)</label>" +
							"<div handle='sMethod' widget='Basic.Components.Select'></div>" +

							// New color style (divergent, sequential, categorical)
							"<label>nls(Styler_Color_Scheme)</label>" +
							"<div handle='divergent'></div>" +

							// Opacity 
							"<label>nls(Legend_Opacity)</label>" +
							"<div class='opacity-container'>" +
								"<input handle='sOpacity' type='range' class='opacity' min=0 max=100 />" + 
								"<div class='opacity-labels-container'>" +
									"<label>nls(Legend_Opacity_Less)</label>" +
									"<label>nls(Legend_Opacity_More)</label>" +
								"</div>" +
							"</div>" +
						"</div>"+
				"</div>" +

				"<div class='button-container'>" +
							"<button handle='bApply' class='button-label button-apply'>nls(Styler_Button_Apply)</button>" +
							"<button handle='bClose' class='button-label button-close'>nls(Styler_Button_Close)</button>" +
				"</div>";
	}
})
