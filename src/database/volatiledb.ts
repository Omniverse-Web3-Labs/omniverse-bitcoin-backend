import {BatchData} from '../omniverse/odlt';
import {IDatabase} from './interfaces';

export default class DB implements IDatabase {
    batches: any;
    latestBatchId: bigint | null;

    constructor() {
        this.batches = {}
        this.latestBatchId = null;
    }

    async init() {

    }

    /**
     * Get the next id of batch which will be pushed to the db
     * 
     * @return {bigint} batch id expected to be pushed to db subsequently
     */
    async getNextBatchId(): Promise<bigint> {
        if (this.latestBatchId != null) {
            return this.latestBatchId + BigInt(1);
        }
        else {
            return BigInt(0);
        }
    }

    /**
     * Get the latest batch info
     * 
     * @return {BatchData | null} null if there is no proof in db, otherwise batch proof
     */
    async getLatestBatchData(): Promise<BatchData | null> {
        if (this.latestBatchId != null) {
            return this.batches[this.latestBatchId!.toString()];
        }
        else {
            return null;
        }
    }

    /**
     * Returns the batch data of specified batch id
     *  
     * @param {bigint} batchId The id of which batch to query
     * @return {BatchData | null} 
     */
    async getBatchData(batchId: bigint): Promise<BatchData | null> {
        if (this.latestBatchId != null) {
            return this.batches[this.latestBatchId!.toString()];
        }
        else {
            return null
        }
    }

    /**
     * Insert batch data of specified batch id into db
     * 
     * @param {bigint} batchId Batch id of the data to be inserted
     * @param {BatchData} batchData Batch proof data
     * @return {boolean} If data already inserted into database
     */
    async insertBatchData(batchId: bigint, batchData: BatchData): Promise<boolean> {
        this.batches[batchId.toString()] = batchData;
        this.latestBatchId = batchId;
        return true;
    }
}