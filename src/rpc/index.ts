/**
 * Used to provide rpc services to clients
 */


import express from "express";
import { BatchData, ODLTRecord } from '../omniverse/odlt';
import cors from "cors";

export default function(odlt: ODLTRecord, app: express.Application) {
    app.use(cors());

    // Get latest batch data
    app.get("/api/getLatestBatchData", async (req, res) => {
        res.json(await global.db.getLatestBatchData())
    });

    // Get batch data of specified batch id
    app.get("/api/getBatch", async (req, res) => {
        const batchId = req.query['batchId'] as string;
        let data = await global.db.getBatchData(BigInt(batchId));
        let ret: any = null;
        if (data) {
            let batchData: BatchData = data!;
            ret = {
                proof: {
                    batchId: batchData.proof.batchId.toString(),
                    startBlockHeight: batchData.proof.startBlockHeight.toString(),
                    endBlockHeight: batchData.proof.endBlockHeight.toString(),
                    startTxSid: batchData.proof.startTxSid.toString(),
                    endTxSid: batchData.proof.endTxSid.toString(),
                },
                btcBlockHeight: batchData.btcBlockHeight,
                txid: batchData.txid,
                index: batchData.index,
                receipt: batchData.receipt,
                value: batchData.value,
                scriptRoot: batchData.scriptRoot
            }
        }
        res.json(ret);
    });
}