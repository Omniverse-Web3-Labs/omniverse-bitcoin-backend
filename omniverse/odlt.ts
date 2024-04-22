/**
 * Implementation of omniverse dlt, used to record all omniverse curBlockUtxoRootHash
 */

import {ODLT} from '@hthuang/bitcoin-lib/dist';
import {logger} from '../utils';

export interface Block {
    // batch id of omniverse
    batchId: string;
    // block height of bitcoin
    btcBlockHeight: string;
    // the tx id of bitcoin
    txid: string;
    // the output index in tx
    index: number;
    // p2tr output where the batch is committed to
    receipt: string;
}

export interface CommittedBatch {
    // batch id of omniverse
    batchId: string,
    // p2tr output where the batch is committed to
    receipt: string,
}

export class ODLTRecord {
    blocks: Array<Block> = new Array<Block>();
    committedBatch: CommittedBatch | null;

    /**
     * @param receipt The committed receipt of first batch
     */
    constructor(receipt: string) {
        this.committedBatch = {
            batchId: '0',
            receipt: receipt
        };
    }

    handleBlock(block: any) {
        if (this.committedBatch == null) {
            logger.info('No pending omniverse block');
            return;
        }

        for(let i in block.tx) {
            let tx = block.tx[i];
            console.log('tx', tx, tx.vin, tx.vout);
            this.handleTransaction(block.height, tx);
        }
    }

    handleTransaction(blockHeight: string, tx: any) {
        let committedBatch = this.committedBatch!;
        let vout = tx.vout.find((element: any) => element.scriptPubKey.hex == committedBatch.receipt);
        if (!vout) {
            return;
        }

        if (this.blocks.length == 0) {
            this.pushNewBatch(blockHeight, tx.txid, vout.n, committedBatch.receipt);
        }
        else {
            let preBlock = this.blocks[this.blocks.length - 1];
            let vin = tx.vin.find((element: any) => element.txid == preBlock.txid && element.vout == preBlock.index);
            if (!vin) {
                logger.warn(`receipt: ${committedBatch.receipt} of batch: ${committedBatch.batchId} can not match inputs`);
            }
            else {
                this.pushNewBatch(blockHeight, tx.txid, vout.n, committedBatch.receipt);
            }
        }
    }

    pushNewBatch(blockHeight: string, txid: string, index: number, receipt: string) {
        let committedBatch = this.committedBatch!;
        this.blocks.push({
            batchId: committedBatch.batchId,
            btcBlockHeight: blockHeight,
            txid,
            index,
            receipt,
        });
        this.committedBatch = null;
    }

    getBlockByHeight(number: number): Block | undefined {
        if (number < this.blocks.length) {
            return this.blocks[number];
        }

        return undefined;
    }

    commitReceipt(batchId: string, receipt: string): boolean {
        if (this.committedBatch?.batchId == batchId) {
            this.committedBatch = {
                batchId,
                receipt,
            };

            return true;
        }

        return false;
    }
}