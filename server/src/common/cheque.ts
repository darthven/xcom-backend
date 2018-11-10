import { ChequeItem } from './chequeItem'

export interface Cheque {
    basket: ChequeItem[]
    amount: number // total amount
    discount: number // total discount
}
