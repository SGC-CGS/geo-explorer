export default class Colors {
    static DivergingColors() {
        return [
			colorbrewer.BrBG,
			colorbrewer.PiYG,
			colorbrewer.PRGn,
			colorbrewer.PuOr,
			colorbrewer.RdBu,
			colorbrewer.RdGy,
			colorbrewer.RdYlGn,
		]
    }

    static SequentialColors() {
		return [
			// Single Hue
			colorbrewer.Blues,
			colorbrewer.Greens,
			colorbrewer.Greys,
			colorbrewer.Oranges,
			colorbrewer.Purples,
			colorbrewer.Reds,
			// Multi-Hue
			colorbrewer.BuPu,
			colorbrewer.GnBu,
			colorbrewer.PuRd,
			colorbrewer.RdPu,
		]
    }

    static CategoricalColors() {
        return [
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
}