const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

const app = express();
app.use(express.json());
app.use(express.static('html'));

// You are not going to be able to get this hooman
SECRET_KEY = crypto.randomBytes(64);

GUEST_ACCOUNT = "peasant-hooman";
ADMIN_ACCOUNT = "superior-emu";
BASE_FLAG = "w4iT_wHeR3_d1D_u_g1T_d4t_k3y";
HMAC_SECRET = process.env.HMAC_SECRET;


function generateFlag(studentId) {
    const suffix = crypto.createHmac('sha256', HMAC_SECRET)
        .update(String(studentId))
        .digest('hex')
        .slice(0, 8);
    return `UWA{${BASE_FLAG}_${suffix}}`;
}


/**
 * Downloads and returns the contents of a file on the internet
 */
async function downloadFromUrl(url) {
    const proto = !url.charAt(4).localeCompare('s') ? https : http;
    return new Promise((resolve, reject) => {
        proto.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body))
        }).on('error', reject);
    })
}


/**
 * JWT Token validation
 * 
 * Supports both HS256 and RS256 signed JWTs!
 */
async function validateJwt(jwtToken) {
    // We want to allow Emus to use both HS256 and RS256 signing algos
    const decodedJwt = jwt.decode(jwtToken, {complete: true});
    if ( !decodedJwt ) {
        throw Error("where JWT at??")
    }
    const decodedHeader = decodedJwt.header, decodedBody = decodedJwt.payload;
    const signingAlgo = decodedHeader.alg;

    // We only allow HS256 or RS256 signing algos
    if (!["HS256", "RS256"].includes(signingAlgo)) {
        throw Error("invalid algorithm in JWT");
    }

    key = SECRET_KEY;

    if (signingAlgo === "RS256") {
        // Grab where the RS256 public key URL from the "iss" claim in the JWT body
        // We currently haven't figured out how to sign our own RS256 JWTs yet...
        const issuerUrl = decodedBody.iss;

        // Make sure those hoomans aren't hacking with something like file://
        const regExp = new RegExp("^https?://");
        if (!regExp.test(issuerUrl)) {
            throw Error("invalid URL in iss claim");
        }
        
        // Should be fine to download the public key
        key = await downloadFromUrl(issuerUrl);
    }

    // Verify the JWT token
    return jwt.verify(jwtToken, key);
}


/**
 * Only for giving hoomans "guest" access
 * 
 * Emus will be privately sent their JWT token
 */
function createJwt() {
    return jwt.sign(
        {
            username: GUEST_ACCOUNT // JWT body will just by {"username": "peasant-hooman"}
        },
        SECRET_KEY, // Top secret signing key not for hoomans
        {
            algorithm: "HS256" // Signing the JWT using the HS256 signing algo
        }
    )
}


app.post('/api/validate/jwt', async (req, res) => {
    try {
        // Grab the JWT from the JSON request
        const jwtToken = req.body.jwt;

        // Verify the token
        const verifiedToken = await validateJwt(jwtToken);

        // If the username is "superior-emu" in the JWT then give them the pressie
        if (verifiedToken.username === ADMIN_ACCOUNT) {
            const studentId = verifiedToken.student_id;
            if (!studentId) {
                res.status(403).send({msg: "Greetings, emu! The EIA needs your student ID to log this infiltration. Add a 'student_id' claim to your JWT!"});
                return;
            }
            res.send({msg: `Welcome, emu operative! The EIA has logged your infiltration. Here is your flag: ${generateFlag(studentId)}`});
        } else {
            res.status(403).send({msg: "Looool hooman, this is only for emus!"})
        }
    } catch (error) {
        res.status(500).send({msg: `Bugger off hooman hacker! You broke my site! I got some '${error.message}' error message.`})
    }
});


app.get('/api/get/jwt', (req, res) => {
    res.send({msg: `Here is your JWT token hooman: ${createJwt()}`})
});


app.get('/', (req, res) => {
    res.redirect("/index.html");
});


app.listen(3000, () => console.log("App listening on port 3000"));