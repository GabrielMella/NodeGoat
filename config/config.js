const _ = require("underscore");
const path = require("path");

const finalEnv = process.env.NODE_ENV || "development";

const allConf = require(path.resolve(__dirname + "/../config/env/all.js"));
const envConf = require(path.resolve(__dirname + "/../config/env/" + finalEnv.toLowerCase() + ".js")) || {};

const config = { ...allConf, ...envConf };

if (!config.cookieSecret || !config.cryptoKey) {
    throw new Error(
        "Required environment variables COOKIE_SECRET and CRYPTO_KEY must be set and non-empty before starting the application."
    );
}

module.exports = config;
