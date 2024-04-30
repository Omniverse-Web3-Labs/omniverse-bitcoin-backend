/**
 * Implementation of omniverse dlt, used to record all omniverse curBlockUtxoRootHash
 */

import {ODLT} from '@hthuang/bitcoin-lib/dist';
import { BatchProof, CommittedBatch } from './batchProof';
import {logger, utils} from '../utils';
import config, {Config} from '../config';
import {BitcoinTx, Input, Output} from '../monitor/types';
import {
    Psbt,
    networks,
    payments,
    initEccLib,
    script,
    crypto,
} from 'bitcoinjs-lib'
import * as tinysecp from 'tiny-secp256k1'
import { Taptree } from 'bitcoinjs-lib/src/types';
initEccLib(tinysecp)

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
    config: Config;
    network: networks.Network;

    /**
     */
    constructor() {
        this.config = config;
        this.network = networks.bitcoin;
    }

    /**
     * Initialize
     */
    init() {
        if (!this.config.gas) {
            throw new Error('Fatal: no gas address configured');
        }

        if (this.config.network == 'regtest') {
            this.network = networks.regtest
        }
        else if (this.config.network == 'bitcoin') {
            this.network = networks.bitcoin
        }
        else if (this.config.network == 'testnet') {
            this.network = networks.testnet
        }
        else {
            throw new Error('Fatal: Network type not configured')
        }
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
    async handleTransaction(blockHeight: string, tx: BitcoinTx) {
        let nextBatchId = await global.db.getNextBatchId();
        if (nextBatchId == 0n) {
            let vin = tx.vin.find((element: Input) => element.txid == this.config.gas.txid && element.vout == this.config.gas.vout);
            if (!vin) {
                return;
            }

            // the initial transaction
            if (tx.vin.length > 1) {
                throw new Error(`Fatal: input number of initial transaction is not 1 at block ${blockHeight}, tx id: ${tx.txid}`);
            }
        }
        else {
            // transition with there have already been proofs in db
            let latestBatchData = await global.db.getLatestBatchData();
            let vin = tx.vin.find((element: Input) => element.txid == latestBatchData!.txid && element.vout == latestBatchData!.index);
            if (!vin) {
                return;
            }
        }

        // get proof data to calculate commitment output
        let batchProof = await global.s3.queryBatchProof(nextBatchId);
        if (!batchProof) {
            throw new Error(`Fatal: can not get proof data to calculate expected output at block ${blockHeight}, tx id: ${tx.txid}`);
        }
        else {
            let txNumber: number = Number(
                    batchProof.endTxSid -
                    batchProof.startTxSid +
                    1n
                )

            let { batchTxRootHash, UTXOSMTRootHash, AssetSMTRootHash } =
                    ODLTRecord.getMerkleRoots(txNumber, batchProof.instances);

            let commitment = ODLTRecord.calculateCommitment(batchTxRootHash, UTXOSMTRootHash, AssetSMTRootHash, this.config.publicKey);
            if (!commitment) {
                throw new Error(`Fatal: commitment output calculation failed at block ${blockHeight}, tx id: ${tx.txid}`)
            }

            let vout = tx.vout.find((element: Output) => element.scriptPubKey.hex == commitment!.output);
            if (!vout) {
                throw new Error(`Fatal: expected output is absent at block ${blockHeight}, tx id: ${tx.txid}`)
            }

            if (vout.n != 0) {
                throw new Error(`Fatal: the index of commitment output is not 0 at block ${blockHeight}, tx id: ${tx.txid}`)
            }

            await this.pushNewBatch({
                proof: batchProof,
                btcBlockHeight: blockHeight,
                txid: tx.txid,
                index: vout.n,
                receipt: commitment!.output,
                value: vout.value,
                scriptRoot: commitment!.scriptRoot
            });
        }
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

    /**
     * Get merkle roots from instances in batch proof
     *
     * @param {number} txNumber transaction number included in the batch proof
     * @param {string[]} instances instances in batch proof
     * @return {Object}
     * {
     *  batchTxRootHash,
     *  UTXOSMTRootHash,
     *  AssetSMTRootHash,
     * }
     */
    static getMerkleRoots(txNumber: number, instances: Array<string>): {batchTxRootHash: string, UTXOSMTRootHash: string, AssetSMTRootHash: string} {
        // batch tx merkle root
        let batchTxRootHash = utils.toU256FromU64Array(instances.slice(0))
        // UTXO smt root
        let UTXOSMTRootHash = utils.toU256FromU64Array(
            instances.slice((txNumber + 3) * 4)
        )
        // asset smt root
        let AssetSMTRootHash = utils.toU256FromU64Array(
            instances.slice((txNumber + 4) * 4)
        )

        return {
          batchTxRootHash: batchTxRootHash.toString(16),
          UTXOSMTRootHash: UTXOSMTRootHash.toString(16),
          AssetSMTRootHash: AssetSMTRootHash.toString(16),
        }
    }

    /**
     * Calculate p2tr commitment output from `batchTxRootHash`, `UTXOSMTRootHash`, `assetSMTRootHash`
     * 
     * @param {string} batchTxRootHash
     * @param {string} UTXOSMTRootHash
     * @param {string} assetSMTRootHash
     * @param {string} publicKey
     * @return {output: string, scriptRoot: string}
     * output: p2tr commitment output
     * scriptRoot: script root of p2tr output
     */
    static calculateCommitment(batchTxRootHash: string, UTXOSMTRootHash: string, assetSMTRootHash: string, publicKey: string): {output: string, scriptRoot: string} | undefined {
        // Construct p2tr address
        const scriptTree: Taptree = [
            [
                {
                    output: Buffer.from(batchTxRootHash, 'hex'),
                },
                {
                    output: Buffer.from(UTXOSMTRootHash, 'hex'),
                },
            ],
            {
                output: Buffer.from(assetSMTRootHash, 'hex'),
            },
        ]

        const { output, hash } = payments.p2tr({
            internalPubkey: utils.toXOnly(Buffer.from(publicKey, 'hex')),
            scriptTree,
        })

        if (!output || ! hash) {
            return undefined;
        }
        else {
            return {
                output: output!.toString('hex'),
                scriptRoot: hash!.toString('hex')
            }
        }        
    }

    /**
     * Insert new batch data into database
     * 
     * @param {BatchData} batchData
     */
    async pushNewBatch(batchData: BatchData) {
        let nextBatchId = await global.db.getNextBatchId();
        if (nextBatchId != batchData.proof.batchId) {
            throw new Error(`push new batch failed with next batch id ${nextBatchId} and new batch id ${batchData.proof.batchId} not match`)
        }

        await global.db.insertBatchData(nextBatchId, batchData);
    }

    /**
     * Returns batch data of specified batch id
     * 
     * @param {bigint} batchId The id of which batch to query
     * @returns 
     */
    async getBatch(batchId: bigint): Promise<BatchData | null> {
        return await global.db.getBatchData(batchId);
    }
}