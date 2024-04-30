import express from "express";
import registerRouters from "./rpc/index";
import Monitor from "./monitor/index";
import {logger} from "./utils";
import {ODLTRecord} from "./omniverse/odlt";
import {DB, S3} from "./database";

async function main(){
    global.db = new DB();
    global.s3 = new S3();
   
    const odlt = new ODLTRecord();
    const monitor = new Monitor();
    monitor.start((block: any) => {odlt.handleBlock(block);});
    const app: express.Application = express();

    registerRouters(odlt, app)

    app.listen(3000, '0.0.0.0', () => {
        console.log('server start at 3000');
    });
}

main();
process.on('unhandledRejection', (err) => {
    logger.error('UnhanledRejection', err);
});

process.on('uncaughtException', (err) => {
    console.log('UnhanledException', err);
    if (err instanceof Error) {
        if (err.message.includes('Fatal')) {
            process.exit();
        }
    }
});