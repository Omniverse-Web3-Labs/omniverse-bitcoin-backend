/**
 * Implementation of omniverse dlt, used to record all omniverse curBlockUtxoRootHash
 */

import {ODLT} from '@hthuang/bitcoin-lib/dist';
import { BatchProof, CommittedBatch } from './batchProof';
import {logger} from '../utils';

export interface BatchData {
    // batch proof
    proof: BatchProof;
    // block height of bitcoin
    btcBlockHeight: string;
    // the tx id of bitcoin
    txid: string;
    // the output index in tx
    index: number;
    // p2tr output where the batch is committed to
    receipt: string;
    // token amount `receipt` received
    value: number;
    // script root used to consume a UTXO
    scriptRoot: string;
}

export class ODLTRecord {
    batches: Array<BatchData> = new Array<BatchData>();
    committedBatch: CommittedBatch = new CommittedBatch();

    /**
     */
    constructor() {
    }

    /**
     * Walk through all transactions in `block` to check if there is a commitment transaction
     * 
     * @param block A bitcoin block to walk through
     * 
     */
    handleBlock(block: any) {
        for(let i in block.tx) {
            let tx = block.tx[i];
            console.log('tx', tx, tx.vin, tx.vout);
            this.handleTransaction(block.height, tx);
        }
    }

    /**
     * If the UTXO including the newest state root is consumed, there should be a new UTXO presenting
     * the updated state root generated. The updated state root should be calculated from proof data, which
     * is fetched from S3.
     * 
     * @param blockHeight The block height of `tx`
     * @param tx Raw transaction data in a Bitcoin block
     */
    handleTransaction(blockHeight: string, tx: any) {
        // let vout = tx.vout.find((element: any) => element.scriptPubKey.hex == committedBatch.receipt);
        // if (!vout) {
        //     return;
        // }

        // if (this.batches.length == 0) {
        //     this.pushNewBatch(blockHeight, tx.txid, vout.n, committedBatch.receipt, vout.value);
        // }
        // else {
        //     let preBlock = this.batches[this.batches.length - 1];
        //     let vin = tx.vin.find((element: any) => element.txid == preBlock.txid && element.vout == preBlock.index);
        //     if (!vin) {
        //         logger.warn(`receipt: ${committedBatch.receipt} of batch: ${committedBatch.batchId} can not match inputs`);
        //     }
        //     else {
        //         this.pushNewBatch(blockHeight, tx.txid, vout.n, committedBatch.receipt, vout.value);
        //     }
        // }
    }

    pushNewBatch(blockHeight: string, txid: string, index: number, receipt: string, value: number) {
        // let committedBatch = this.committedBatch!;
        // this.batches.push({
        //     batchId: committedBatch.batchId,
        //     btcBlockHeight: blockHeight,
        //     txid,
        //     index,
        //     receipt,
        //     value,
        // });
        // this.committedBatch = null;
    }

    getBatch(id: number): BatchData | undefined {
        if (id < this.batches.length) {
            return this.batches[id];
        }

        return undefined;
    }
}