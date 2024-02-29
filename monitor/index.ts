import {inscription, bitcoin} from '../../omniverse-btc-lib/dist';
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
            inscription.subscribe({from: 0,}, (datas: Array<any>, blockHash: string, blockHeight: bigint) => {
                console.log('datas', datas, blockHash);
                let rets = [];
                for (let i in datas) {
                    let data = datas[i];
                    let originData = Buffer.from(data.data, 'hex').toString();
                    let tx = JSON.parse(originData);
                    console.log('tx', tx);
                    if (tx.p != 'brc-6358' || tx.method != 'addBlock') {
                        continue;
                    }

                    let ret = {
                        btcHeight: blockHeight,
                        preBlockUTXORootHash: tx.preBlockUTXORootHash,
                        curBlockUTXORootHash: tx.curBlockUTXORootHash,
                        blockHash,
                        preTxId: tx.preTxId,
                        preIndex: tx.preIndex,
                        number: tx.blockNumber,
                        txid: data.txid,
                        index: data.index,
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