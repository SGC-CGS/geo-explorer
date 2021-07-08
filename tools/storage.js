/**
 * Storage module
 * @module tools/storage
 */
export default class Storage {
    /**
     * Get / set the storage mechanism
     */
    get myStorage() { return this._myStorage; }

    set myStorage(value) { this._myStorage = value}

    /**
     * Get / set the key
     */
    get key() { return this._key; }

    set key(value) { this._key = value}

     /**
     * Get / set JSON content object in storage
     */
    get storedContent() {return this._content; }

    set storedContent(value) { this._content = value; }

    /**
     * @description To the current storage mechanism, add a new dataset 
     * @param {String} key - A constant you will use to define a new dataset
     * @param {*} options - An object containing relevant data
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API|Web Storage API}
     */
    constructor(key, options) {
        this.key = key;

        // REVIEW: May be best to see if storage is available in application.js?
        // Session storage for incognito users in some browsers, otherwise local storage
        // In Safari, the application may break application if the Storage API is not enabled client side
        if (window.localStorage == void(0)) {
            this.myStorage = window.sessionStorage;
        } else {
            this.myStorage = window.localStorage;
        }

        // If there are no options, only set a default empty array of bookmarks and contexts.
        if (options == null) {
            options = { bookmarks: [], contexts: [] };
        }

        // If the key does not yet exist in local storage
        if (this.myStorage.getItem(this.key) == null) {
            this.myStorage.setItem(this.key, JSON.stringify(options));
        }

        this.storedContent = JSON.parse(this.myStorage.getItem(this.key));
    }

    /**
     * @description Update or add a target collection in the JSON content object
     * @param {String} name - A variable within the dataset you wish to access
     * @param {*} section - The item you wish to update to the target collection
     */
    SetSection(name, section) {
        this.storedContent[name] = section;

        this.myStorage.setItem(this.key, JSON.stringify(this.storedContent));
    }

    /**
     * @description Remove a target collection from the JSON content object
     * @param {*} name - The collection you wish to remove from the JSON content object
     */
    RemoveSection(name) {
        delete this.storedContent[name];

        this.myStorage.setItem(this.key, JSON.stringify(this.storedContent));
    }

    /**
     * @description Clear all keys saved in the storage object 
     */
    Empty() { this.myStorage.clear(); }
}