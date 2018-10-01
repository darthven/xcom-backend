interface ChequeRequest {
    cardNumber: string
    dateTime: Date
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
}

interface SoftChequeRequest extends ChequeRequest {
    type: 'Soft'
}

interface FiscalChequeRequest extends ChequeRequest {
    type: 'Fiscal'
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

export { SoftChequeRequest, FiscalChequeRequest }
