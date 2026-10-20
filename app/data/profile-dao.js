/* The ProfileDAO must be constructed with a connected database object */
function ProfileDAO(db) {

    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ProfileDAO)) {
        console.log("Warning: ProfileDAO constructor called without 'new' operator");
        return new ProfileDAO(db);
    }

    const users = db.collection("users");

    // Use crypto module to store sensitive PII fields encrypted at rest
    const crypto = require("crypto");
    const config = require("../../config/config");

    // Derive a fixed-length 32-byte key from the configured cryptoKey
    const getKey = () => crypto.createHash("sha256").update(String(config.cryptoKey)).digest();

    // Encrypt a value using AES-256-CBC with a fresh random 16-byte IV.
    // Returns "<ivHex>:<ciphertextHex>" so the IV is self-contained for decryption.
    const encrypt = (toEncrypt) => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
        const encrypted = cipher.update(String(toEncrypt), "utf8", "hex") + cipher.final("hex");
        return `${iv.toString("hex")}:${encrypted}`;
    };

    // Decrypt a value previously produced by encrypt().
    const decrypt = (toDecrypt) => {
        const [ivHex, encrypted] = toDecrypt.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
        return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
    };

    this.updateUser = (userId, firstName, lastName, ssn, dob, address, bankAcc, bankRouting, callback) => {

        // Create user document
        const user = {};
        if (firstName) {
            user.firstName = firstName;
        }
        if (lastName) {
            user.lastName = lastName;
        }
        if (address) {
            user.address = address;
        }
        // Encrypt sensitive PII fields before storing in MongoDB
        if (bankAcc) {
            user.bankAcc = encrypt(bankAcc);
        }
        if (bankRouting) {
            user.bankRouting = encrypt(bankRouting);
        }
        if (ssn) {
            user.ssn = encrypt(ssn);
        }
        if (dob) {
            user.dob = encrypt(dob);
        }

        users.update({
                _id: parseInt(userId)
            }, {
                $set: user
            },
            err => {
                if (!err) {
                    console.log("Updated user profile");
                    return callback(null, user);
                }

                return callback(err, null);
            }
        );
    };

    this.getByUserId = (userId, callback) => {
        users.findOne({
                _id: parseInt(userId)
            },
            (err, user) => {
                if (err) return callback(err, null);
                // Decrypt sensitive PII fields before returning to the application
                if (user.ssn) { user.ssn = decrypt(user.ssn); }
                if (user.dob) { user.dob = decrypt(user.dob); }
                if (user.bankAcc) { user.bankAcc = decrypt(user.bankAcc); }
                if (user.bankRouting) { user.bankRouting = decrypt(user.bankRouting); }

                callback(null, user);
            }
        );
    };
}

module.exports = { ProfileDAO };
