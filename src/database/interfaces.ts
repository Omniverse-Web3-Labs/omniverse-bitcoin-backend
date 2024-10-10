import {BatchData} from '../omniverse/odlt';
import {BatchProof} from '../omniverse/batchProof';

export interface IDatabase {
    batches: any;
    latestBatchId: bigint | null;

    /**
     * Get the next id of batch which will be pushed to the db
     * 
     * @return {bigint} batch id expected to be pushed to db subsequently
     */
    getNextBatchId(): Promise<bigint>;

    /**
     * Get the latest batch info
     * 
     * @return {BatchData | null} null if there is no proof in db, otherwise batch proof
     */
    getLatestBatchData(): Promise<BatchData | null>;

    /**
     * Returns the batch data of specified batch id
     *  
     * @param {bigint} batchId The id of which batch to query
     * @return {BatchData | null} 
     */
    getBatchData(batchId: bigint): Promise<BatchData | null>;

    /**
     * Insert batch data of specified batch id into db
     * 
     * @param {bigint} batchId Batch id of the data to be inserted
     * @param {BatchData} batchData Batch proof data
     * @return {boolean} If data already inserted into database
     */
    insertBatchData(batchId: bigint, batchData: BatchData): Promise<boolean>;
}

export interface IS3 {
    /**
     * Query batch proof of specified batch id
     * 
     * @param {bigint} batchId The batch id to query
     * @returns {BatchProof | null}
     * BatchProof {
     *  batchId: bigint,
     *  startBlockHeight: bigint,
     *  endBlockHeight: bigint,
     *  startTxSid: bigint,
     *  endTxSid: bigint,
     *  aggProof: {
     *      vkeyHash: string,
     *      publicValues: string,
     *      proof: string
     *  }
     * }
     */
    queryBatchProof(batchId: bigint): Promise<BatchProof | null>;
}