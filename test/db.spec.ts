import {DB} from '../src/database';
import {BatchData} from '../src/omniverse/odlt';
import {expect, jest, test} from '@jest/globals';

async function newDatabase(): Promise<DB> {
    let db = new DB();
    await db.init();
    return db;
}

function getBatchData(): BatchData {
    return {
        proof: {
            batchId: BigInt(0),
            startBlockHeight: BigInt(0),
            endBlockHeight: BigInt(0),
            startTxSid: BigInt(0),
            endTxSid: BigInt(0),
            aggProof: {
                vkeyHash: "0x008e795750b8af6f2cbb72f4dad7c864fc4cbadc68cae36021e24bf499c76012",
                publicValues: "0x000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005",
                proof: ""
            }
        },
        btcBlockHeight: 0,
        txid: '0x1234567812345678123456781234567812345678123456781234567812345678',
        index: 0,
        receipt: '0x1234567812345678123456781234567812345678123456781234567812345678',
        value: 100,
        scriptRoot: '0x1234567812345678123456781234567812345678123456781234567812345678'
    }
}

describe('Database', function () {
    let db: DB;
    beforeEach(() => {
        db = new DB();
    })

    describe('init', function () {
        it('should fail with params not set', function () {
        })

        it('should pass with all conditions satisfied', function () {
        })
    })

    describe('insert batch data', function () {
        it('should return true with data not exist', async function () {
            await expect(db.insertBatchData(BigInt(0), getBatchData())).resolves.toBeTruthy();
        })

        it('should return true with data already exist', async function () {
            await db.insertBatchData(BigInt(0), getBatchData());
            await expect(db.insertBatchData(BigInt(0), getBatchData())).resolves.toBeTruthy();
        })

        it('should return false with execution failed', async function () {
        })
    })

    describe('get latest batch data', function () {
        it('should return null if there is no data stored in db', async function () {
            await expect(db.getLatestBatchData()).resolves.toBeNull();
        })

        it('should return the batch data if there is already data stored in db', async function () {
            await db.insertBatchData(BigInt(0), getBatchData());
            await expect(db.getLatestBatchData()).resolves.not.toBeNull();
        })
    })

    describe('get batch data of specified batch id', function () {
        it('should return null if data not found', async function () {
            await expect(db.getBatchData(BigInt(0))).resolves.toBeNull();
        })

        it('should return the batch data if data found', async function () {
            await db.insertBatchData(BigInt(0), getBatchData());
            await expect(db.getBatchData(BigInt(0))).resolves.not.toBeNull();
        })
    })
})