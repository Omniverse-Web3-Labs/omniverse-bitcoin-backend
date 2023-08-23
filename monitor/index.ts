import {ODLT} from "../../omniverse-btc-lib";

export default class Monitor {
    constructor() {

    }
    
    start() {
        ODLT.subscribe({from: 0,}, (omniverseTransaction) => {
                console.debug('omniverse transaction', omniverseTransaction);
                // pass the omniverse transaction to omniverse logic layer
            }
        );
    }
}