import { HttpError } from 'routing-controllers'
import { InvalidCoupon } from './invalidCoupon'

export class CouponError extends HttpError {
    private invalidCoupons: InvalidCoupon[]

    constructor(invalidCoupons: InvalidCoupon[]) {
        super(425, 'Coupons are invalid')
        this.name = 'CouponError'
        this.invalidCoupons = invalidCoupons
    }
}

export class PriceError extends HttpError {
    private storeId: number
    private goodsIds: number[]

    constructor(storeId: number, goodsIds: number[]) {
        super(426, 'Cannot get prices for goods. Wrong "storeId" or "goodsIds" are defined.')
        this.name = 'PriceError'
        this.storeId = storeId
        this.goodsIds = goodsIds
    }
}
