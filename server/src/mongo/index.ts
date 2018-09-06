import { Db, MongoClient } from 'mongodb'

export interface MongoOptions {
    url: string
    dbName: string
}

class Mongo {
    private _db!: Db
    private client!: MongoClient

    public async connect(options: MongoOptions) {
        this.client = await MongoClient.connect(
            options.url,
            { useNewUrlParser: true }
        )
        this._db = this.client.db(options.dbName)
    }
    public async close() {
        return this.client.close()
    }
    public getDB(dbName: string) {
        return this.client.db(dbName)
    }
    get db() {
        return this._db
    }
}

export default new Mongo()
