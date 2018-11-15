import { IsDefined, IsInt } from 'class-validator'
import { Item } from '../common/item'

export interface ManzanaChequeItem extends Item {
    // TODO: additional fields returned with manzana cheque
    // TODO: per-item bonus?
    price: number // Цена
    amount: number // Сумма по строке. (Если передается сумма по строке и она меньше кол-во*цена, то рассчитывается скидка)
    discount: number // Сумма скидки. (Если не передается сумма по строке, то сумма рассчитывается кол-во*цена - сумма скидки)
    availablePayment: number
    chargedBonus: number
    chargedStatusBonus: number
    writeoffBonus: number
    writeoffStatusBonus: number
    activeChargedBonus: number
    activeChargedStatusBonus: number
}
