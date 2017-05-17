class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(config) {
        this.initial = config.initial;
        this.currentState = this.initial;
        this.states = config.states;
        this.undoHistory = {events: [], states: []};
        this.storage = {events: [], states: []};
        this.sucsessfulTransaction = true;
    }

    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {
        return this.currentState;
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(state) {
        const self = this;
        self.sucsessfulTransaction = true;
        self.storage['events'] = [];
        self.storage['states'] = [];

        function Error(a){
            self.sucsessfulTransaction = false;
            return Error;
        };

        if(state in self.states){
            self.currentState = state;
            let arr = self.undoHistory['states'];
            arr.push(state);
        }else{
            return Error();
        }    
    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(event) {
        const self = this;
        let current = self.currentState;
        self.sucsessfulTransaction = true;
        self.storage['events'] = [];
        self.storage['states'] = [];

        function Error(a){
            self.sucsessfulTransaction = false;
        };

        for(let key in self.states){
            let obj = self.states[key]['transitions'];
            if(event in obj){
                self.currentState = obj[event];
            }
        };

        if(current == self.currentState){
            throw Error(event);
        }else{
            let arr1 = self.undoHistory['events'];
            let arr2 = self.undoHistory['states'];
            arr1.push(event);
            arr2.push(self.currentState);
        };
    }

    /**
     * Resets FSM state to initial.
     */
    reset() {
        this.currentState = this.initial;
        return this.currentState;
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(event) {
        const arr = [];
        for(let key in this.states){
            let obj = this.states[key]['transitions'];
            if(event in obj){
                arr.push(key);
            }else if(!event){
                arr.push(key);
            }
        }
        return arr;
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    undo() {
        if( (this.undoHistory['events'].lengh == 0) ||
            (this.undoHistory['states'].length == 0) ){
            return false; 
        }else{
            const length1 = this.undoHistory['events'].length;
            const length2 = this.undoHistory['states'].length;
            this.storage.events.push(this.undoHistory['events'][length1-1]);
            this.storage.states.push(this.undoHistory['states'][length2-1]);
            this.undoHistory['events'].pop();
            this.undoHistory['states'].pop();
            const length = this.undoHistory['states'].length;
            if(length > 0){
                this.currentState = this.undoHistory['states'][length-1];
            }else{
                this.currentState = this.initial;
            };
            if(this.sucsessfulTransaction){
                return this.sucsessfulTransaction;
            }
        } 
    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */
    redo() {
        if( this.storage.events.length == 0 &&
            this.storage.states.length == 0 ){
            return false;
        }else{
            this.storage.events.reverse();
            this.storage.states.reverse();
            Array.prototype.push.apply(this.undoHistory.events, this.storage.events);
            Array.prototype.push.apply(this.undoHistory.states, this.storage.states);
            this.currentState = this.undoHistory.states[this.undoHistory.states.length - 1];
            this.storage['events'] = [];
            this.storage['states'] = [];
            if(this.sucsessfulTransaction){
                return this.sucsessfulTransaction;
            };
        }
    }

    /**
     * Clears transition history
     */
    clearHistory() {
        this.undoHistory.events = [];
        this.undoHistory.states = [];
        this.storage.events = [];
        this.storage.states = [];
    }
}

module.exports = FSM;

/** @Created by Uladzimir Halushka **/

