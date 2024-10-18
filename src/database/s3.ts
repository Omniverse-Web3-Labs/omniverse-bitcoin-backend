import {
    S3Client,
    GetObjectCommand,
  } from '@aws-sdk/client-s3';
import fs from 'fs';
import {logger} from '../utils';
import {BatchProof} from '../omniverse/batchProof';
import {IS3} from './interfaces';
import { S3Config } from '../config';

export default class S3 implements IS3 {
    config: S3Config;
    s3client: S3Client;

    constructor() {
        const config = JSON.parse(fs.readFileSync("./config/default.json").toString());
        this.config = config as S3Config;
        this.s3client = new S3Client(this.config.client);
    }

    run() {}
    
    /**
     * Returns the latest batch id
     * 
     * @returns {bigint | null} 
     */
    async queryLatestBatchId(): Promise<bigint | null> {
      let conf = await this.getObject(this.config.bucket, 'config');
      if (conf) {
        if (conf.next_batch_id < 1) {
            logger.error('s3 next batch id error');
            return null;
        }
        return BigInt(conf.next_batch_id) - 1n;
      } else {
        return null;
      }
    }

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
    async queryBatchProof(batchId: bigint): Promise<BatchProof | null> {
        let latestBatchId = await this.queryLatestBatchId();
        if (latestBatchId == null) {
            return null
        }
        else {
            if (latestBatchId >= batchId) {
                let obj = await this.getObject(this.config.bucket, batchId.toString())
                let batchProof = {
                    batchId: BigInt(obj.batch_id),
                    startBlockHeight: BigInt(obj.batch_range.start_block_height),
                    endBlockHeight: BigInt(obj.batch_range.end_block_height),
                    startTxSid: BigInt(obj.batch_range.start_tx_seq_id),
                    endTxSid: BigInt(obj.batch_range.end_tx_seq_id),
                    aggProof: obj.agg_proof,
                }
                
                let txNumber = Number(
                    batchProof.endTxSid -
                    batchProof.startTxSid +
                    1n
                )
                if (txNumber < 1) {
                    throw new Error(
                        `Idle: batch id ${batchId}, tx number should be larger than 0, but got ${txNumber}`
                    )
                }

                return batchProof
            }
            else {
                return null
            }
        }
    }

    /**
     * Get object of specified key from bucket
     * 
     * @param bucket 
     * @param key 
     * @returns 
     */
    private async getObject(bucket: string, key: string): Promise<any> {
      try {
        let path = this.config.path
        if (path && path.length > 0) {
            if (path.endsWith('/')) {
                key = path + key
            } else {
                key = path + '/' + key
            }
        }
        const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        let response = await this.s3client.send(getObjectCommand);
        let obj = JSON.parse(await response.Body!.transformToString());
        return obj;
      } catch (err) {
        logger.error('get s3 object failed: ', err);
        return null;
      }
    }
}