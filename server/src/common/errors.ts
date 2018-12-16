import { HttpError } from 'routing-controllers'
import { InvalidCoupon } from './invalidCoupon'

export class ManzanaError extends Error {
    private errorCode!: number

    constructor(errorCode: number, errorMsg: string) {
        super(errorMsg)
        this.name = 'ManzanaError'
        this.errorCode = errorCode
    }
}
export class CouponError extends ManzanaError {
    private invalidCoupons!: InvalidCoupon[]

    constructor(errorCode: number, errorMsg: string, invalidCoupons: InvalidCoupon[]) {
        super(errorCode, errorMsg /*'Coupons cannot be used'*/)
        this.name = 'CouponError'
        this.invalidCoupons = invalidCoupons
    }
}

export class CardNotFound extends ManzanaError {
    private invalidCard!: string

    constructor(errorCode: number, errorMsg: string, invalidCard: string) {
        super(errorCode, errorMsg)
        this.name = 'CardNotFound'
        this.invalidCard = invalidCard
    }
}

export class PriceError extends HttpError {
    private storeId: number
    private goodsIds: number[]

    constructor(errorMsg: string, storeId: number, goodsIds: number[]) {
        super(426, errorMsg /*'Cannot get prices for goods. Wrong "storeId" or "goodsIds" are defined.'*/)
        this.name = 'PriceError'
        this.storeId = storeId
        this.goodsIds = goodsIds
    }
}
