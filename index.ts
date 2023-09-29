import express from "express";
import registerRouters from "./rpc";
import Monitor from "./monitor";
import { client, init } from "./database";

async function main(){
    await init(); 
    const monitor = new Monitor();
    monitor.start()
    const app: express.Application = express();

    app.use(express.json());
    registerRouters(app)

    app.listen(3000, () => {
        console.log('server start at 3000');
    });
}

main();