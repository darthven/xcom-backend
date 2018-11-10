import { IsDefined, IsInt } from 'class-validator'
import { Item } from './item'

export interface ChequeItem extends Item {
    price: number // Цена
    amount?: number // Сумма по строке. (Если передается сумма по строке и она меньше кол-во*цена, то рассчитывается скидка)
    discount?: number // Сумма скидки. (Если не передается сумма по строке, то сумма рассчитывается кол-во*цена - сумма скидки)
}
