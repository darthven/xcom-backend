import Mongo from '..'

export abstract class Repository {
    public readonly name: string

    protected constructor(name: string) {
        this.name = name
    }

    public async createCollection() {
        await Mongo.db.createCollection(this.name)
    }

    public async dropCollection() {
        try {
            await Mongo.db.dropCollection(this.name)
        } catch (e) {
            return null
        }
    }

    get collection() {
        return Mongo.db.collection(this.name)
    }
}
