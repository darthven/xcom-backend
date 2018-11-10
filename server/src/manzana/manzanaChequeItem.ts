import { IsDefined, IsInt } from 'class-validator'
import { ChequeItem } from '../common/chequeItem'

export interface ManzanaChequeItem extends ChequeItem {
    // TODO: additional fields returned with manzana cheque
    // TODO: per-item bonus?
}
