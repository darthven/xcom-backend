import { ObjectID } from 'bson'
import { EcomOrder } from '../../ecom/ecomOrder'

export interface Order extends EcomOrder {
    /**
     * Initialized in repository after insertion to mongo with bson id
     */
    extId: string

    /**
     * Stored locally for efficient payment gateway user lookup
     */
    INN: string

    /**
     * Ecom order id (assigned after submission to ecom)
     */
    id?: number

    /**
     * External payment gateway id (orderId from sbol)
     */
    payGUID?: string
}
