import {inscription, bitcoin} from '@hthuang/bitcoin-lib/dist';
import record from '../omniverse/odlt';
import config from '../config/config';
import { db } from '../database';

export default class Monitor {
    constructor() {
    }

    start() {
        bitcoin.setProvider(config.provider);
        bitcoin.setUser('a');
        bitcoin.setPassword('b');
        try {
            inscription.subscribe({from: 0,}, (datas: string[], blockHash: string) => {
                let rets = [];
                for (let i in datas) {
                    let data = datas[i];
                    let originData = Buffer.from(data, 'hex').toString();
                    let tx = JSON.parse(originData);
                    if (tx.p != 'brc-6358' || tx.method != 'addBlock') {
                        continue;
                    }

                    let ret = {
                        number: tx.blockNumber,
                        preBlockUTXORootHash: tx.preBlockUTXORootHash,
                        curBlockUTXORootHash: tx.curBlockUTXORootHash,
                        blockHash,
                        txIndex: parseInt(i)
                    }

                    console.debug('ODLTTransaction', ret);
                    rets.push(ret);
                }
                // Sort
                rets.sort((o1: any, o2: any): number => {
                    if (o1.number > o2.number) {
                        return 1;
                    }
                    else if (o1.number < o2.number) {
                        return -1;
                    }
                    return 0;
                });
                for (let i in rets) {
                    record.saveTransaction(rets[i]);
                }
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}