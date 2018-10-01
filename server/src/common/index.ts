interface ChequeRequest {
    type: 'Soft' | 'Fiscal'
    cardNumber: string
    operationType: string
    summ: number
    paidByBonus?: number
    items: [
        {
            id: number
            article: string
            count: number
            price: number
            summ: number
        }
    ]
    coupons?: [
        {
            number: string
        },
        {
            emissionId: string
        },
        {
            typeId: string
        }
    ]
}

export { ChequeRequest }
