class DB {
    batches: any;
    nextBatchId: bigint;

    constructor() {
        this.batches = {}
        this.nextBatchId = BigInt(0)
    }

    clear() {
        this.batches = {}
        this.nextBatchId = BigInt(0)
    }

    async getNextBatchId(chainName: string) {
        return this.nextBatchId
    }

    async tryInsertBatchInfo(
        batchId: bigint,
        startBlockHeight: bigint,
        endBlockHeight: bigint,
        startTxSid: bigint,
        endTxSid: bigint
    ) {
        if (batchId != this.nextBatchId) {
            return false
        }

        if (this.batches[batchId.toString()]) {
            return true
        } else {
            this.batches[batchId.toString()] = {
                batchId,
                startBlockHeight,
                endBlockHeight,
                startTxSid,
                endTxSid,
            }
            this.nextBatchId++
            return true
        }
    }

    async insertCommitment(batchId: bigint, chainName: string, txHash: string) {
        if (!this.batches[batchId.toString()]) {
            return false
        } else {
            if (!this.batches[batchId.toString()][chainName]) {
                this.batches[batchId.toString()][chainName] = txHash
                return true
            } else {
                return false
            }
        }
    }
}

module.exports = new DB()
