/**
 * Used to provide rpc services to clients
 */


import express from "express";
import { ODLTRecord, Batch } from '../omniverse/odlt';
import cors from "cors";

export default function(odlt: ODLTRecord, app: express.Application) {
    app.use(cors());

    app.get("/api/getLatestBatchInfo", (req, res) => {
        if (odlt.batches.length == 0) {
            res.json(null);
        }
        else {
            res.json(odlt.batches[odlt.batches.length - 1]);
        }
    });


    app.get("/api/getBatch", (req, res) => {
        const batchId = req.query['batchId'] as string;
        let ret = odlt.getBatch(parseInt(batchId));
        if (ret) {
            res.json(ret);
        }
        else {
            res.json({
                error: 'Block not exist'
            })
        }
    });
}