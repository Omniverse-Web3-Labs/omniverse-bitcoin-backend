import {ODLT, bitcoin} from '@hthuang/bitcoin-lib/dist';
import record from '../omniverse/odlt';

export default class Monitor {
    constructor() {
    }
    start() {
        bitcoin.setProvider('http://127.0.0.1:18443');
        ODLT.subscribe({from: 0,}, (omniverseTransaction) => {
                console.debug('omniverse transaction: ', omniverseTransaction);
                // pass the omniverse transaction to omniverse logic layer
                record.saveTransaction(omniverseTransaction);
            }
        );
    }
}