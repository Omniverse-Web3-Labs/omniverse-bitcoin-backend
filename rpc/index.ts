/**
 * Used to provide rpc services to clients
 */


import express from "express";
import record, { User } from '../omniverse/odlt';
import { client, dbname } from "../database";

export default function(app: express.Application) {
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
            //result: user.amount,
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
        const transactions = user.computedTransactions.get(nonce.toString())
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


    app.post("/api/admin/setUser", async (req, res) => {
        if (!req.ip.endsWith("127.0.0.1")) {
            res.json({
                'error': 'permission not allow'
            })
            return;
        }
        const data = req.body;
        const pk = data.pk;
        const isAdmin = data.isAdmin ? true : false;
        if (typeof pk != 'string' || pk.length != 130) {
            res.json({
                'error': 'pk must be 130 length string'
            })
            return;
        }
        
        let user = await client.db(dbname).collection('user').findOne({'pk': pk});
        if (user == null) {
            const newUser = {
                pk: pk,
                isAdmin: isAdmin
            }
            const result = await client.db(dbname).collection('user').insertOne(newUser);
        } else {
            const result = await client.db(dbname).collection('user').updateOne({_id: user._id}, {
                $set: {
                    isAdmin: isAdmin,
                }              
            });
        }
        let memoryUser = record.users.get(pk)
        if (!memoryUser) {
            memoryUser = {
                pk: pk,
                amount: BigInt(0),
                computedTransactions: new Map(),
                preloadTransactions: [],
                transactionCount: BigInt(0),
                isValid: true,
                isMalicious: false,
                isAdmin: isAdmin,
            };
            record.users.set(pk, memoryUser);
        } else {
            memoryUser.isAdmin = isAdmin;
            if (!memoryUser.isValid) {
                memoryUser.isValid = true
                while(true) {
                    const transaction = memoryUser.preloadTransactions.shift()
                    if (!transaction) {
                        break;
                    }
                    record.applyTransaction(memoryUser, transaction);
                }
            }
        }
        res.json({
            'result': 'success',
        }); 
    })
}