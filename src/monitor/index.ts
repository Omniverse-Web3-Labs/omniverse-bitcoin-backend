import {inscription, bitcoin} from '@omniverselab/bitcoin-lib';
import config from '../config';
import {BitcoinBlock} from '../monitor/types';

export default class Monitor {
    constructor() {
    }

    start(cb: (block: BitcoinBlock) => Promise<void>) {
        bitcoin.setProvider(config.provider);
        bitcoin.setUser(config.rpcuser);
        bitcoin.setPassword(config.rpcpassword);
        try {
            return bitcoin.subscribe({from: 0,}, async (block: any) => {
                await cb(block as BitcoinBlock);
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}