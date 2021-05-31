import Templated from '../../components/templated.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Requests from '../../tools/requests.js';
import StylerBreak from './styler-break.js';
import DefaultBreak from './default-break.js';
import Tooltip from "../../ui/tooltip.js"
import Colors from './colors.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Styler", class Styler extends Templated {

	/**
	 * Get/set opacity
	 */
	 set opacity(value) {
		this.Elem('sOpacity').value = value * 100;
	}
	
	get opacity() {
		return this.Elem('sOpacity').value / 100;
	}

	/**
	 * Return text for styler widget in both languages
	 * @returns {object.<string, string>} Styler widget text for each language
	 */		
	static Nls(nls) {
		nls.Add("Styler_Method", "en", "Classification method");
		nls.Add("Styler_Method", "fr", "Méthode de classification");
		nls.Add("Styler_Method_Info", "en", "Classification methods help organize data thematically.\n" + 
											"Equal Intervals: Data range is divided equally between the maximum and minimum by the # of classes.\n" + 
											"Natural Breaks: Complex approach to cluster data as accurately as possible.\n" +
											"Quintiles: Classifies data by an equal number of units for each category.\n");
		nls.Add("Styler_Method_Info", "fr", "Les méthodes de classification aident à organiser les données de manière thématique.\n" +
											"Intervalles égaux : la plage de données est divisée également entre le maximum et le minimum par le nombre de classes.\n" + 
											"Bornes naturelles : Approche complexe pour regrouper les données aussi précisément que possible.\n" +
											"Quintiles: classe les données par un nombre égal d'unités pour chaque catégorie.\n");
		nls.Add("Styler_Breaks", "en", "Number of breaks");
		nls.Add("Styler_Breaks", "fr", "Nombre de bornes");
		nls.Add("Styler_Breaks_Info", "en", "The number of breaks are used for dividing features in a classification within the maximum and minimum constraints. You may choose between 3 to 8 breaks.");
		nls.Add("Styler_Breaks_Info", "fr", "Le nombre de coupures est utilisé pour diviser les entités dans une classification dans les limites maximales et minimales. Vous pouvez choisir entre 3 à 8 pauses.");
		nls.Add("Styler_Color_Scheme", "en", "Color Schemes");
		nls.Add("Styler_Color_Scheme", "fr", "Gamme de schèmas");
		nls.Add("Styler_Color_Scheme_Info", "en", "Select a palette to update the map's color scheme. This palette is called: ");
		nls.Add("Styler_Color_Scheme_Info", "fr", "Sélectionnez une palette pour mettre à jour le schéma de couleurs de la carte. Cette palette s'appelle: ");
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
		nls.Add("Legend_Opacity_Info", "en", "Use the opacity bar to update the transparency of the features on the map. The closer the slider is to «Less», the lower the transparency value, and vice versa.");
		nls.Add("Legend_Opacity_Info", "fr", "Utilisez la barre d'opacité pour mettre à jour la transparence des entités sur la carte. Plus le curseur est proche de «Moins», plus la valeur de transparence est faible, et vice versa.");	
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
		this.tooltip = new Tooltip();

		this.Elem('sMethod').Add(this.Nls("Styler_Method_Equal"), null, { id:1, algo:"esriClassifyEqualInterval" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Natural"), null, { id:2, algo:"esriClassifyNaturalBreaks" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Quantile"), null, { id:3, algo:"esriClassifyQuantile" });

		var handler = function(ev) { this.onIBreaks_Change(ev); }.bind(this);

		this.Node('iBreaks').On("change", Core.Debounce(handler, 350));
		this.Node('sMethod').On("Change", this.onMethod_Change.bind(this));
		this.Node('sOpacity').On("change", this.OnOpacity_Changed.bind(this));

		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));

		this.LoadDefaultBreak();
		
		this.Elem("dropdownBtn").addEventListener("click", function (ev) {
			
			this.Elem("content").classList.toggle("active");

			if(ev.target.className == "collapsedDropdown"){ ev.target.className = "expandedDropdown"; } 

			else { ev.target.className = "collapsedDropdown"; }

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
		this.Elem("iBreaks").value = n;

		this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);

		if(this.currentColorScheme == null) {
			this.LoadColorSchemes();
		}
	}

	/**
	 * @description Use a subset of color schemes from ColorBrewer, and 
	 * create palettes and palette events for the colorScheme container.  
	 * @returns {void}
	 */	
	 LoadColorSchemes() {
		let container = this.Elem("colorScheme");

		Object.values(Colors.ColorSchemes()).forEach(colorScheme =>{

			let palette = Dom.Create("span", { className:"palette" }, container);

			this.AddPaletteEvents(palette, colorScheme);
			
			// Add 5 swatches to the palette
			colorScheme[5].forEach(color => {
				let swatch = Dom.Create("span", { className:"swatch" }, palette);

				swatch.style.backgroundColor = color;
			})
		})
	}

	/**
	 * @description Add event listeners to a palette. The "click" event is used
	 * for handling when a user chooses a new color scheme for the map. The other 
	 * event listeners are for handling the tooltip.
	 * @param {object} palette - Palette containing a color scheme
	 * @param {object} colorScheme - A color scheme from the subset of color schemes 
	 * @returns {void}
	 */	
	AddPaletteEvents(palette, colorScheme) {
		palette.addEventListener("click", () => {
			this.context.metadata.colors.palette = colorScheme[this.Elem("iBreaks").value];
			
			this.currentColorScheme = colorScheme;

			this.Refresh();
		})

		palette.addEventListener("mouseenter", () => {
			this.tooltip.content = `${this.Nls("Styler_Color_Scheme_Info")} ${colorScheme.label[Core.locale]}`;
		})

		palette.addEventListener("mousemove", (ev) => {
			this.tooltip.Show(ev.pageX + 10 , ev.pageY - 28);
		});

		palette.addEventListener("mouseleave", () => this.tooltip.Hide());
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

			return brk;
		});
	}

	/**
	 * Change number of breaks when up or down arrows are clicked or new number is entered
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	 onIBreaks_Change(ev) {
		this.context.metadata.breaks.n = ev.target.value;

		if (this.currentColorScheme != undefined) {
			this.context.metadata.colors.palette = this.currentColorScheme[this.Elem("iBreaks").value];
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
	 * @description To allow breaks for other values (restricted, confidential, etc.)
	 * @returns {void}
	 */
	 LoadDefaultBreak() {

		let symbol = {
			type: "simple-fill",
			color: [128, 128, 128, 255],
			style: "solid",
			outline: {
				color: [0, 0, 0, 225],
				width: 0.5
			}
		}

		new DefaultBreak(this.Elem('otherBreaks'), { symbol: symbol })
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
	 * Respond to change in opacity slider
	 * @param {object} ev - Event received from opacity slider
	 * @returns {void}
	 */
	OnOpacity_Changed(ev) {
		this.Emit("Opacity", { opacity:this.opacity });
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
		// REVIEW: Not 100% sure but, I think tables will be an accessibility problem. We should use something else, maybe ul and li?
		return	"<table handle='breaks' class='breaks-container' style='border-collapse: separate; margin-top: 15px;'>" +
					// Class breaks go here, dynamically created
				"</table>" +

				"<table handle='otherBreaks' class='breaks-container' style='border-collapse: separate; margin-bottom: 15px;'>" +
					// Other class breaks go here, manually created
				"</table>" +

				"<h2 handle='collapsible' class='collapsible active'>Change Map Style" +
					"<i handle='dropdownBtn' class='collapsedDropdown'></i>" +
					// "<i handle='collapsibleIcon' class='fa fa-caret-down' style='margin-left: 10px; cursor: pointer;'></i>" +
				"</h2>" +

				"<div handle='content' class='content'>" +
					// REVIEW: For sMethod and iBreaks, the input should be inline with their label.
					// REVIEW: Put sMethod and iBreaks side by side? Remove div tags for that.
					"<label>nls(Styler_Method)" +
						"<i class='fa fa-info-circle'><span class='tooltiptext tooltip-bottom'>nls(Styler_Method_Info)</span></i>" +
						"<div handle='sMethod' widget='Basic.Components.Select'></div>" +
					"</label>" +
					
					"<div></div>"+

					"<label>nls(Styler_Breaks)" +
						"<i class='fa fa-info-circle'><span class='tooltiptext tooltip-bottom'>nls(Styler_Breaks_Info)</span></i>" +
						"<input handle='iBreaks' type='number' min='3' max='8' />" +
					"</label>" +

					"<div></div>"+

					"<label>nls(Styler_Color_Scheme)</label>" +
					"<div handle='colorScheme'></div>" +

					"<label>nls(Legend_Opacity)</label>" +
					"<i class='fa fa-info-circle'><span class='tooltiptext tooltip-bottom'>nls(Legend_Opacity_Info)</span></i>" +
					"<div class='opacity-container'>" +
						"<input handle='sOpacity' type='range' class='opacity' min=0 max=100 />" + 
						"<div class='opacity-labels-container'>" +
							"<label>nls(Legend_Opacity_Less)</label>" +
							"<label>nls(Legend_Opacity_More)</label>" +
						"</div>" +
					"</div>" +

				"</div>"+

				"<div class='button-container'>" +
					"<button handle='bApply' class='button-label button-apply'>nls(Styler_Button_Apply)</button>" +
					"<button handle='bClose' class='button-label button-close'>nls(Styler_Button_Close)</button>" +
				"</div>";
	}
})
