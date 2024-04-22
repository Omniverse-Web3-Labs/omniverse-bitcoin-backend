/**
 * Used to provide rpc services to clients
 */


import express from "express";
import { ODLTRecord, Block } from '../omniverse/odlt';
import cors from "cors";

export default function(odlt: ODLTRecord, app: express.Application) {
    app.use(cors());

    app.get("/api/getLatestBlockInfo", (req, res) => {
        if (odlt.blocks.length == 0) {
            res.json(null);
        }
        else {
            res.json(odlt.blocks[odlt.blocks.length - 1]);
        }
    });


    app.get("/api/getBlock", (req, res) => {
        const height = req.query['height'] as string;
        let ret = odlt.getBlockByHeight(parseInt(height));
        if (ret) {
            res.json(ret);
        }
        else {
            res.json({
                error: 'Block not exist'
            })
        }
    });

    app.get("/api/commitBlockState", (req, res) => {
        const height = req.query['height'] as string;
        let receipt = req.query['receipt'] as string;
        let ret = odlt.commitReceipt(height, receipt);
        res.json({
            result: ret,
        });
    });
}