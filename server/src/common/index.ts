interface SoftChequeRequest {
    requestId: string
    cardNumber: string
    dateTime: Date
    number: string
    operationType: string
    summ: number
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

interface FiscalChequeRequest {
    requestId: string
    cardNumber: string
    dateTime: Date
    number: string
    operationType: string
    summ: number
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

export { SoftChequeRequest, FiscalChequeRequest }
