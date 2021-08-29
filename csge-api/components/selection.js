import Evented from "../../csge-api/components/base/evented.js";

/**
 * Selection module
 * @module components/selection
 * @description 
 */
export default class Selection extends Evented { 
        
    /**
     * Get / set the selected graphics array
     */
    get graphics() { return this._graphics; }

    set graphics(value) { this._graphics = value; }
    
    /**
     * Get / set the unique id field for graphics
     */
	get id_field() { return this._id_field; }
    
	set id_field(value) { this._id_field = value; }
	
	/**
	 * Call constructor of base class and initialize point-select class 
	 * Adds point-select graphics layer and click handler.
	 * @param {object} map - Map object
	 * @param {object} options - Map options (not generally used)
	 * @returns {void}
	 */	
	constructor(id_field) {	
		super();

		this.id_field = id_field;
		this.graphics = [];
	}
	
	FindIndex(graphic) {
		// NOTE: Maybe we need to make this into a hashmap so we can direct access graphics in selection.
		return this.graphics.findIndex(g => {
			return g.attributes[this.id_field] == graphic.attributes[this.id_field];
		});
	}
	
	Find(graphic) {
		// NOTE: Maybe we need to make this into a hashmap so we can direct access graphics in selection.
		return this.graphics.find(g => {
			return g.attributes[this.id_field] == graphic.attributes[this.id_field];
		});
	}
	
	Exists(graphic) {
		return this.FindIndex(graphic) > -1;
	}
	
	_Add(graphic) {
		// if (this.Exists(graphic)) return false;
		
		this.graphics.push(graphic);
		
		this.Emit("added", { added:graphic });
	}
	
	Add(graphic) {
		this._Add(graphic);
		
		this.Emit("change", { graphics:this.graphics });
	}
	
	AddMany(graphics) {
		graphics.forEach(g => this._Add(g));
		
		this.Emit("change", { graphics:this.graphics });
	}
	
	_Remove(graphic) {
		var idx = this.FindIndex(graphic);
		
		// if (idx == -1) return false;
		
		var g = this.graphics[idx];
		
		this.graphics.splice(idx, 1);
		
		this.Emit("removed", { removed:g });
	}
	
	Remove(graphic) {
		this._Remove(graphic);
		
		this.Emit("change", { graphics:this.graphics });
	}
	
	RemoveMany(graphics) {
		// Have to go reverse when removing, otherwise it removes only half the 
		// list because size decreases as it loops
		for (var i = graphics.length - 1; i > -1; i--) {
			this._Remove(graphics[i]);
		}
		
		this.Emit("change", { graphics:this.graphics });	
	}
	
	RemoveAll() {
		this.RemoveMany(this.graphics);
	}
	
	_Toggle(graphic) {
		if (this.Exists(graphic)) this._Remove(graphic);
		
		else this._Add(graphic);
	}
	
	Toggle(graphic) {
		this._Toggle(graphic);
		
		this.Emit("change", { graphics:this.graphics });	
	}
	
	ToggleMany(graphics) {
		graphics.forEach(g => this._Toggle(g));
		
		this.Emit("change", { graphics:this.graphics });	
	}
	
	ToggleAll() {
		this.ToggleMany(this.graphics);
	}
	
	Clear() {
		this.graphics = [];
		
		this.Emit("change", { graphics:this.graphics });
	}
}