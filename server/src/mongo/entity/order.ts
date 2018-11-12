import { ObjectID } from 'bson'
import { EcomOrder } from '../../common/ecomOrder'

export interface Order extends EcomOrder {
    /**
     * Initialized in repository after insertion to mongo with bson id
     */
    extId: string
}
