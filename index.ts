import express from "express";
import registerRouters from "./rpc/index";
import Monitor from "./monitor/index";
import {ODLTRecord} from "./omniverse/odlt";
import {init} from "./database/index";
import config from "./config/config";

async function main(){
    await init();
   
    const odlt = new ODLTRecord(config.receipt);
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
    console.log('UnhanledRejection', err);
});

process.on('uncaughtException', (err) => {
    console.log('UnhanledException', err);
});