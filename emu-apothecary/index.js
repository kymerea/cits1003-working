/**
 * IMPORTANT FOR STUDENTS!
 * 
 * Ignore this part of the code, the reason why this is here is because Prototype Pollution
 * vulnerabilities would normally cause a permanent change when exploited.
 * 
 * This code is to prevent a permanent change occurring after exploitation
 * 
 * The key take away is that the user input is the URL parameters (req.query).
 * e.g. /?this=is&url[params]=example would result in the following input.
 * {"this":"is", "url": {"params": "example"}}
 * 
 * The main vulnerable code you want to look at is in polluteme.js
 */

const express = require('express');
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");

const app  = express();
app.use(express.static("public"))

const execPolluteMe =(filePath) => {
    const output = childProcess.execSync(`node polluteme.js ${filePath}`);
    return output
}

app.get("/", async (req, res) => {
    try {
        const requestParams = req.query ?? {};
        const filePath = path.join("/tmp", `${crypto.randomBytes(8).toString("hex")}`);
        fs.writeFileSync(filePath, JSON.stringify(requestParams));
        const result = execPolluteMe(filePath);
        fs.unlinkSync(filePath);
        res.type('html').send(result);
    } catch (e) {
        console.error(e);
        res.status(500).send("something goofed")
    }
});

app.listen(3000, () => { console.log("listening on port 3000") })