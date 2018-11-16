import { ObjectId } from 'bson'
import { InsertOneWriteOpResult } from 'mongodb'
import { Service } from 'typedi'
import { EcomOrder } from '../../ecom/ecomOrder'
import { Order } from '../entity/order'
import { Repository } from './repository'
import { INN } from './stores'

/**
 * Used as a temporary order storage for payment gateway processing.
 * Not served for users.
 * IMPORTANT!:
 * 1. '_id' a.k.a extId - local order id (xcom) and sbol primary order number
 * 2. 'id' is an internal e-com number
 */
@Service()
export class OrdersRepository extends Repository {
    constructor() {
        super('orders')
    }

    public async findById(id: string): Promise<Order> {
        return this.collection
            .aggregate([
                {
                    $match: { _id: new ObjectId(id) }
                },
                {
                    $project: {
                        _id: 0,
                        extId: {
                            $toString: '$_id'
                        }
                    }
                }
            ])
            .next()
    }

    public async insert(order: EcomOrder & INN): Promise<Order> {
        const writeResult = await this.collection.insertOne(order)
        return {
            ...order,
            extId: writeResult.insertedId.toHexString()
        }
    }

    public async updateById(extId: string, fields: any) {
        await this.collection.updateOne({ _id: extId }, { $set: fields })
    }
}
