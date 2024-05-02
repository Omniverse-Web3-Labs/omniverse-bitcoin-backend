import {inscription, bitcoin} from '../../../omniverse-bitcoin-lib/dist';
import config from '../../src/config';
import {BitcoinBlock} from '../../src/monitor/types';

export default class Monitor {
    constructor() {
    }

    start(cb: (block: BitcoinBlock) => void) {
        bitcoin.setProvider(config.provider);
        bitcoin.setUser('a');
        bitcoin.setPassword('b');
        try {
            return bitcoin.subscribe({from: 0,}, (block: any) => {
                cb(block as BitcoinBlock);
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}