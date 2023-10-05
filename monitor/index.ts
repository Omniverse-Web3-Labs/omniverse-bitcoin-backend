import {ODLT, bitcoin} from '@hthuang/bitcoin-lib/dist';
import record from '../omniverse/odlt';
import config from '../config/config';
import { db } from '../database';

export default class Monitor {
    constructor() {
    }
    start() {
        bitcoin.setProvider(config.provider);
        ODLT.subscribe({from: 0,}, (omniverseTransaction) => {
                console.debug('omniverse transaction: ', omniverseTransaction);
                // pass the omniverse transaction to omniverse logic layer
                record.saveTransaction(omniverseTransaction);
            }
        );
    }
}