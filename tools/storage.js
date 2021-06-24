let _webStorage = null;
let _webStorageType = null;

const items = {
    bookmarks: []
};

/**
 * Storage module
 * @module tools/storage
 */
export default class Storage {
    /**
     * Set the storage mechanism (local or session)
     */
    static set webStorage(type) {
        if (type == "localStorage") {
            _webStorageType = type;
            _webStorage = window.localStorage;
        } else {
            _webStorageType = "sessionStorage";
            _webStorage = window.sessionStorage
        }
    }

    /**
     * Get the storage mechanism (session or local)
     */
    static get webStorage() { return _webStorage; }

    /**
     * Get the storage mechanism type (session or local)
     */
     static get webStorageType() { return _webStorageType; }

    /**
     * @description To the current storage mechanism, add a new dataset 
     * @param {String} key - A constant you will use to define a new dataset
     * @param {*} options - An object containing relevant data
     */
    static Initialize(key, options) {
        if (options == null) options = items;

        if (this.webStorage.getItem(key) == null) {
            this.webStorage.setItem(key, JSON.stringify(options));
        }
    }

    /**
     * @description Add a single item to a target collection
     * @param {String} key - A constant that defines the dataset
     * @param {String} target - A variable within the dataset you wish to access
     * @param {*} item - The item you wish to add to the target collection
     */
    static AddItem(key, target, item) {
        let value = JSON.parse(this.webStorage.getItem(key));

        if (value[target] == undefined) return;

        value[target].push(item);

        this.webStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * @description Add items to a target collection
     * @param {String} key - A constant that defines the dataset
     * @param {String} target - A variable within the dataset you wish to access
     * @param {Array.<*>} items - The items you wish to add to the target collection
     */
    static AddItems(key, target, items) {
        let value = JSON.parse(this.webStorage.getItem(key));

        if (value[target] == undefined) return;

        items.forEach((item) => {
            value[target].push(item);
        })

        this.webStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * @description Remove every occurrence of an item in the target collection
     * @param {String} key - A constant defining the dataset
     * @param {String} target - A variable within the dataset you wish to access
     * @param {*} item - The item you wish to remove from the target collection
     */
    static RemoveItem(key, target, item) {
        let value = JSON.parse(this.webStorage.getItem(key));

        if (value[target] == undefined) return;

        value[target].forEach((v, index, collection) => {
            // WARNING: Order matters when comparing objects!
            if (JSON.stringify(v) == JSON.stringify(item)) {
                collection.splice(index, 1);
            }
        });

        this.webStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * @description To update an item in the target collection, you must replace it entirely
     * @param {*} key - A constant that defines the dataset
     * @param {String} target - A variable within the dataset you wish to access
     * @param {*} oldItem - The item you wish to replace in the target collection
     * @param {*} updatedItem - The updated item to be put in place of the old item 
     */
    static UpdateItem(key, target, oldItem, updatedItem) {
        let value = JSON.parse(this.webStorage.getItem(key));

        if (value[target] == undefined) return;

        value[target].forEach((v, index, collection) => {
            // WARNING: Order matters when comparing objects!
            if (JSON.stringify(v) == JSON.stringify(oldItem)) {
                collection[index] = updatedItem;
            }
        });

        this.webStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Check if we can use or create the storage object
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API|Web Storage API}
     * @param {*} type - Type of web storage mechanism
     * @returns True if we can use the storage object, false otherwise
     */
    static StorageAvailable(type) {
        let storage;
        try {
            storage = window[type];
            let x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch (e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    }

    /**
     * Clear all keys saved in the storage object 
     */
    static EmptyStorage() {
        this.webStorage.clear();
    }

}