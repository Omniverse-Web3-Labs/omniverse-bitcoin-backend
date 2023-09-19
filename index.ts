import express = require("express");
import Monitor from "./monitor/index";


const monitor = new Monitor();
monitor.start()


const app: express.Application = express();


app.get("/", (req, res) => {
    res.write('<h1>Welcome!</h2>');
    res.end();
});


app.listen(3000, () => {
    console.log('server start at 3000')
});
