import Templated from '../../components/templated.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Requests from '../../tools/requests.js';
import Picker from '../../ui/picker.js';
import StylerBreak from './styler-break.js';

export default Core.Templatable("App.Widgets.Styler", class Styler extends Templated {

	static Nls() {
		return {
			"Styler_Title" : {
				"en" : "Change map style",
				"fr" : "Modifier le style de la carte"
			},
			"Styler_Instructions_1" : {
				"en" : "Use the options below to change how to render the indicator on the map. To confirm your changes, click 'Apply' at the end of the form.",
				"fr" : "Utiliser les options ci-dessous pour changer la façon dont l’indicateur apparaît sur la carte. Pour confirmer les changements, cliquer sur « Appliquer » en bas du formulaire."
			},
			"Styler_Instructions_3" : {
				"en" : "* Geographies with no data or that do not fit in the ranges below are transparent on the map but still interactive.",
				"fr" : "* Les régions géographiques n’ayant pas de données ou ne tenant pas dans les plages ci-dessous apparaissent en transparence sur la carte, mais sont toujours interactives."
			},
			"Styler_Method" : {
				"en" : "Classification method",
				"fr" : "Méthode de classification"
			},
			"Styler_Color_Range" : {
				"en" : "Color range",
				"fr" : "Gamme de couleurs"
			},
			"Styler_Color_Start" : {
				"en" : "Start color",
				"fr" : "Couleur de départ"
			},
			"Styler_Color_End" : {
				"en" : "End color",
				"fr" : "Couleur de fin"
			},
			"Styler_Breaks" : {
				"en" : "Number of breaks (1 to 10)",
				"fr" : "Nombre de bornes (1 à 10)"
			},
			"Styler_Style" : {
				"en" : "Map style",
				"fr" : "Style de la carte"
			},
			"Styler_Method_Equal": {
				"en": "Equal intervals",
				"fr": "Intervalles égaux"
			},
			"Styler_Method_Natural": {
				"en": "Natural breaks",
				"fr": "Bornes naturelles"
			},
			"Styler_Method_Quantile": {
				"en": "Quantiles",
				"fr": "Quantiles"
			},
			"Styler_Max_Lt_Min" : {
				"en" : "New maximum value is less than the current minimum value for the layer. Input a higher value.",
				"fr" : "La nouvelle valeur maximale est inférieure à la valeur minimale actuelle pour la couche. Saisir une valeur plus élevée."
			},
			"Styler_Max_Gt_Next" : {
				"en" : "New maximum value exceeds the next range's maximum value. Input a lower value or increase the next range first.",
				"fr" : "La nouvelle valeur maximale dépasse la valeur maximale de la plage suivante. Saisir une valeur inférieure ou augmenter d’abord la plage suivante."
			},
			"Styler_Button_Apply" : {
				"en" : "Apply",
				"fr" : "Appliquer"
			},
			"Styler_Button_Close" : {
				"en" : "Cancel",
				"fr" : "Annuler"
			}
		}
	}

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
	}

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

	LoadClassBreaks(classBreakInfos) {
		Dom.Empty(this.Elem("breaks"));

		this.breaks = classBreakInfos.map((c, i) => {
			var brk = new StylerBreak(this.Elem('breaks'), c);

			brk.On("apply", this.OnBreak_Apply.bind(this, i));

			brk.On("remove", this.OnBreak_Remove.bind(this, i));

			return brk;
		});
	}

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

	OnBreak_Remove(i, ev) {
		// Last break cannot be removed
		if (this.breaks.length == 1) return;
		
		var i = this.breaks.indexOf(ev.target);
		
		this.Remove(i);
	}

	OnPicker_Finished(ev) {
		this.context.metadata.colors.start = this.Elem("bColorS").EsriColor;
		this.context.metadata.colors.end = this.Elem("bColorE").EsriColor;

		this.Refresh();
	}

	onIBreaks_Change(ev) {
		this.context.metadata.breaks.n = ev.target.value;

		this.Refresh();
	}

	onMethod_Change(ev) {
		this.context.metadata.breaks.algo = ev.target.selected.algo;

		this.Refresh();
	}

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

	OnClose_Click(ev) {
		this.context.Revert();

		this.Emit("Close");

		this.Update(this.context);
	}

	OnRequests_Error (error) {
		this.Emit("Error", { error:error });
	}

	Refresh() {
		this.Emit("Busy");

		Requests.Renderer(this.context).then(sublayer => {
			this.Emit("Idle");

			this.LoadClassBreaks(sublayer.renderer.classBreakInfos);
		}, error => this.OnRequests_Error(error));
	}

	Template() {
		return	"<p>nls(Styler_Instructions_1)</p>" +
				"<label>nls(Styler_Method)</label>" +
				"<div handle='sMethod' widget='Basic.Components.Select'></div>" +
				"<label>nls(Styler_Breaks)</label>" +
				"<input handle='iBreaks' type='number' min='1' max='10' />" +
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
