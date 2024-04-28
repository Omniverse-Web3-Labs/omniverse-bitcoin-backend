import { ODLTRecord } from "../src/omniverse/odlt";
import {expect, jest, test} from '@jest/globals';
import DB from '../src/database';

declare global {
    var db: DB
};

global.db = new DB();

function newODLTRecord(): ODLTRecord {
    let odlt = new ODLTRecord();
    odlt.init();
    return odlt;
}

function getBatchData(): any {
    return {
        batchId: BigInt(0),
        blockHeight: '0',
        txid: '0x1234567812345678123456781234567812345678123456781234567812345678',
        index: 0,
        receipt: '0x1234567812345678123456781234567812345678123456781234567812345678',
        value: 100
    }
}

describe('Ominiverse backend', function () {
    describe('init', function () {
        it('should fail with no gas address configured', function () {
            let odlt = new ODLTRecord();
            expect(odlt.init()).toThrow('No gas address configured');
        })
    })

    describe('push new data into database', function () {
        let odlt: ODLTRecord
        beforeEach(() => {
            odlt = newODLTRecord()
        })

        it('should pass with batch id already exist', function () {
            // odlt.pushNewBatch()
        })

        it('should pass with batch id not exist', function () {
            
        })
    })

    describe('handle transaction', function () {
        describe('the first batch proof', function () {
            it('should fail with the expected output is absent', function () {
                
            })
    
            it('should have no effect with transaction does not output to the expected output address', function () {
                
            })
    
            it('should fail with the gas input number more than 1', function () {
                
            })
    
            it('should fail with the gas input address is not the same as configured', function () {
                
            })
    
            it('should pass and save the batch data into db with all conditions satisfied', function () {
                
            })
        })

        describe('not the first batch proof', function () {
            it('should have no effect with transaction does not consume the commitment UTXO', function () {
            })
    
            describe('transaction consumes the commitment UTXO', function () {
                it('should fail with the index of commitment output is not 0', function () {
                })

                it('should fail with the output of commitment is not the same as the one calculated from data fetched from S3', function () {
                })

                it('should pass with the output of commitment match the calculated commitment address', function () {
                })
            })
        })
    })
})