/**
 * Used to provide rpc services to clients
 */


import express from "express";
import { ODLTRecord } from '../omniverse/odlt';
import cors from "cors";

export default function(odlt: ODLTRecord, app: express.Application) {
    app.use(cors());

    // Get latest batch data
    app.get("/api/getLatestBatchInfo", async (req, res) => {
        res.json(await global.db.getLatestBatchData())
    });

    // Get batch data of specified batch id
    app.get("/api/getBatch", async (req, res) => {
        const batchId = req.query['batchId'] as string;
        let ret = await global.db.getBatchData(BigInt(batchId));
        res.json(ret);
    });
}