"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class Repository {
    constructor(name) {
        this.name = name;
    }
    async createCollection() {
        await index_1.default.db.createCollection(this.name);
    }
    async dropCollection() {
        try {
            await index_1.default.db.dropCollection(this.name);
        }
        catch (e) {
            return null;
        }
    }
    get collection() {
        return index_1.default.db.collection(this.name);
    }
}
exports.Repository = Repository;
