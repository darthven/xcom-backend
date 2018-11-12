import { IsDefined, IsInt } from 'class-validator'
import { Item } from '../common/item'

export interface EcomItem extends Item {
    batch?: string // Идентификатор партии
    storePrice: number
    ecomPrice: number
    validDate?: string
}
