import { BatchData, ODLTRecord } from "../src/omniverse/odlt";
import {BatchProof} from '../src/omniverse/batchProof';
import {expect, jest, test} from '@jest/globals';
import {Config} from '../src/config';
import { BitcoinTx, Input, Output } from "../src/monitor/types";
import DB from './mock/db.mock';
import S3 from './mock/s3.mock';

let db: DB;
let s3: S3;

async function expectAsyncThrow(fn: () => Promise<void>, message: string) {
    try {
        await fn()
        expect('Async function').toBe(`did not throw an error, expected: ${message}`)
    } catch (error) {
        if (error instanceof Error) {
            if (!error.message.includes(message)) {
                throw error
            }
        }
        else {
            throw 'Error type not match'
        }
    }
}

function newODLTRecord(): ODLTRecord {
    db = new DB();
    s3 = new S3();
    global.db = db;
    global.s3 = s3;
    let odlt = new ODLTRecord();
    odlt.init();
    return odlt;
}

function getDefaultConfig(): Config {
    return {
        provider: "http://127.0.0.1:18443",
        receipt: "1234",
        network: 'regtest',
        rpcuser: 'rpcuser',
        rpcpassword: 'rpcpassword',
        publicKey: '12345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678',
        gas: {
            txid: "1234567812345678123456781234567812345678123456781234567812345670",
            vout: 0
        },
        s3: {
            client: {
                region: "us-east-1",
                forcePathStyle: true,
                credentials: {
                    accessKeyId: "id",
                    secretAccessKey: "key"
                }
            },
            bucket: "bucket",
            path: "path"
        }
    }
}

function getCommitment(batchId: bigint): {output: string, scriptRoot: string} {
    let proof = getBatchProof(batchId);
    let { batchTxRootHash, UTXOSMTRootHash, AssetSMTRootHash } = ODLTRecord.getMerkleRoots(Number(proof.endTxSid - proof.startTxSid + 1n), proof.instances);
    let commitment = ODLTRecord.calculateCommitment(batchTxRootHash, UTXOSMTRootHash, AssetSMTRootHash, getDefaultConfig().publicKey);
    return commitment!;
}

function getBatchProof(batchId: bigint = 0n): BatchProof {
    return {
        batchId: batchId,
        startBlockHeight: batchId,
        endBlockHeight: batchId,
        startTxSid: batchId,
        endTxSid: batchId,
        proof: Uint8Array.from([1, 2, 3, 4]),
        instances: [
            '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', 
            '1', '2', '3', '4', '1', '2', '3', '4'
        ]
    }
}

function getBatchData(batchId: bigint = 0n): BatchData {
    let commitment = getCommitment(batchId);
    return {
        proof: {
            batchId: batchId,
            startBlockHeight: batchId,
            endBlockHeight: batchId,
            startTxSid: batchId,
            endTxSid: batchId,
            proof: Uint8Array.from([1, 2, 3, 4]),
            instances: [
                '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', 
                '1', '2', '3', '4', '1', '2', '3', '4'
            ]
        },
        btcBlockHeight: 0,
        txid: '123456781234567812345678123456781234567812345678123456781234567' + batchId.toString(),
        index: 0,
        receipt: commitment.output,
        value: 100,
        scriptRoot: commitment.scriptRoot
    }
}

describe('Ominiverse backend', function () {
    describe('init', function () {
        it('should pass', function () {
            new ODLTRecord();
        })
    })

    describe('push new data into database', function () {
        let odlt: ODLTRecord
        beforeEach(() => {
            odlt = newODLTRecord()
        })

        it('should fail with batch id error', async function () {
            let batchData: BatchData = getBatchData();
            batchData.proof.batchId = BigInt(1);
            await expectAsyncThrow(async () => {await odlt.pushNewBatch(batchData)}, 'push new batch failed with next batch id 0 and new batch id 1 not match')
        })

        it('should pass with batch id already exist', async function () {
            let batchData: BatchData = getBatchData();
            global.db.insertBatchData(BigInt(0), batchData);
            batchData.proof.batchId = 1n;
            await expect(odlt.pushNewBatch(batchData)).resolves.toBeUndefined();
        })

        it('should pass with batch id not exist', async function () {
            let batchData: BatchData = getBatchData();
            await expect(odlt.pushNewBatch(batchData)).resolves.toBeUndefined();
            await expect(db.getLatestBatchData()).resolves.not.toBeNull();
        })
    })

    describe('handle transaction', function () {
        function getTransaction(batchId: bigint = BigInt(0)): BitcoinTx {
            let commitment = getCommitment(batchId);
            return {
                txid: '123456781234567812345678123456781234567812345678123456781234567' + batchId.toString(),
                vin: [
                    {
                        txid: '123456781234567812345678123456781234567812345678123456781234567' + (batchId > 0 ? batchId - 1n : 0n).toString(),
                        vout: 0
                    }
                ],
                vout: [
                    {
                        scriptPubKey: {
                            hex: commitment!.output
                        },
                        n: 0,
                        value: 100
                    }
                ]
            }
        }

        let odlt: ODLTRecord
        beforeEach(() => {
            odlt = newODLTRecord()
            odlt.config = getDefaultConfig()
            let tx = getTransaction();
            let vin = tx.vin.find((element: Input) => element.txid == odlt.config.gas.txid && element.vout == odlt.config.gas.vout);
            expect(vin).not.toBeUndefined();
        })

        function stateTransition(batchId: bigint) {
            beforeEach(() => {
                let bp = getBatchData(batchId);
                for (let i = 0n; i < batchId; i++) {
                    db.insertBatchData(i, bp);
                    s3.setBatchProof(i, bp.proof);
                }
            })

            it('should fail with no proof data found to calculate commitment output', async function () {
                let tx = getTransaction(batchId);
                await expectAsyncThrow(async () => {await odlt.handleTransaction(0, tx)}, 'can not get proof data to calculate expected output')
            })

            // it('should fail with calculating commitment output failed', async function () {
            //     s3.setBatchProof(BigInt(0), getBatchData().proof)
            //     let tx = getTransaction();
            //     tx.vout[0].scriptPubKey.hex = '0x1234';
            //     expectAsyncThrow(async () => {await odlt.handleTransaction(0, tx)}, 'commitment output calculation failed')
            // })

            it('should fail with commitment output is not in the transaction output', async function () {
                s3.setBatchProof(BigInt(0), getBatchData().proof)
                let tx = getTransaction(batchId);
                await expectAsyncThrow(async () => {await odlt.handleTransaction(0, tx)}, 'expected output is absent')
            })

            it('should fail with the index of commitment output is not 0', async function () {
                s3.setBatchProof(BigInt(0), getBatchData().proof)
                let tx = getTransaction(batchId);
                tx.vout[0].n = 1;
                tx.vout[0].scriptPubKey.hex = '51203e4b04ae8bada68cde9bed8c6bab369a05080c125f4bdc8341ae261abd493717';
                await expectAsyncThrow(async () => {await odlt.handleTransaction(0, tx)}, 'the index of commitment output is not 0 at block')
            })
    
            it('should pass and save the batch data into db with all conditions satisfied', async function () {
                s3.setBatchProof(BigInt(0), getBatchData().proof)
                let tx = getTransaction(batchId);
                tx.vout[0].scriptPubKey.hex = '51203e4b04ae8bada68cde9bed8c6bab369a05080c125f4bdc8341ae261abd493717';
                await odlt.handleTransaction(0, tx);
                await expect(db.getLatestBatchData()).resolves.not.toBeNull();
            })
        }

        describe('the first batch proof', function () {
            it('should have no effect with no expected gas UTXO is included', async function () {
                let tx = getTransaction();
                tx.vin[0].txid = '1234567812345678123456781234567812345678123456781234567812345678';
                await expect(odlt.handleTransaction(0, tx)).resolves.toBeUndefined();
            })

            describe('with expected gas UTXO included', function () {
                beforeEach(() => {
                })

                it('should fail with the tx input number not 1', async function () {
                    let tx = getTransaction();
                    tx.vin.push({
                        txid: '1234567812345678123456781234567812345678123456781234567812345678',
                        vout: 0
                    });
                    await expectAsyncThrow(async () => {await odlt.handleTransaction(0, tx)}, 'Fatal: input number of initial transaction is not 1')
                })

                describe('state transition process', stateTransition.bind(stateTransition, 0n));
            })
        })

        describe('not the first batch proof', function () {
            it('should have no effect with transaction does not consume the commitment UTXO', async function () {
                db.insertBatchData(BigInt(0), getBatchData());
                let tx = getTransaction(1n);
                tx.vin[0].vout = 2;
                await expect(odlt.handleTransaction(1, tx)).resolves.toBeUndefined();
                let latestBatchData = await db.getLatestBatchData();
                expect(latestBatchData!.proof.batchId).toBe(BigInt(0));
            })
    
            describe('transaction consumes the previous commitment UTXO', function () {
                beforeEach(() => {
                    // consume the pre commitment UTXO
                })

                it('should fail with the index of previous commitment input is not 0', async function () {
                    let tx = getTransaction();
                    tx.vin[0].vout = 1;
                    expectAsyncThrow(async () => {await odlt.handleTransaction(0, tx)}, 'the index of commitment output is not 0')
                })

                describe('state transition process', stateTransition.bind(stateTransition, 1n));
            })
        })
    })
})