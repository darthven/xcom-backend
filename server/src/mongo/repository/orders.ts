import { ObjectId } from 'bson'
import { InsertOneWriteOpResult } from 'mongodb'
import { Service } from 'typedi'
import { EcomOrder } from '../../ecom/ecomOrder'
import { Order } from '../entity/order'
import { Repository } from './repository'
import { INN } from './stores'

/**
 * Used as a temporary order storage for payment gateway processing.
 * Not served for users
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
}
