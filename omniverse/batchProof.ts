export interface BatchProof {
    // batch id of omniverse
    batchId: bigint,
    startBlockHeight: bigint,
    endBlockHeight: bigint,
    startTxSid: bigint,
    endTxSid: bigint,
}

/**
 * A class to deal with batch proof, and calculate p2tr output
 */
export class CommittedBatch {
    // batch id of omniverse
    batchId: number = 0;
    // batch proof
    proof?: BatchProof = undefined;

    constructor() {

    }

    /**
     * Fetch data from S3, from which calculate p2tr output.
     * 
     * @dev If `this.proof` is not undefined, wait for a transction commit to the p2tr output, and set it to undefined
     * 
     * If `this.proof` is undefined, update it using the data fetched from S3.
     */
    update() {

    }

    /**
     * A loop to call update periodically
     */
    run() {

    }

    /**
     * Calculates and returns p2tr output
     * 
     * @returns {null | string} `null` if there is no proof data, `string` or else
     */
    getP2trOutput() {
        return null;
    }
}