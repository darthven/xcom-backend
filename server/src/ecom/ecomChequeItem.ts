import { IsDefined, IsInt } from 'class-validator'
import { ChequeItem } from '../common/chequeItem'

export interface EcomChequeItem extends ChequeItem {
    batch?: string // Идентификатор партии
    analogAllow?: boolean // Признак, искать по всем аналогам. (используется для предзаказов товара)
}
