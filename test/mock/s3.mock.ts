class S3 {
    proofs: any;

    constructor() {
        this.proofs = {}
    }

    clear() {
        this.proofs = {}
    }

    run() {}

    // set mock data
    setBatchProof(batchId: bigint, proof: object) {
        this.proofs[batchId.toString()] = proof
    }

    queryBatchProof(batchId: bigint) {
        return this.proofs[batchId.toString()]
    }
}

module.exports = new S3()
