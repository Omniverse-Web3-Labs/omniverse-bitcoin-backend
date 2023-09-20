/**
 * Implementation of omniverse dlt, used to record all omniverse transactions
 */

import {ODLT} from '@hthuang/bitcoin-lib/dist';

export interface User {
    pk: string;
    amount: bigint;
    transactions: Map<string, ODLT.ODLTTransaction[]> ;
    transactionCount: bigint;
    isMalicious: boolean;
}

export interface Member {
    chainId: number;
    contractAddr: string;
}

export interface Payload {
    op: string;
    exData: string;
    amount: bigint;
}

class ODLTRecord {
    users: Map<string, User> = new Map();
    members: Member[] = [];

    transactionEquals(t1: ODLT.ODLTTransaction, t2: ODLT.ODLTTransaction): boolean {
        return JSON.stringify(t1) == JSON.stringify(t2);
        /*
        if (t1.blockHash == t2.blockHash && 
            t1.txIndex == t2.txIndex && 
            t1.tx.chainId == t2.tx.chainId &&
            t1.tx.from == t2.tx.from &&
            t1.tx.initiateSC == t2.tx.initiateSC &&
            t1.tx.nonce == t2.tx.nonce
            ) {
            return true;
        }*/
        //return false;
    }

    saveTransaction(transaction: ODLT.ODLTTransaction) {
        const payload = JSON.parse(transaction.tx.payload) as Payload;
        payload.amount = BigInt(payload.amount);
        
        //更新或获取用户信息
        let fromUser = this.users.get(transaction.tx.from);
        if (fromUser == undefined) {
            fromUser = {
                pk: transaction.tx.from,
                amount: BigInt(0),
                transactions: new Map(),
                transactionCount: BigInt(0),
                isMalicious: false,
            }
            this.users.set(transaction.tx.from, fromUser);
        }

        let toUserPk = payload.exData
        if (!toUserPk.startsWith("0x")) {
            toUserPk = "0x" + toUserPk
        }
        let toUser = this.users.get(toUserPk);
        if (toUser == undefined) {
            toUser = {
                pk: toUserPk,
                amount: BigInt(0),
                transactions: new Map(),
                transactionCount: BigInt(0),
                isMalicious: false,
            }
            this.users.set(toUserPk, toUser);
        }
        //更新member信息
        let hasMember = false;
        for (const i in this.members) {
            if (this.members[i].chainId == transaction.tx.chainId) {
                hasMember = true;
            }
        }
        if (!hasMember) {
            this.members.push({
                chainId: +transaction.tx.chainId,
                contractAddr: transaction.tx.initiateSC,
            })
        }

        // 插入并检查交易是否重复
        let transactions = fromUser.transactions.get(transaction.tx.nonce.toString());
        if (transactions == undefined) {
            transactions = [];
            fromUser.transactions.set(transaction.tx.nonce.toString(), transactions);
        }
        if (transactions.length == 0) {
            transactions.push(transaction)
            fromUser.transactionCount++;
        } else {
            let eq = false;
            for (const i in transactions) {
                const item = transactions[i]
                if (this.transactionEquals(item, transaction)) {
                    eq = true;
                    continue;
                } 
            }
            if (!eq) {
                transactions.push(transaction)
                fromUser.transactionCount++;
                fromUser.isMalicious = true;
            }
        }

        if (fromUser.isMalicious) {
            return;
        }

        switch(+payload.op) {
            case 0: fromUser.amount -= payload.amount; toUser.amount += payload.amount ;break;
            case 1: toUser.amount += payload.amount; break;
            case 2: toUser.amount -= payload.amount;break;
            default: break;
        }
    }
}

export default new ODLTRecord()