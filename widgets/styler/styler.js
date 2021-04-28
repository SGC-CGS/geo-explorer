import Templated from '../../components/templated.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Requests from '../../tools/requests.js';
import Picker from '../../ui/picker.js';
import StylerBreak from './styler-break.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Styler", class Styler extends Templated {

	/**
	 * Return text for styler widget in both languages
	 * @returns {object.<string, string>} Styler widget text for each language
	 */		
	static Nls(nls) {
		nls.Add("Styler_Title", "en", "Change map style");
		nls.Add("Styler_Title", "fr", "Modifier le style de la carte");
		nls.Add("Styler_Instructions_1", "en", "Use the options below to change how to render the indicator on the map. To confirm your changes, click 'Apply' at the end of the form.");
		nls.Add("Styler_Instructions_1", "fr", "Utiliser les options ci-dessous pour changer la façon dont l’indicateur apparaît sur la carte. Pour confirmer les changements, cliquer sur « Appliquer » en bas du formulaire.");
		nls.Add("Styler_Instructions_3", "en", "* Geographies with no data or that do not fit in the ranges below are transparent on the map but still interactive.");
		nls.Add("Styler_Instructions_3", "fr", "* Les régions géographiques n’ayant pas de données ou ne tenant pas dans les plages ci-dessous apparaissent en transparence sur la carte, mais sont toujours interactives.");
		nls.Add("Styler_Method", "en", "Classification method");
		nls.Add("Styler_Method", "fr", "Méthode de classification");
		nls.Add("Styler_Color_Scheme", "en", "Color Schemes");
		nls.Add("Styler_Color_Scheme", "fr", "Gamme de schèmas");
		nls.Add("Styler_Color_Range", "en", "Color range");
		nls.Add("Styler_Color_Range", "fr", "Gamme de couleurs");
		nls.Add("Styler_Color_Start", "en", "Start color");
		nls.Add("Styler_Color_Start", "fr", "Couleur de départ");
		nls.Add("Styler_Color_End", "en", "End color");
		nls.Add("Styler_Color_End", "fr", "Couleur de fin");
		nls.Add("Styler_Breaks", "en", "Number of breaks (1 to 10)");
		nls.Add("Styler_Breaks", "fr", "Nombre de bornes (1 à 10)");
		nls.Add("Styler_Style", "en", "Map style");
		nls.Add("Styler_Style", "fr", "Style de la carte");
		nls.Add("Styler_Method_Equal", "en", "Equal intervals");
		nls.Add("Styler_Method_Equal", "fr", "Intervalles égaux");
		nls.Add("Styler_Method_Natural", "en", "Natural breaks");
		nls.Add("Styler_Method_Natural", "fr", "Bornes naturelles");
		nls.Add("Styler_Method_Quantile", "en", "Quantiles");
		nls.Add("Styler_Method_Quantile", "fr", "Quantiles");
		nls.Add("Styler_Scheme_Divergent", "en", "Divergent");
		nls.Add("Styler_Scheme_Divergent", "fr", "Divergente");
		nls.Add("Styler_Scheme_Sequential", "en", "Sequential");
		nls.Add("Styler_Scheme_Sequential", "fr", "Séquentielle");
		nls.Add("Styler_Scheme_Categorical", "en", "Reverse");
		nls.Add("Styler_Scheme_Categorical", "fr", "Inverse");
		nls.Add("Styler_Max_Lt_Min", "en", "New maximum value is less than the current minimum value for the layer. Input a higher value.");
		nls.Add("Styler_Max_Lt_Min", "fr", "La nouvelle valeur maximale est inférieure à la valeur minimale actuelle pour la couche. Saisir une valeur plus élevée.");
		nls.Add("Styler_Max_Gt_Next", "en", "New maximum value exceeds the next range's maximum value. Input a lower value or increase the next range first.");
		nls.Add("Styler_Max_Gt_Next", "fr", "La nouvelle valeur maximale dépasse la valeur maximale de la plage suivante. Saisir une valeur inférieure ou augmenter d’abord la plage suivante.");
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

		this.Elem('sMethod').Add(this.Nls("Styler_Method_Equal"), null, { id:1, algo:"esriClassifyEqualInterval" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Natural"), null, { id:2, algo:"esriClassifyNaturalBreaks" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Quantile"), null, { id:3, algo:"esriClassifyQuantile" });

		this.Node('bColorS').On("Finished", this.OnPicker_Finished.bind(this));
		this.Node('bColorE').On("Finished", this.OnPicker_Finished.bind(this));

		var handler = function(ev) { this.onIBreaks_Change(ev); }.bind(this);

		this.Node('iBreaks').On("change", Core.Debounce(handler, 350));
		this.Node('sMethod').On("Change", this.onMethod_Change.bind(this));

		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));

		this.CreateColorPalettes();

		this.addColorPalettesToStyler();

		this.addListenersToScheme();
	}

	// TODO: Find a cleaner approach
	CreateColorPalettes() {
		this.divergingColors = [
			colorbrewer.BrBG,
			colorbrewer.PiYG,
			colorbrewer.PRGn,
			colorbrewer.PuOr,
			colorbrewer.RdBu,
			colorbrewer.RdGy,
			// colorbrewer.RdYlBu,
			colorbrewer.RdYlGn,
			// colorbrewer.Spectral
		]

		this.sequentialColors = [
			// Single Hue
			colorbrewer.Blues,
			colorbrewer.Greens,
			colorbrewer.Greys,
			colorbrewer.Oranges,
			colorbrewer.Purples,
			colorbrewer.Reds,
			// Multi-Hue
			// colorbrewer.BuGn,
			colorbrewer.BuPu,
			colorbrewer.GnBu,
			// colorbrewer.OrRd,
			// colorbrewer.PuBu,
			// colorbrewer.PuBuGn,
			colorbrewer.PuRd,
			colorbrewer.RdPu,
			// colorbrewer.YlGn,
			// colorbrewer.YlGnBu,
			// colorbrewer.YlOrBr,
			// colorbrewer.YlOrRd
		]

		this.categoricalColors = [
			colorbrewer.Accent,
			colorbrewer.Dark2,
			colorbrewer.Paired,
			colorbrewer.Pastel1,
			colorbrewer.Pastel2,
			colorbrewer.Set1,
			colorbrewer.Set2,
			colorbrewer.Set3
		]	
	}

	addColorPalettesToStyler() {
		this.colorPaletteAdder(this.Node("divergent").elem, this.divergingColors);
		this.colorPaletteAdder(this.Node("sequential").elem, this.sequentialColors);
		this.colorPaletteAdder(this.Node("categorical").elem, this.categoricalColors);
	}

	colorPaletteAdder(dom, colorScheme) {
		for (let index = 0; index < colorScheme.length; index++) {

			// Create color palette 
			let palette = document.createElement('span');
			palette.className = "palette";
			// Tell the user the color
			palette.addEventListener("click", () => {
				// Tooltip?
				console.log("do something");
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

	addListenersToScheme() {
		// Get a collection of the button
		let colls = this.Node("collapsibles")._elem.getElementsByClassName("collapsible");

		// Show divergent as active and show its content
		colls[0].classList.toggle("active");
		let content = colls[0].nextElementSibling;
		content.style.maxHeight = "100px";

		function toggleContent(content) {
			if (content.style.maxHeight) {
				content.style.maxHeight = null;
			} else {
				content.style.maxHeight = content.scrollHeight + 'px';
			}
		}

		for (let i = 0; i < colls.length; i++) {
			colls[i].addEventListener("click", function () {
				for (let j = 0; j < colls.length; j++) {
					if (j == i) {
						if (this.classList.contains('active')) {
							this.classList.remove('active');
						} else {
							this.classList.toggle("active");
						}
						toggleContent(this.nextElementSibling);
					} else {
						if (colls[j].classList.contains('active')) {
							colls[j].classList.remove('active');
							toggleContent(colls[j].nextElementSibling);
						}
					}
				}
			});
		}
	}

	/**
	 * Load class method, breaks, stard and end colours to styler widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {
		this.context = context;

		var n = context.sublayer.renderer.classBreakInfos.length;

		var idx = this.Elem('sMethod').FindIndex(i => i.algo === context.metadata.breaks.algo);

		this.Elem("sMethod").value = idx;
		this.Elem("iBreaks").value = n;

		this.Elem("bColorS").color = context.sublayer.renderer.classBreakInfos[0].symbol.color;
		this.Elem("bColorE").color = context.sublayer.renderer.classBreakInfos[n - 1].symbol.color;

		this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);
	}

	/**
	 * Remove class break
	 * @param {number} i - Index number to remove from class breaks
	 * @returns {void}
	 */
	Remove(i) {
		var brk = this.breaks[i];
		var prev = this.breaks[i-1];
		var next = this.breaks[i+1];
		
		if (next && prev) next.Min = prev.Max;

		// TODO: implement this in DOM (eventually?)
		this.Elem('breaks').removeChild(brk.Elem('container'));
		this.breaks.splice(i,1);
						
		this.Elem("iBreaks").value = this.breaks.length;
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

			brk.On("remove", this.OnBreak_Remove.bind(this, i));

			return brk;
		});
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
	 * Make a call to remove a class break if there is more than one
	 * @param {number} i - Index number to remove
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnBreak_Remove(i, ev) {
		// Last break cannot be removed
		if (this.breaks.length == 1) return;
		
		var i = this.breaks.indexOf(ev.target);
		
		this.Remove(i);
	}

	/**
	 * Change start or end colour after choice is made from colour picker
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnPicker_Finished(ev) {
		this.context.metadata.colors.start = this.Elem("bColorS").EsriColor;
		this.context.metadata.colors.end = this.Elem("bColorE").EsriColor;

		this.Refresh();
	}

	/**
	 * Change number of breaks when up or down arrows are clicked or new number is entered
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	onIBreaks_Change(ev) {
		this.context.metadata.breaks.n = ev.target.value;

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
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	Template() {
		return	"<p>nls(Styler_Instructions_1)</p>" +
				"<label>nls(Styler_Method)</label>" +
				"<div handle='sMethod' widget='Basic.Components.Select'></div>" +
				"<label>nls(Styler_Breaks)</label>" +
				"<input handle='iBreaks' type='number' min='1' max='10' />" +
				// New color style (divergent, sequential, categorical)
				"<label>nls(Styler_Color_Scheme)</label>" +
				"<div class='collapsibles' handle='collapsibles'>" +
					"<button class='collapsible'>nls(Styler_Scheme_Divergent)</button>" +
						"<div handle='divergent' class='content'></div>" +
					"<button class='collapsible'>nls(Styler_Scheme_Sequential)</button>" +
						"<div  handle='sequential' class='content'></div>" +
					"<button class='collapsible'>nls(Styler_Scheme_Categorical)</button>" +
						"<div handle='categorical' class='content'></div>" +
				"</div>"+
				// Color range
				"<label>nls(Styler_Color_Range)</label>" +
				"<div class='color-range'>" +
					"<label>nls(Styler_Color_Start)</label>" +
					"<div handle='bColorS' class='color start' widget='Basic.Components.Picker'></div>" +
					"<label>nls(Styler_Color_End)</label>" +
					"<div handle='bColorE' class='color end' widget='Basic.Components.Picker'></div>" +
				"</div>" +
				"<label>nls(Styler_Style)</label>" +
				"<table handle='breaks' class='breaks-container'>" +
					// Class breaks go here, dynamically created
				"</table>" +
				"<p>nls(Styler_Instructions_3)</p>" +
				"<div class='button-container'>" +
				   "<button handle='bApply' class='button-label button-apply'>nls(Styler_Button_Apply)</button>" +
				   "<button handle='bClose' class='button-label button-close'>nls(Styler_Button_Close)</button>" +
				"</div>";
	}
})
