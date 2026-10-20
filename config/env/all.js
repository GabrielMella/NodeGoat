// default app configuration
const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

if (!process.env.CRYPTO_KEY) {
    throw new Error("Required environment variable CRYPTO_KEY is not set. " +
        "This key is used to encrypt sensitive PII fields (SSN, DOB, bank account).");
}

module.exports = {
    port,
    db,
    cookieSecret: "session_cookie_secret_key_here",
    cryptoKey: process.env.CRYPTO_KEY,
    cryptoAlgo: "aes-256-cbc",
    hostName: "localhost",
    environmentalScripts: []
};

