import {IS3} from '../../src/database/interfaces';

export default class S3 implements IS3 {
    proofs: any;
    latestBatchId: bigint;

    constructor() {
        this.proofs = {}
        this.latestBatchId = BigInt(0);
    }

    clear() {
        this.proofs = {}
    }

    run() {}

    async queryLatestBatchId(): Promise<bigint | null> {
        return this.latestBatchId;
    }

    setLatestBatchId(batchId: bigint) {
        this.latestBatchId = batchId;
    }

    // set mock data
    setBatchProof(batchId: bigint, proof: object) {
        this.proofs[batchId.toString()] = proof
    }

    queryBatchProof(batchId: bigint) {
        return this.proofs[batchId.toString()]
    }
}
