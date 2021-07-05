let events = [];

/**
 * PubSub module
 * @module tools/pubsub
 * @description to facilitate communication between modules
 */
 // REVIEW: This could've been done using the evented object.
export default class PubSub {
    /**
     * Add an event that has a name and function
     * @param {*} eventName - Name of the event
     * @param {*} fn - The function for the event
     */
    static Add(eventName, fn) {
        events.push({eventName, fn});
    }

    /**
     * Remove an event based on the event name
     * @param {*} eventName - Name of the event
     */
    static Remove(eventName) {
        events = events.filter(event => event.eventName != eventName);
    }

    /**
     * Run the function for the event
     * @param {*} eventName - Name of the event
     * @param {*} arg - A single argument for the function 
     */
    static Emit(eventName, arg) {
        for(let event of events) {
            if (event.eventName == eventName) {
                event.fn(arg);
            }
        }
    }
}
