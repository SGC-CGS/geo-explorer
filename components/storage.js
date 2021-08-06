/**
 * Storage module
 * @module tools/storage
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API|Web Storage API}
 */
export default class Storage {

    /**
     * Get / set the key
     */
    get key() { return this._key; }

    set key(value) { this._key = value}

     /**
     * Get / set JSON content object in storage
     */
    get content() { return this._content; }

    set content(value) { this._content = value; }

    /**
     * @description To the current storage mechanism, add a new dataset 
     * @param {String} key - A constant you will use to define a new dataset
     */
    constructor(key) {
        this.key = key;
        this.content = null;

        // Set storage mechanism
        if (!window.localStorage) {
            console.warn("Local storage not supported. CSGE will not be able to store user configurations.");
			
			return;
        }
		
        // Readily accessible object with JSON content
        this.content = JSON.parse(localStorage.getItem(this.key) || "{}");
    }

    /**
     * @description Returns a section from local storage
     * @param {String} name - The name of the configuration section in local storage
     */
	GetSection(name) {
        if (this.content == null) return null;
		
		return this.content[name] || null;
	}

    /**
     * @description Update or add a target section in local storage
     * @param {String} name - The name of the configuration section in local storage
     * @param {*} section - The content of the section to update in local storage
     */
    SetSection(name, section) {
        if (this.content == null) return;
        
        this.content[name] = section;

        localStorage.setItem(this.key, JSON.stringify(this.content));
    }

    /**
     * @description Remove a target collection from the JSON content object
     * @param {*} name - The collection you wish to remove from the JSON content object
     */
    RemoveSection(name) {
        if (this.content == null) return;

        delete this.content[name];

        localStorage.setItem(this.key, JSON.stringify(this.content));
    }

    /**
     * @description Clear all keys saved in the storage object 
     */
    Empty() { 
        if (this.content == null) return;

        localStorage.clear(); 
    }
}