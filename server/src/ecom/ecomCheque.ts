import { Cheque } from '../common/cheque'
import { EcomChequeItem } from './ecomChequeItem'

export interface EcomCheque extends Cheque {
    basket: EcomChequeItem[]
}
