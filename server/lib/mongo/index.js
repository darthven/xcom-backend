"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Mongo {
    async connect(options) {
        this.client = await mongodb_1.MongoClient.connect(options.url, { useNewUrlParser: true });
        this._db = this.client.db(options.dbName);
    }
    async close() {
        return this.client.close();
    }
    getDB(dbName) {
        return this.client.db(dbName);
    }
    get db() {
        return this._db;
    }
}
exports.default = new Mongo();
