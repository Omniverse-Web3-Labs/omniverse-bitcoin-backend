/**
 * Implementation of omniverse dlt, used to record all omniverse curBlockUtxoRootHash
 */

import {ODLT} from '@hthuang/bitcoin-lib/dist';
import {logger} from '../utils';

export interface Block {
    number: bigint;
    preBlockUTXORootHash: string;
    curBlockUTXORootHash: string;
}

class ODLTRecord {
    blocks: Array<Block> = new Array<Block>();

    saveTransaction(block: any) {
        let height = block.number;
        if (height != this.blocks.length) {
            logger.info('Block number not matched', height, block.number);
            return;
        }

        this.blocks.push({
            number: block.number,
            preBlockUTXORootHash: block.preBlockUTXORootHash,
            curBlockUTXORootHash: block.curBlockUTXORootHash,
        });
    }

    getBlock(number: number): Block | undefined {
        if (number < this.blocks.length) {
            return this.blocks[number];
        }

        return undefined;
    }
}

export default new ODLTRecord()