/**
 * Used to provide rpc services to clients
 */


import express from "express";
import record, { Block } from '../omniverse/odlt';
import cors from "cors";

export default function(app: express.Application) {
    app.use(cors());

    app.get("/api/getNextBlockNumber", (req, res) => {
        const number = record.blocks.length;
        res.json({
            'number': number
        });
    });


    app.get("/api/getBlockByNumber", (req, res) => {
        const number = req.query['number'] as string;
        let ret = record.getBlockByNumber(parseInt(number));
        if (ret) {
            res.json(ret);
        }
        else {
            res.json({
                error: 'Block not exist'
            })
        }
    });

    app.get("/api/getChainId", (req, res) => {
        res.json({
            result: 1,
        });
    });
}