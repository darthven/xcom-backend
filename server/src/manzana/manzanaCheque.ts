import { ManzanaChequeItem } from './manzanaChequeItem'

export interface ManzanaCheque {
    /**
     * Всего начислено баллов
     */
    chargedBonus: number

    /**
     * Начислено статусных баллов
     */
    chargedStatusBonus: number

    /**
     * Всего списано баллов
     */
    writeOffBonus: number

    /**
     * Списано статусных баллов
     */
    writeOffStatusBonus: number

    /**
     * Всего начислено активных бонусных баллов
     */
    activeChargedBonus: number

    /**
     * Всего начислено активных статусных бонусных баллов
     */
    activeChargedStatusBonus: number

    amount: number // total amount

    amountDiscounted: number // total amount discounted

    discount: number // discount

    basket: ManzanaChequeItem[]
}
