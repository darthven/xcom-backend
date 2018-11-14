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
