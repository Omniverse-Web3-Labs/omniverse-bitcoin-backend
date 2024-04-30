import {inscription, bitcoin} from '../../../omniverse-bitcoin-lib/dist';
import config from '../../src/config';

export default class Monitor {
    constructor() {
    }

    start(cb: (block: any) => void) {
        bitcoin.setProvider(config.provider);
        bitcoin.setUser('a');
        bitcoin.setPassword('b');
        try {
            return bitcoin.subscribe({from: 0,}, (block: any) => {
                cb(block);
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}