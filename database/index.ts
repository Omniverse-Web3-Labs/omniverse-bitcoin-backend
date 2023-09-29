/**
 * Used to store persistence omniverse transactions
 */

import { MongoClient } from "mongodb";
const auth = {
  user: '',
  password: '',
}

export const dbname = "odlt";

export const client = new MongoClient("mongodb://127.0.0.1:27017", {
    minPoolSize: 10,
    maxPoolSize: 50,
});

export async function init() {
    await client.connect();
}


/*
import mongoose from "mongoose";
const url = "mongodb://127.0.0.1:27017";

//1.连接数据库
mongoose.connect(url,{});

mongoose.connection.on('connected',function(){
    console.log('连接成功：',url);
})
//3.连接失败
mongoose.connection.on('error',function(err){
    console.log('连接错误：',err);
})
//4.断开连接
mongoose.connection.on('disconnection',function(){
    console.log('断开连接');
})

module.exports = mongoose;
*/




/*
import { RxDatabase, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';

export let db:RxDatabase;

export async function init() {
    db = await createRxDatabase({
        name: 'odlt',
        storage: getRxStorageMemory()
    });

    const transactionSchema = {
        version: 0,
        primaryKey: {
            key: 'id',
            fields: ['from', 'nonce'],
            separator: '|',
        },
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            txIndex: {
                type: 'string',
            },
            blockHash: {
                type: 'string'
            },
            nonce: {
                type: 'string',
                maxLength: 130,
            },
            initiateSC: {
                type: 'string',
                maxLength: 128,
            },
            chainId: {
                type: 'string',
            },
            from: {
                type: 'string',
                maxLength: 128,
            },
            signature: {
                type: 'string',
                maxLength: 128,
            },
            payload: {
                type: 'object',
                properties: {
                    op: {
                        type: 'string',
                        maxLength: 1,
                    },
                    exData: {
                        type: 'string',
                        maxLength: 128,
                    },
                    amount: {
                        type: 'number',
                    },
                },
            },
        },
    };

    const userSchema = {   
        version: 0,
        primaryKey: 'pk',
        type: 'object',
        properties: {
            pk: {
                type: 'string',
                maxLength: 128
            },
            amount: {
                type: 'number',
            },
        },
    }
    await db.addCollections({transaction: {schema: transactionSchema}})
    await db.addCollections({user: {schema: userSchema}})
}
*/