/**
 * Used to store persistence omniverse transactions
 */

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