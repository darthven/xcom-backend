import { ClientSession, Db, MongoClient } from 'mongodb'
import logger from '../config/logger.config'

export interface MongoOptions {
    url: string
    dbName: string
}

class Mongo {
    private _db!: Db
    private _client!: MongoClient

    public async connect(options: MongoOptions) {
        this._client = await MongoClient.connect(
            options.url,
            { useNewUrlParser: true }
        )
        this._db = this._client.db(options.dbName)
    }

    public async close() {
        return this._client.close()
    }

    public getDB(dbName: string) {
        return this._client.db(dbName)
    }

    get db() {
        return this._db
    }

    public async transaction(transaction: (session: ClientSession) => Promise<any>) {
        // not supported on single-node mongo :(
        const session = this._client.startSession()
        session.startTransaction()
        try {
            await transaction(session)
            await this.commitWithRetry(session)
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    private async commitWithRetry(session: ClientSession) {
        try {
            await session.commitTransaction()
            logger.debug('Transaction committed.')
        } catch (error) {
            if (error.errorLabels && error.errorLabels.indexOf('UnknownTransactionCommitResult') >= 0) {
                logger.warn('UnknownTransactionCommitResult, retrying commit operation ...')
                await this.commitWithRetry(session)
            } else {
                logger.error('Error during commit ...')
                throw error
            }
        }
    }
}

export default new Mongo()
