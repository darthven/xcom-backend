import { Db } from 'mongodb';
export interface MongoOptions {
    url: string;
    dbName: string;
}
declare class Mongo {
    private _db;
    private client;
    connect(options: MongoOptions): Promise<void>;
    close(): Promise<void>;
    getDB(dbName: string): Db;
    readonly db: Db;
}
declare const _default: Mongo;
export default _default;
