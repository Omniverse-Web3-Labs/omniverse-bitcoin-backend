import {inscription, bitcoin} from '@omniverselab/bitcoin-lib';
import {BitcoinBlock} from '../monitor/types';

export default class Monitor {
    constructor() {
    }

    start(cb: (block: BitcoinBlock) => Promise<void>) {
        bitcoin.setProvider(global.config.getConfig().provider);
        bitcoin.setUser(global.config.getConfig().rpcuser);
        bitcoin.setPassword(global.config.getConfig().rpcpassword);
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