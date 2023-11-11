import express from "express";
import registerRouters from "./rpc/index";
import Monitor from "./monitor/index";
import {init} from "./database/index";

async function main(){
    await init();
   
    const monitor = new Monitor();
    monitor.start();
    const app: express.Application = express();

    registerRouters(app)

    app.listen(3000, () => {
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