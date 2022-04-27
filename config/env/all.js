// default app configuration
const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI || "mongodb://<username>:<password>@cluster0-shard-00-00.dg2at.mongodb.net:27017,cluster0-shard-00-01.dg2at.mongodb.net:27017,cluster0-shard-00-02.dg2at.mongodb.net:27017/owaspdb?ssl=true&replicaSet=atlas-12mhjn-shard-0&authSource=admin&retryWrites=true&w=majority";

module.exports = {
    port,
    db,
    cookieSecret: "session_cookie_secret_key_here",
    cryptoKey: "a_secure_key_for_crypto_here",
    cryptoAlgo: "aes256",
    hostName: "localhost",
    environmentalScripts: []
};

