/**
 * Implementation of omniverse dlt, used to record all omniverse curBlockUtxoRootHash
 */

import {ODLT} from '@hthuang/bitcoin-lib/dist';
import {logger} from '../utils';

export interface Block {
    btcHeight: bigint;
    preBlockUTXORootHash: string;
    curBlockUTXORootHash: string;
    blockHash: string;
    preTxId: string;
    preIndex: number;
    number: bigint;
    txid: string;
    index: number;
}

class ODLTRecord {
    blocks: Array<Block> = new Array<Block>();

    saveTransaction(block: any) {
        if (block.number != this.blocks.length) {
            logger.info('Block number not matched', block.number, this.blocks.length);
            return;
        }

        this.blocks.push({
            btcHeight: block.btcHeight,
            preBlockUTXORootHash: block.preBlockUTXORootHash,
            curBlockUTXORootHash: block.curBlockUTXORootHash,
            blockHash: block.blockHash,
            preTxId: block.preTxId,
            preIndex: block.preIndex,
            number: block.number,
            txid: block.txid,
            index: block.index,
        });
    }

    getBlockByNumber(number: number): Block | undefined {
        if (number < this.blocks.length) {
            return this.blocks[number];
        }

        return undefined;
    }
}

export default new ODLTRecord()