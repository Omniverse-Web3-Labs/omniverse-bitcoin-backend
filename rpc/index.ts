/**
 * Used to provide rpc services to clients
 */


import express from "express";
import record, { User } from '../omniverse/odlt';
import cors from "cors";

export default function(app: express.Application) {
    app.use(cors());
    app.get("/api/omniverseBalanceOf", (req, res) => {
        const pk = req.query['pk'] as string;
        const user = record.users.get(pk);
        if (user == undefined) {
            res.json({
                'error': 'user not found'
            })
          return;
        }
        res.json({
            result: user.amount,
        });
    });
    
    app.get("/api/getMembers", (req, res) => {
        res.json({
            result: record.members,
        })
    });

    app.get("/api/getTransactionCount", (req, res) => {
        const pk = req.query['pk'] as string;
        const user = record.users.get(pk);
        if (user == undefined) {
            res.json({
                'error': 'user not found'
            })
          return;
        }
        res.json({
            result: user.transactionCount,
        });
    });


    app.get("/api/getTransactionData", (req, res) => {
        const pk = req.query['pk'] as string;
        const nonce = BigInt(req.query['nonce'] as string);
        const user = record.users.get(pk);
        if (user == undefined) {
            res.json({
                'error': 'user not found'
            })
            return;
        }
        const transactions = user.transactions.get(nonce.toString())
        if (transactions == undefined || transactions.length == 0) {
            res.json({
                'error': 'transaction not found'
            })
            return;
        }
        res.json({
            result: {
                data: transactions[0],
            },
        });
    });

    app.get("/api/getChainId", (req, res) => {
        res.json({
            result: 1,
        });
    });

    app.get("/api/isMalicious", (req, res) => {
        const pk = req.query['pk'] as string;
        const user = record.users.get(pk);
        if (user == undefined) {
            res.json({
                'error': 'user not found'
            })
          return;
        }
        res.json({
            result: user.isMalicious,
        });
    });
}